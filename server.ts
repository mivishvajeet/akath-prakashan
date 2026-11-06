import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_BOOKS,
  INITIAL_AUTHORS,
  INITIAL_ARTICLES,
  INITIAL_EXCERPTS,
  INITIAL_READING_LISTS,
  PHASE_0_AUDIT_REPORT,
} from './src/data/seedData';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
  ReadingList,
  OrderRecord,
  ManuscriptSubmission,
  NewsletterSubscriber,
  ContactInquiry,
  AnalyticsEvent,
  CartItemInput,
  ValidatedCartLine,
  CartQuoteResponse,
  OrderStatus,
  Permission,
  BookPublicationStatus,
  SavedAddress,
  AuthorApplicationRecord,
  BookReviewRecord,
  InventoryMovementRecord,
  MediaAssetRecord,
  PromotionRecord,
  SiteSectionId,
} from './src/types/publishing';
import {
  validateEmail,
  validateIndianPhone,
  validateIndianPinCode,
  AppLanguage,
} from './src/utils/validation';
import {
  ROLE_PERMISSIONS,
  hasPermission,
  isBookPubliclyVisible,
  canUserViewBook,
  canAuthorModifyBook,
  canAccessOrderResource,
  canMutateReview,
  sanitizeRedirectPath,
  getDefaultDashboardForRole,
  validatePasswordStrength,
  validateCoverUpload,
} from './src/auth/rbac';
import {
  hashPassword,
  verifyPassword,
  generateOpaqueToken,
  hashOpaqueToken,
  SCHEMA_MIGRATIONS,
  SERVER_ADMIN_BOOTSTRAP_TOKEN,
  InternalUserRecord,
  InternalSessionRecord,
  TokenRecord,
  usersStore,
  sessionsStore,
  tokensStore,
  addressesStore,
  authorApplicationsStore,
  reviewsStore,
  securityAuditStore,
  localEmailOutbox,
  toPublicUserProfile,
  recordSecurityAudit,
  invalidateUserSessions,
  mergeCartItems,
} from './src/server/authStore';
import crypto from 'node:crypto';
import {
  inventoryMovementsStore,
  mediaAssetsStore,
  promotionsStore,
  adminNotificationsStore,
  siteConfigStore,
  parseCsvLine,
  exportBooksToCsv,
  exportInventoryLedgerToCsv,
  PAYMENT_WEBHOOK_SECRET,
  computeWebhookSignature,
  verifyPaymentWebhookSignature,
  verifyPaymentWebhookSignatureWithDetails,
  backupSnapshotsStore,
  saveCmsBackupSnapshot,
} from './src/server/cmsStore';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'akath_sid';
const SESSION_TTL_MS =
  Math.max(1, Number(process.env.SESSION_TTL_HOURS) || 24) * 60 * 60 * 1000;

app.use(
  express.json({
    limit: '6mb',
    verify: (req: AuthenticatedRequest, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

// Security & privacy headers (iframe-compatible for AI Studio preview)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ============================================================================
// RATE LIMITING & BRUTE-FORCE PROTECTION
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(
  ip: string,
  bucket: string,
  maxRequests = 35,
  windowMs = 60_000
): boolean {
  const key = `${ip}:${bucket}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

const loginThrottleStore = new Map<
  string,
  { failures: number; lockedUntil: number; firstFailureAt: number }
>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_FAILURES = 5;

function isLoginThrottled(key: string): boolean {
  const record = loginThrottleStore.get(key);
  if (!record) return false;
  const now = Date.now();
  if (record.lockedUntil > now) return true;
  if (now - record.firstFailureAt > LOGIN_WINDOW_MS) {
    loginThrottleStore.delete(key);
    return false;
  }
  return false;
}

function recordLoginFailure(key: string): boolean {
  const now = Date.now();
  const existing = loginThrottleStore.get(key);
  if (!existing || now - existing.firstFailureAt > LOGIN_WINDOW_MS) {
    loginThrottleStore.set(key, {
      failures: 1,
      firstFailureAt: now,
      lockedUntil: 0,
    });
    return false;
  }
  existing.failures += 1;
  if (existing.failures >= LOGIN_MAX_FAILURES) {
    existing.lockedUntil = now + LOGIN_WINDOW_MS;
    return true;
  }
  return false;
}

function clearLoginFailures(key: string): void {
  loginThrottleStore.delete(key);
}

// ============================================================================
// AUTHORITATIVE SERVER-SIDE DATA STORES
// ============================================================================

const booksStore: BookRecord[] = structuredClone(INITIAL_BOOKS).map((book) => ({
  ...book,
  publicationStatus: 'published' as BookPublicationStatus,
  ownerUserId:
    book.authorId === 'author-g-k-ainapure'
      ? 'usr-seed-author-1'
      : undefined,
}));

const authorsStore: AuthorRecord[] = structuredClone(INITIAL_AUTHORS).map(
  (author) => ({
    ...author,
    ownerUserId:
      author.id === 'author-g-k-ainapure'
        ? 'usr-seed-author-1'
        : undefined,
  })
);

const articlesStore: EditorialArticle[] = structuredClone(INITIAL_ARTICLES);
const excerptsStore: FirstPageExcerpt[] = structuredClone(INITIAL_EXCERPTS);
const readingListsStore: ReadingList[] = structuredClone(INITIAL_READING_LISTS);

const ordersStore: OrderRecord[] = [
  {
    id: 'ord-seed-1041',
    orderNumber: 'AK-2026-1041',
    idempotencyKey: 'idem-seed-1041',
    userId: 'usr-seed-reader-1',
    guestAccessToken: 'gtok-seed-1041-akath-verified-token',
    createdAt: '2026-10-20T10:15:00.000Z',
    updatedAt: '2026-10-21T14:30:00.000Z',
    customer: {
      fullName: 'प्रा. अनिरुद्ध कुलकर्णी',
      phone: '9823011223',
      email: 'aniruddha.kulkarni@example.com',
      addressLine1: '१४, सरस्वती निवास, शिवाजीनगर',
      city: 'नांदेड',
      district: 'नांदेड',
      state: 'महाराष्ट्र',
      postalCode: '431605',
      isInstitutionalOrder: false,
    },
    items: [
      {
        bookId: 'book-dhukyachi-dulai',
        slug: 'dhukyachi-dulai-bhutan-pravasvarnan',
        title: 'धुक्याची दुलई',
        authorName: 'अनुरत्न वाघमारे',
        format: 'प्रवासवर्णन (पेपरबॅक)',
        unitPrice: 320,
        requestedQuantity: 2,
        approvedQuantity: 2,
        lineTotal: 640,
        availableStock: 30,
      },
    ],
    subtotal: 640,
    shippingCost: 0,
    grandTotal: 640,
    currency: 'INR',
    paymentMethod: 'upi_verified',
    paymentStatus: 'verified',
    paymentReference: 'UPI-AKATH-884120931',
    orderStatus: 'shipped',
    fulfilment: {
      courierPartner: 'भारतीय स्पीड पोस्ट (India Post)',
      trackingNumber: 'EM482910485IN',
      dispatchedAt: '2026-10-21T14:30:00.000Z',
    },
    auditTrail: [
      {
        timestamp: '2026-10-20T10:15:00.000Z',
        actor: 'system',
        action: 'ORDER_CREATED',
        note: 'ऑर्डर तयार झाली.',
      },
      {
        timestamp: '2026-10-21T14:30:00.000Z',
        actor: 'Order & Inventory Manager',
        action: 'STATUS_SHIPPED',
        note: 'भारतीय स्पीड पोस्टद्वारे रवाना.',
      },
    ],
  },
];

const manuscriptsStore: ManuscriptSubmission[] = [
  {
    id: 'ms-seed-1',
    referenceCode: 'AK-MS-2026-109',
    submittedAt: '2026-10-24T11:30:00.000Z',
    authorName: 'डॉ. प्रशांत कुलकर्णी',
    email: 'prashant.kulkarni@example.com',
    phone: '9422178901',
    city: 'लातूर',
    manuscriptTitle: 'पाणलोटाच्या सावल्या आणि दुष्काळी नोंदी',
    category: 'समीक्षा व निबंध',
    wordCountEstimate: '४२,००० शब्द',
    synopsis:
      'मराठवाड्यातील पाणलोट क्षेत्राचा सांस्कृतिक व सामाजिक अभ्यास आणि गेल्या पन्नास वर्षांतील ग्रामीण स्थित्यंतरे.',
    sampleExcerptText:
      'पाणी केवळ जमिनीत मुरत नाही, तर ते गावाच्या भाषेत, म्हणींत आणि आठवणींतही मुरलेले असते.',
    originalWorkConfirmed: true,
    privacyConsentConfirmed: true,
    reviewStatus: 'initial_reading',
    editorialInternalNote: 'संपादकीय मंडळाकडून प्राथमिक वाचनासाठी निवड.',
  },
];
const subscribersStore: NewsletterSubscriber[] = [
  {
    id: 'sub-seed-1',
    email: 'sahitya.vachak@example.com',
    name: 'प्रणाली देशमुख',
    preferredTopics: ['नवीन पुस्तके', 'वाचनकट्टा निवड'],
    consentConfirmed: true,
    subscriptionSource: 'homepage',
    subscribedAt: '2026-10-15T09:00:00.000Z',
    status: 'active',
    unsubscribeToken: 'unsub-seed-1',
  },
];
const inquiriesStore: ContactInquiry[] = [
  {
    id: 'inq-seed-1',
    submittedAt: '2026-10-25T15:10:00.000Z',
    name: 'प्रा. श्रीकांत देशपांडे (मराठवाडा साहित्य महाविद्यालय)',
    role: 'Bookstore_Institution',
    emailOrPhone: 'shrikant.deshpande@example.com / 9822033445',
    subject: 'महाविद्यालयीन ग्रंथालयासाठी अकथ प्रकाशनाच्या संचाची मागणी',
    message:
      'आमच्या महाविद्यालयाच्या मध्यवर्ती ग्रंथालयासाठी अकथ प्रकाशनाच्या सर्व प्रकाशित पुस्तकांचे प्रत्येकी ५ संच हवे आहेत. कृपया संस्थात्मक सवलतीसह कोटेशन पाठवावे.',
    preferWhatsAppFollowup: true,
  },
];
const analyticsStore: AnalyticsEvent[] = [];
const TECHNICAL_AUDIT_SUMMARY = PHASE_0_AUDIT_REPORT;

function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

function recordAnalytics(
  eventType: AnalyticsEvent['eventType'],
  entitySlug?: string,
  metadata?: Record<string, string | number | boolean>
) {
  analyticsStore.unshift({
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    eventType,
    entitySlug,
    metadata,
  });
  if (analyticsStore.length > 500) {
    analyticsStore.pop();
  }
}

// ============================================================================
// COOKIE & SESSION AUTHENTICATION MIDDLEWARE
// ============================================================================

interface AuthenticatedRequest extends Request {
  authUser?: InternalUserRecord;
  authSession?: InternalSessionRecord;
  authViaCookie?: boolean;
  rawBody?: string;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function setSessionCookie(
  req: Request,
  res: Response,
  rawToken: string,
  maxAgeSeconds: number
) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';
  const sameSiteAndSecure = isHttps
    ? 'SameSite=None; Secure'
    : 'SameSite=Lax';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      rawToken
    )}; HttpOnly; Path=/; ${sameSiteAndSecure}; Max-Age=${maxAgeSeconds}`
  );
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}

function createSessionForUser(
  user: InternalUserRecord,
  req: Request,
  res: Response
): {
  session: InternalSessionRecord;
  rawToken: string;
  csrfToken: string;
} {
  const rawToken = generateOpaqueToken(32);
  const tokenHash = hashOpaqueToken(rawToken);
  const csrfToken = generateOpaqueToken(24);
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const expiresIso = new Date(now + SESSION_TTL_MS).toISOString();

  const session: InternalSessionRecord = {
    id: `ses-${now}-${generateOpaqueToken(4)}`,
    userId: user.id,
    tokenHash,
    csrfToken,
    userAgent: sanitizeText(req.headers['user-agent'] || 'Browser', 180),
    ipAddress: req.ip || '127.0.0.1',
    createdAt: nowIso,
    expiresAt: expiresIso,
    lastActiveAt: nowIso,
  };

  sessionsStore.unshift(session);
  user.lastLoginAt = nowIso;
  setSessionCookie(req, res, rawToken, Math.floor(SESSION_TTL_MS / 1000));

  return { session, rawToken, csrfToken };
}

// Attach authenticated user & session if present
app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

  const rawToken = bearerToken || cookieToken;
  if (!rawToken) {
    next();
    return;
  }

  const tokenHash = hashOpaqueToken(rawToken);
  const session = sessionsStore.find((s) => s.tokenHash === tokenHash);
  if (!session || session.revokedAt) {
    if (cookieToken && !bearerToken) clearSessionCookie(res);
    next();
    return;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    session.revokedAt = new Date().toISOString();
    if (cookieToken && !bearerToken) clearSessionCookie(res);
    next();
    return;
  }

  const user = usersStore.find((u) => u.id === session.userId);
  if (!user || user.accountStatus !== 'active') {
    session.revokedAt = new Date().toISOString();
    if (cookieToken && !bearerToken) clearSessionCookie(res);
    next();
    return;
  }

  session.lastActiveAt = new Date().toISOString();
  req.authUser = user;
  req.authSession = session;
  req.authViaCookie = Boolean(cookieToken && !bearerToken);
  next();
});

function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.authUser || !req.authSession) {
    recordSecurityAudit({
      actorUserId: null,
      actorRole: 'guest',
      ipAddress: req.ip || '127.0.0.1',
      action: `UNAUTHENTICATED_API_ACCESS:${req.method}:${req.path}`,
      targetType: 'system',
      outcome: 'denied',
      details: 'Unauthenticated request to protected endpoint blocked with 401.',
    });
    res.status(401).json({
      error: 'Authentication required. Please sign in to continue.',
      code: 'UNAUTHENTICATED',
    });
    return;
  }

  // Enforce CSRF token validation when mutating via cookie session
  const mutatingMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
  if (req.authViaCookie && mutatingMethods.includes(req.method)) {
    const headerCsrf = req.headers['x-csrf-token'];
    if (
      typeof headerCsrf !== 'string' ||
      headerCsrf !== req.authSession.csrfToken
    ) {
      recordSecurityAudit({
        actorUserId: req.authUser.id,
        actorEmail: req.authUser.email,
        actorRole: req.authUser.role,
        ipAddress: req.ip || '127.0.0.1',
        action: `CSRF_VALIDATION_FAILED:${req.method}:${req.path}`,
        targetType: 'session',
        targetId: req.authSession.id,
        outcome: 'denied',
        details: 'Missing or invalid X-CSRF-Token on cookie-authenticated mutation.',
      });
      res.status(403).json({
        error: 'Invalid or missing CSRF security token.',
        code: 'CSRF_INVALID',
      });
      return;
    }
  }

  next();
}

function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const user = req.authUser!;
      if (!hasPermission(user.role, user.accountStatus, permission)) {
        recordSecurityAudit({
          actorUserId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          ipAddress: req.ip || '127.0.0.1',
          action: `PERMISSION_DENIED:${permission}:${req.method}:${req.path}`,
          targetType: 'system',
          outcome: 'denied',
          details: `Role '${user.role}' lacks required permission '${permission}'.`,
        });
        res.status(403).json({
          error: 'Access denied. You do not have permission for this operation.',
          code: 'FORBIDDEN',
          requiredPermission: permission,
        });
        return;
      }
      next();
    });
  };
}

// ============================================================================
// SERVER CART QUOTE CALCULATION
// ============================================================================

export function calculateServerCartQuote(
  rawItems: CartItemInput[],
  lang: AppLanguage = 'mr'
): CartQuoteResponse {
  const validatedLines: ValidatedCartLine[] = [];
  const validationMessages: string[] = [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      shippingRuleNote:
        lang === 'mr'
          ? '₹६०० किंवा त्याहून अधिक मूल्याच्या ऑर्डरवर संपूर्ण भारतात मोफत वितरण.'
          : 'Free shipping across India on orders of ₹600 or more.',
      grandTotal: 0,
      currency: 'INR',
      isValidForCheckout: false,
      validationMessages: [
        lang === 'mr'
          ? 'तुमची पिशवी सध्या रिकामी आहे.'
          : 'Your cart is currently empty.',
      ],
    };
  }

  const mergedMap = new Map<string, number>();
  for (const entry of rawItems) {
    if (!entry || typeof entry.bookId !== 'string') continue;
    const rawQty = Math.floor(Number(entry.quantity) || 0);
    if (rawQty < 1) {
      validationMessages.push(
        lang === 'mr'
          ? 'पुस्तकाची संख्या किमान १ असणे आवश्यक आहे.'
          : 'Quantity must be at least 1.'
      );
      continue;
    }
    mergedMap.set(entry.bookId, (mergedMap.get(entry.bookId) || 0) + rawQty);
  }

  for (const [bookId, reqQty] of mergedMap.entries()) {
    const book = booksStore.find(
      (b) => b.id === bookId && isBookPubliclyVisible(b)
    );
    if (!book) {
      validationMessages.push(
        lang === 'mr'
          ? `अवैध किंवा अप्रकाशित पुस्तक आयडी (${bookId}) वगळण्यात आला आहे.`
          : `Invalid or unpublished book ID (${bookId}) was ignored.`
      );
      continue;
    }

    const author = authorsStore.find((a) => a.id === book.authorId);
    const authorName = author ? author.name : 'अकथ लेखक';

    if (book.availability === 'out_of_stock' || book.stock <= 0) {
      validationMessages.push(
        lang === 'mr'
          ? `'${book.title}' सध्या आउट ऑफ स्टॉक आहे.`
          : `'${book.title}' is currently out of stock.`
      );
      validatedLines.push({
        bookId: book.id,
        slug: book.slug,
        title: book.title,
        authorName,
        format: book.format,
        unitPrice: book.price,
        requestedQuantity: reqQty,
        approvedQuantity: 0,
        lineTotal: 0,
        availableStock: 0,
        stockWarning: lang === 'mr' ? 'सध्या उपलब्ध नाही' : 'Currently out of stock',
      });
      continue;
    }

    const maxAllowed = Math.min(book.stock, 20);
    const approvedQty = Math.min(reqQty, maxAllowed);
    let stockWarning: string | undefined;

    if (reqQty > maxAllowed) {
      stockWarning =
        lang === 'mr'
          ? `उपलब्ध साठ्यानुसार कमाल ${approvedQty} प्रती मंजूर केल्या आहेत.`
          : `Adjusted to maximum available stock of ${approvedQty} copies.`;
      validationMessages.push(`'${book.title}': ${stockWarning}`);
    }

    validatedLines.push({
      bookId: book.id,
      slug: book.slug,
      title: book.title,
      authorName,
      format: book.format,
      unitPrice: book.price,
      requestedQuantity: reqQty,
      approvedQuantity: approvedQty,
      lineTotal: book.price * approvedQty,
      availableStock: book.stock,
      stockWarning,
    });
  }

  const activeLines = validatedLines.filter((l) => l.approvedQuantity > 0);
  const subtotal = activeLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shippingCost = subtotal === 0 ? 0 : subtotal >= 600 ? 0 : 45;
  const grandTotal = subtotal + shippingCost;

  const shippingRuleNote =
    subtotal >= 600
      ? lang === 'mr'
        ? '₹६००+ ऑर्डरसाठी मोफत स्पीड पोस्ट / कुरिअर वितरण लागू आहे.'
        : 'Free registered post / courier shipping applied (Order ₹600+).'
      : subtotal > 0
      ? lang === 'mr'
        ? `मोफत वितरणासाठी आणखी ₹${600 - subtotal} ची पुस्तके जोडा (सध्या वितरण शुल्क ₹४५).`
        : `Add ₹${600 - subtotal} more for free shipping across India (Standard shipping ₹45).`
      : lang === 'mr'
      ? '₹६०० किंवा त्याहून अधिक मूल्याच्या ऑर्डरवर संपूर्ण भारतात मोफत वितरण.'
      : 'Free shipping across India on orders of ₹600 or more.';

  return {
    items: validatedLines,
    subtotal,
    shippingCost,
    shippingRuleNote,
    grandTotal,
    currency: 'INR',
    isValidForCheckout: activeLines.length > 0 && subtotal > 0,
    validationMessages,
  };
}

// ============================================================================
// AUTHENTICATION & SESSION LIFECYCLE ENDPOINTS (/api/auth/*)
// ============================================================================

app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.authUser || !req.authSession) {
    res.json({
      authenticated: false,
      user: null,
      role: 'guest',
      permissions: ROLE_PERMISSIONS.guest,
    });
    return;
  }

  const user = req.authUser;
  res.json({
    authenticated: true,
    user: toPublicUserProfile(user),
    role: user.role,
    csrfToken: req.authSession.csrfToken,
    permissions: ROLE_PERMISSIONS[user.role],
    savedCart: user.savedCart,
  });
});

app.post('/api/auth/register', (req: AuthenticatedRequest, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

  if (!checkRateLimit(ip, 'auth_register', 15, 60_000)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया काही वेळाने पुन्हा प्रयत्न करा.'
          : 'Too many registration attempts. Please try again later.',
    });
    return;
  }

  // Detect & log any untrusted role escalation attempt in public signup payload
  if (
    req.body?.role &&
    typeof req.body.role === 'string' &&
    req.body.role !== 'reader'
  ) {
    recordSecurityAudit({
      actorUserId: null,
      actorEmail: typeof req.body?.email === 'string' ? req.body.email : undefined,
      actorRole: 'guest',
      ipAddress: ip,
      action: 'PRIVILEGE_ESCALATION_ATTEMPT_BLOCKED',
      targetType: 'user',
      outcome: 'denied',
      details: `Public registration attempted to request role '${sanitizeText(
        req.body.role,
        40
      )}'. Enforced 'reader' role.`,
    });
  }

  const name = sanitizeText(req.body?.name, 120);
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const rawPhone = typeof req.body?.phone === 'string' ? req.body.phone : '';
  const city = sanitizeText(req.body?.city, 80);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const confirmPassword =
    typeof req.body?.confirmPassword === 'string'
      ? req.body.confirmPassword
      : password;
  const consentConfirmed = req.body?.consentConfirmed !== false;

  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) {
    fieldErrors.name =
      lang === 'mr' ? 'कृपया तुमचे पूर्ण नाव लिहा.' : 'Please enter your full name.';
  }

  const emailCheck = validateEmail(rawEmail, lang);
  if (!emailCheck.isValid) {
    fieldErrors.email = emailCheck.error!;
  }

  let normalizedPhone: string | undefined;
  if (rawPhone.trim()) {
    const phoneCheck = validateIndianPhone(rawPhone, lang);
    if (!phoneCheck.isValid) {
      fieldErrors.phone = phoneCheck.error!;
    } else {
      normalizedPhone = phoneCheck.normalizedValue;
    }
  }

  const pwdCheck = validatePasswordStrength(password, lang);
  if (!pwdCheck.isValid) {
    fieldErrors.password = pwdCheck.error!;
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword =
      lang === 'mr'
        ? 'दोन्ही पासवर्ड जुळत नाहीत.'
        : 'Password and confirmation do not match.';
  }

  if (!consentConfirmed) {
    fieldErrors.consent =
      lang === 'mr'
        ? 'कृपया अटी आणि गोपनीयता धोरणास संमती द्या.'
        : 'Please accept the terms and privacy policy.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    res.status(400).json({
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    });
    return;
  }

  const normalizedEmail = emailCheck.normalizedValue.toLowerCase();
  const existingUser = usersStore.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (existingUser) {
    res.status(409).json({
      error:
        lang === 'mr'
          ? 'या ईमेलवर आधीच खाते अस्तित्वात आहे. कृपया लॉगिन करा.'
          : 'An account with this email already exists. Please sign in.',
      fieldErrors: {
        email:
          lang === 'mr'
            ? 'हा ईमेल आधीच नोंदणीकृत आहे.'
            : 'This email is already registered.',
      },
    });
    return;
  }

  const nowIso = new Date().toISOString();
  const guestCart: CartItemInput[] = Array.isArray(req.body?.guestCart)
    ? req.body.guestCart
    : [];
  const mergedCart = mergeCartItems([], guestCart, (bookId) => {
    const b = booksStore.find((bk) => bk.id === bookId && isBookPubliclyVisible(bk));
    return b ? b.stock : 0;
  });

  // Public registration strictly creates a 'reader' account
  const newUser: InternalUserRecord = {
    id: `usr-${Date.now()}-${generateOpaqueToken(3)}`,
    name,
    email: normalizedEmail,
    phone: normalizedPhone,
    city: city || undefined,
    role: 'reader',
    accountStatus: 'active',
    emailVerified: false,
    wishlistBookIds: [],
    personalReadingList: [],
    notificationPreferences: {
      newReleases: true,
      orderUpdates: true,
      vachankattaDigest: true,
      publishingAlerts: false,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    passwordHash: hashPassword(password),
    savedCart: mergedCart,
  };

  usersStore.unshift(newUser);

  // Create single-use Email Verification Token (valid 24h)
  const rawVerifyToken = generateOpaqueToken(24);
  const verifyRecord: TokenRecord = {
    id: `tok-ver-${Date.now()}`,
    userId: newUser.id,
    email: newUser.email,
    tokenHash: hashOpaqueToken(rawVerifyToken),
    purpose: 'email_verification',
    createdAt: nowIso,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  tokensStore.unshift(verifyRecord);
  localEmailOutbox.unshift({
    id: verifyRecord.id,
    toEmail: newUser.email,
    subject: 'Verify your Akath Prakashan Reader Account',
    purpose: 'email_verification',
    rawToken: rawVerifyToken,
    sentAt: nowIso,
  });

  const { rawToken: sessionToken, csrfToken } = createSessionForUser(
    newUser,
    req,
    res
  );

  recordSecurityAudit({
    actorUserId: newUser.id,
    actorEmail: newUser.email,
    actorRole: 'reader',
    ipAddress: ip,
    action: 'USER_REGISTERED',
    targetType: 'user',
    targetId: newUser.id,
    outcome: 'success',
    details: 'Registered new reader account and issued email verification token.',
  });

  const redirectTo = sanitizeRedirectPath(
    req.body?.redirectTo,
    getDefaultDashboardForRole(newUser.role)
  );

  res.status(201).json({
    user: toPublicUserProfile(newUser),
    sessionToken,
    csrfToken,
    mergedCart,
    redirectTo,
    verificationTokenPreview:
      process.env.NODE_ENV !== 'production' ? rawVerifyToken : undefined,
  });
});

app.post('/api/auth/verify-email', (req: AuthenticatedRequest, res: Response) => {
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  const rawToken =
    typeof req.body?.token === 'string' ? req.body.token.trim() : '';

  if (!rawToken) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'ईमेल पडताळणी टोकन आवश्यक आहे.'
          : 'Verification token is required.',
    });
    return;
  }

  const tokenHash = hashOpaqueToken(rawToken);
  const tokenRec = tokensStore.find(
    (t) => t.tokenHash === tokenHash && t.purpose === 'email_verification'
  );

  if (!tokenRec) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'अवैध ईमेल पडताळणी टोकन.'
          : 'Invalid email verification token.',
    });
    return;
  }

  if (tokenRec.consumedAt) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'हे पडताळणी टोकन आधीच वापरले गेले आहे.'
          : 'This verification token has already been used.',
    });
    return;
  }

  if (new Date(tokenRec.expiresAt).getTime() <= Date.now()) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'या पडताळणी टोकनची मुदत संपली आहे.'
          : 'This verification token has expired.',
    });
    return;
  }

  const user = usersStore.find((u) => u.id === tokenRec.userId);
  if (!user) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }

  const nowIso = new Date().toISOString();
  tokenRec.consumedAt = nowIso;
  user.emailVerified = true;
  user.updatedAt = nowIso;

  recordSecurityAudit({
    actorUserId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    ipAddress: req.ip || '127.0.0.1',
    action: 'EMAIL_VERIFIED',
    targetType: 'user',
    targetId: user.id,
    outcome: 'success',
    details: 'Email verification completed via single-use token.',
  });

  res.json({
    ok: true,
    user: toPublicUserProfile(user),
    message:
      lang === 'mr'
        ? 'तुमचा ईमेल पत्ता यशस्वीरित्या प्रमाणित झाला आहे!'
        : 'Your email address has been verified!',
  });
});

app.post(
  '/api/auth/resend-verification',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    if (user.emailVerified) {
      res.status(400).json({ error: 'Email is already verified.' });
      return;
    }

    const nowIso = new Date().toISOString();
    // Invalidate older unconsumed verification tokens for this user
    for (const t of tokensStore) {
      if (
        t.userId === user.id &&
        t.purpose === 'email_verification' &&
        !t.consumedAt
      ) {
        t.consumedAt = nowIso;
      }
    }

    const rawVerifyToken = generateOpaqueToken(24);
    tokensStore.unshift({
      id: `tok-ver-${Date.now()}`,
      userId: user.id,
      email: user.email,
      tokenHash: hashOpaqueToken(rawVerifyToken),
      purpose: 'email_verification',
      createdAt: nowIso,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    res.json({
      ok: true,
      verificationTokenPreview:
        process.env.NODE_ENV !== 'production' ? rawVerifyToken : undefined,
    });
  }
);

app.post('/api/auth/login', (req: AuthenticatedRequest, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  const rawEmail =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const throttleKey = `${ip}:${rawEmail || 'unknown'}`;
  if (isLoginThrottled(throttleKey) || isLoginThrottled(`email:${rawEmail}`)) {
    recordSecurityAudit({
      actorUserId: null,
      actorEmail: rawEmail,
      actorRole: 'guest',
      ipAddress: ip,
      action: 'AUTH_LOGIN_THROTTLED',
      targetType: 'system',
      outcome: 'denied',
      details: 'Brute-force protection triggered after repeated failed login attempts.',
    });
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'सलग चुकीच्या प्रयत्नांमुळे लॉगिन तात्पुरते थांबवले आहे. कृपया १५ मिनिटांनी प्रयत्न करा.'
          : 'Too many failed login attempts. Please wait 15 minutes before trying again.',
      code: 'RATE_LIMITED',
    });
    return;
  }

  if (!rawEmail || !password) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'कृपया ईमेल आणि पासवर्ड दोन्ही टाका.'
          : 'Please enter both your email address and password.',
    });
    return;
  }

  const user = usersStore.find((u) => u.email.toLowerCase() === rawEmail);
  const genericError =
    lang === 'mr'
      ? 'ईमेल किंवा पासवर्ड चुकीचा आहे.'
      : 'Invalid email or password.';

  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordLoginFailure(throttleKey);
    if (rawEmail) recordLoginFailure(`email:${rawEmail}`);
    recordSecurityAudit({
      actorUserId: user ? user.id : null,
      actorEmail: rawEmail,
      actorRole: user ? user.role : 'guest',
      ipAddress: ip,
      action: 'AUTH_LOGIN_FAILED',
      targetType: 'user',
      targetId: user?.id,
      outcome: 'failure',
      details: 'Invalid email or password during login.',
    });
    res.status(401).json({ error: genericError });
    return;
  }

  if (user.accountStatus !== 'active') {
    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      action: 'AUTH_LOGIN_BLOCKED_INACTIVE',
      targetType: 'user',
      targetId: user.id,
      outcome: 'denied',
      details: `Login blocked because accountStatus is '${user.accountStatus}'.`,
    });
    res.status(403).json({
      error:
        user.accountStatus === 'suspended'
          ? lang === 'mr'
            ? 'तुमचे खाते प्रशासकीय कारणास्तव निलंबित केले आहे.'
            : 'Your account has been suspended by an administrator.'
          : lang === 'mr'
          ? 'हे खाते निष्क्रिय करण्यात आले आहे.'
          : 'This account has been deactivated.',
      code: 'ACCOUNT_INACTIVE',
    });
    return;
  }

  clearLoginFailures(throttleKey);
  clearLoginFailures(`email:${rawEmail}`);

  // Merge guest cart items if provided
  const guestCart: CartItemInput[] = Array.isArray(req.body?.guestCart)
    ? req.body.guestCart
    : [];
  if (guestCart.length > 0) {
    user.savedCart = mergeCartItems(user.savedCart, guestCart, (bookId) => {
      const b = booksStore.find(
        (bk) => bk.id === bookId && isBookPubliclyVisible(bk)
      );
      return b ? b.stock : 0;
    });
  }

  // Session fixation protection: always issue a brand-new session token on login
  const { rawToken: sessionToken, csrfToken } = createSessionForUser(
    user,
    req,
    res
  );

  // Never trust client-supplied role; redirect safely based on server role
  const redirectTo = sanitizeRedirectPath(
    req.body?.redirectTo,
    getDefaultDashboardForRole(user.role)
  );

  recordSecurityAudit({
    actorUserId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    ipAddress: ip,
    action: 'AUTH_LOGIN_SUCCESS',
    targetType: 'user',
    targetId: user.id,
    outcome: 'success',
    details: `Authenticated as '${user.role}'.`,
  });

  res.json({
    user: toPublicUserProfile(user),
    sessionToken,
    csrfToken,
    mergedCart: user.savedCart,
    redirectTo,
    permissions: ROLE_PERMISSIONS[user.role],
  });
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.authSession) {
    req.authSession.revokedAt = new Date().toISOString();
    recordSecurityAudit({
      actorUserId: req.authUser?.id || null,
      actorEmail: req.authUser?.email,
      actorRole: req.authUser?.role || 'guest',
      ipAddress: req.ip || '127.0.0.1',
      action: 'AUTH_LOGOUT',
      targetType: 'session',
      targetId: req.authSession.id,
      outcome: 'success',
      details: 'Session revoked and cookie cleared on logout.',
    });
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'forgot_password', 8, 15 * 60_000)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : 'Too many password reset requests. Please try again later.',
    });
    return;
  }

  const rawEmail =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const emailCheck = validateEmail(rawEmail, lang);
  if (!emailCheck.isValid) {
    res.status(400).json({ error: emailCheck.error });
    return;
  }

  const user = usersStore.find(
    (u) =>
      u.email.toLowerCase() === emailCheck.normalizedValue &&
      u.accountStatus === 'active'
  );

  let devResetToken: string | undefined;
  if (user) {
    const nowIso = new Date().toISOString();
    // Invalidate previous unconsumed reset tokens for this user
    for (const t of tokensStore) {
      if (
        t.userId === user.id &&
        t.purpose === 'password_reset' &&
        !t.consumedAt
      ) {
        t.consumedAt = nowIso;
      }
    }

    const rawReset = generateOpaqueToken(24);
    devResetToken = rawReset;
    tokensStore.unshift({
      id: `tok-rst-${Date.now()}`,
      userId: user.id,
      email: user.email,
      tokenHash: hashOpaqueToken(rawReset),
      purpose: 'password_reset',
      createdAt: nowIso,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30m expiry
    });

    localEmailOutbox.unshift({
      id: `out-rst-${Date.now()}`,
      toEmail: user.email,
      subject: 'Akath Prakashan Password Reset Request',
      purpose: 'password_reset',
      rawToken: rawReset,
      sentAt: nowIso,
    });

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'user',
      targetId: user.id,
      outcome: 'success',
      details: 'Generated single-use password reset token.',
    });
  }

  // Generic response prevents account enumeration
  res.json({
    ok: true,
    message:
      lang === 'mr'
        ? 'जर या ईमेलवर खाते अस्तित्वात असेल, तर पासवर्ड रीसेट सूचना पाठवण्यात आल्या आहेत.'
        : 'If an account exists for that email address, password reset instructions have been sent.',
    resetTokenPreview:
      process.env.NODE_ENV !== 'production' && req.headers['x-test-mode'] === 'true'
        ? devResetToken
        : undefined,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  const rawToken =
    typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  const newPassword =
    typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

  if (!rawToken) {
    res.status(400).json({
      error: lang === 'mr' ? 'रीसेट टोकन आवश्यक आहे.' : 'Reset token is required.',
    });
    return;
  }

  const pwdCheck = validatePasswordStrength(newPassword, lang);
  if (!pwdCheck.isValid) {
    res.status(400).json({
      error: pwdCheck.error,
      fieldErrors: { newPassword: pwdCheck.error },
    });
    return;
  }

  const tokenHash = hashOpaqueToken(rawToken);
  const tokenRec = tokensStore.find(
    (t) => t.tokenHash === tokenHash && t.purpose === 'password_reset'
  );

  if (
    !tokenRec ||
    tokenRec.consumedAt ||
    new Date(tokenRec.expiresAt).getTime() <= Date.now()
  ) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'हे पासवर्ड रीसेट टोकन अवैध आहे किंवा त्याची मुदत संपली आहे.'
          : 'This password reset token is invalid, expired, or has already been used.',
    });
    return;
  }

  const user = usersStore.find((u) => u.id === tokenRec.userId);
  if (!user || user.accountStatus !== 'active') {
    res.status(400).json({ error: 'Unable to reset password for this account.' });
    return;
  }

  const nowIso = new Date().toISOString();
  tokenRec.consumedAt = nowIso;
  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = nowIso;

  // Invalidate ALL active sessions after password reset
  const revokedCount = invalidateUserSessions(user.id);

  recordSecurityAudit({
    actorUserId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    ipAddress: req.ip || '127.0.0.1',
    action: 'PASSWORD_RESET_COMPLETED',
    targetType: 'user',
    targetId: user.id,
    outcome: 'success',
    details: `Password reset completed; invalidated ${revokedCount} active session(s).`,
  });

  res.json({
    ok: true,
    message:
      lang === 'mr'
        ? 'तुमचा पासवर्ड यशस्वीरित्या बदलण्यात आला आहे. कृपया नवीन पासवर्डने लॉगिन करा.'
        : 'Your password has been reset successfully. Please sign in with your new password.',
  });
});

// Protected server-controlled Administrator provisioning endpoint (never public signup)
app.post('/api/auth/provision-admin', (req: Request, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  const providedToken =
    typeof req.body?.bootstrapToken === 'string'
      ? req.body.bootstrapToken.trim()
      : '';

  if (!providedToken || providedToken !== SERVER_ADMIN_BOOTSTRAP_TOKEN) {
    recordSecurityAudit({
      actorUserId: null,
      actorRole: 'guest',
      ipAddress: ip,
      action: 'ADMIN_PROVISION_DENIED',
      targetType: 'system',
      outcome: 'denied',
      details: 'Invalid server bootstrap token supplied to /api/auth/provision-admin.',
    });
    res.status(403).json({
      error: 'Forbidden: Valid server bootstrap token required for admin provisioning.',
    });
    return;
  }

  const name = sanitizeText(req.body?.name, 120) || 'अकथ मुख्य प्रशासक';
  const emailCheck = validateEmail(req.body?.email || '', 'en');
  const pwdCheck = validatePasswordStrength(req.body?.password, 'en');

  if (!emailCheck.isValid || !pwdCheck.isValid) {
    res.status(400).json({
      error: emailCheck.error || pwdCheck.error || 'Invalid admin credentials.',
    });
    return;
  }

  const normalizedEmail = emailCheck.normalizedValue.toLowerCase();
  const nowIso = new Date().toISOString();
  let adminUser = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (adminUser) {
    adminUser.role = 'admin';
    adminUser.accountStatus = 'active';
    adminUser.emailVerified = true;
    adminUser.passwordHash = hashPassword(req.body.password);
    adminUser.updatedAt = nowIso;
    invalidateUserSessions(adminUser.id);
  } else {
    adminUser = {
      id: `usr-admin-${Date.now()}`,
      name,
      email: normalizedEmail,
      role: 'admin',
      accountStatus: 'active',
      emailVerified: true,
      wishlistBookIds: [],
      personalReadingList: [],
      notificationPreferences: {
        newReleases: true,
        orderUpdates: true,
        vachankattaDigest: true,
        publishingAlerts: true,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      passwordHash: hashPassword(req.body.password),
      savedCart: [],
    };
    usersStore.unshift(adminUser);
  }

  recordSecurityAudit({
    actorUserId: adminUser.id,
    actorEmail: adminUser.email,
    actorRole: 'admin',
    ipAddress: ip,
    action: 'ADMIN_PROVISIONED',
    targetType: 'user',
    targetId: adminUser.id,
    outcome: 'success',
    details: 'Administrator account provisioned via verified server bootstrap token.',
  });

  res.status(201).json({
    ok: true,
    user: toPublicUserProfile(adminUser),
  });
});

// Development/Preview Sandbox Persona Switcher (Only enabled in non-production preview)
// Uses ephemeral cryptographic sessions without any hardcoded passwords
app.post('/api/auth/sandbox-persona', (req: AuthenticatedRequest, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Sandbox persona switcher is disabled in production.' });
    return;
  }

  const persona = req.body?.persona as 'reader' | 'author' | 'admin';
  if (!['reader', 'author', 'admin'].includes(persona)) {
    res.status(400).json({ error: 'Invalid persona.' });
    return;
  }

  const nowIso = new Date().toISOString();
  let targetUser: InternalUserRecord | undefined;

  if (persona === 'reader') {
    targetUser = usersStore.find((u) => u.id === 'usr-seed-reader-1');
  } else if (persona === 'author') {
    targetUser = usersStore.find((u) => u.id === 'usr-seed-author-1');
  } else if (persona === 'admin') {
    targetUser = usersStore.find((u) => u.role === 'admin' && u.accountStatus === 'active');
    if (!targetUser) {
      targetUser = {
        id: 'usr-sandbox-admin',
        name: 'संपादकीय व प्रकाशन प्रशासक (Admin)',
        email: 'admin.console@akath.in',
        phone: '9270282932',
        city: 'नांदेड / पुणे',
        bio: 'अकथ प्रकाशन मुख्य संपादकीय आणि कार्यप्रणाली प्रशासक.',
        role: 'admin',
        accountStatus: 'active',
        emailVerified: true,
        wishlistBookIds: [],
        personalReadingList: [],
        notificationPreferences: {
          newReleases: true,
          orderUpdates: true,
          vachankattaDigest: true,
          publishingAlerts: true,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
        passwordHash: hashPassword(generateOpaqueToken(24)),
        savedCart: [],
      };
      usersStore.unshift(targetUser);
    }
  }

  if (!targetUser) {
    res.status(404).json({ error: 'Persona account not found.' });
    return;
  }

  targetUser.accountStatus = 'active';
  const { rawToken: sessionToken, csrfToken } = createSessionForUser(
    targetUser,
    req,
    res
  );

  recordSecurityAudit({
    actorUserId: targetUser.id,
    actorEmail: targetUser.email,
    actorRole: targetUser.role,
    ipAddress: req.ip || '127.0.0.1',
    action: `SANDBOX_PERSONA_SESSION:${persona.toUpperCase()}`,
    targetType: 'session',
    targetId: targetUser.id,
    outcome: 'success',
    details: `Activated development preview session for role '${persona}'.`,
  });

  res.json({
    user: toPublicUserProfile(targetUser),
    sessionToken,
    csrfToken,
    mergedCart: targetUser.savedCart,
    redirectTo: getDefaultDashboardForRole(targetUser.role),
    permissions: ROLE_PERMISSIONS[targetUser.role],
  });
});

// ============================================================================
// PUBLIC CATALOGUE & EDITORIAL API
// ============================================================================

app.get('/api/bootstrap', (_req, res) => {
  // Public catalog strictly exposes only published books
  const publicBooks = booksStore.filter((b) => isBookPubliclyVisible(b));
  const publicAuthors = authorsStore.filter(
    (a) => a.publicProfileStatus === 'published'
  );
  const publicArticles = articlesStore.filter(
    (a) => a.workflowStatus === 'published'
  );
  const publicExcerpts = excerptsStore.filter(
    (e) => e.approvalStatus === 'approved'
  );
  const publicReviews = reviewsStore.filter((r) => r.status === 'published');

  res.json({
    books: publicBooks,
    authors: publicAuthors,
    articles: publicArticles,
    excerpts: publicExcerpts,
    readingLists: readingListsStore,
    reviews: publicReviews,
    siteConfig: siteConfigStore.published,
    promotions: promotionsStore.filter((p) => p.active),
    auditSummary: TECHNICAL_AUDIT_SUMMARY,
  });
});

app.get('/api/search', (req, res) => {
  const rawQuery = sanitizeText(req.query.q, 120).toLowerCase();
  if (!rawQuery) {
    res.json({ books: [], authors: [], articles: [] });
    return;
  }

  recordAnalytics('catalogue_search', undefined, { query: rawQuery });

  const matchedBooks = booksStore.filter(
    (b) =>
      isBookPubliclyVisible(b) &&
      (b.title.toLowerCase().includes(rawQuery) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(rawQuery)) ||
        b.transliteratedTitle.toLowerCase().includes(rawQuery) ||
        b.category.toLowerCase().includes(rawQuery) ||
        b.topics.some((t) => t.toLowerCase().includes(rawQuery)) ||
        b.description.toLowerCase().includes(rawQuery))
  );

  const matchedAuthors = authorsStore.filter(
    (a) =>
      a.publicProfileStatus === 'published' &&
      (a.name.toLowerCase().includes(rawQuery) ||
        a.transliteratedName.toLowerCase().includes(rawQuery) ||
        a.literaryRole.toLowerCase().includes(rawQuery) ||
        a.region.toLowerCase().includes(rawQuery) ||
        a.themes.some((t) => t.toLowerCase().includes(rawQuery)))
  );

  const matchedArticles = articlesStore.filter(
    (art) =>
      art.workflowStatus === 'published' &&
      (art.title.toLowerCase().includes(rawQuery) ||
        art.subtitle.toLowerCase().includes(rawQuery) ||
        art.transliteratedTitle.toLowerCase().includes(rawQuery) ||
        art.contributorName.toLowerCase().includes(rawQuery) ||
        art.tags.some((t) => t.toLowerCase().includes(rawQuery)) ||
        art.summary.toLowerCase().includes(rawQuery))
  );

  res.json({
    query: rawQuery,
    books: matchedBooks,
    authors: matchedAuthors,
    articles: matchedArticles,
  });
});

app.get('/api/books/:id', (req: AuthenticatedRequest, res: Response) => {
  const book = booksStore.find(
    (b) => b.id === req.params.id || b.slug === req.params.id
  );
  if (!book) {
    res.status(404).json({ error: 'Book not found.' });
    return;
  }
  const userProfile = req.authUser ? toPublicUserProfile(req.authUser) : null;
  if (!canUserViewBook(userProfile, book)) {
    res.status(403).json({
      error: 'This unpublished book draft is private to its author and editors.',
    });
    return;
  }
  res.json({ book });
});

// Reader reaction on First Page Excerpts (non-gamified editorial signal)
app.post('/api/excerpts/:id/react', (req, res) => {
  const excerpt = excerptsStore.find(
    (e) => e.id === req.params.id || e.slug === req.params.id
  );
  if (!excerpt) {
    res.status(404).json({ error: 'उतारा सापडला नाही.' });
    return;
  }

  const reactionType = req.body?.reactionType as
    | 'readMore'
    | 'struckByLine'
    | 'wantContext';
  if (!['readMore', 'struckByLine', 'wantContext'].includes(reactionType)) {
    res.status(400).json({ error: 'अवैध प्रतिसाद प्रकार.' });
    return;
  }

  excerpt.reactions[reactionType] += 1;
  recordAnalytics('excerpt_reaction', excerpt.slug, { reactionType });

  res.json({
    excerptId: excerpt.id,
    reactions: excerpt.reactions,
  });
});

// ============================================================================
// BOOK REVIEWS API (PUBLIC READ, AUTHENTICATED READER WRITE WITH OWNERSHIP)
// ============================================================================

app.get('/api/books/:bookId/reviews', (req, res) => {
  const book = booksStore.find(
    (b) => b.id === req.params.bookId || b.slug === req.params.bookId
  );
  if (!book) {
    res.status(404).json({ error: 'Book not found.' });
    return;
  }
  const bookReviews = reviewsStore.filter(
    (r) => r.bookId === book.id && r.status === 'published'
  );
  res.json({ reviews: bookReviews });
});

app.post(
  '/api/books/:bookId/reviews',
  requirePermission('reviews:write'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    const book = booksStore.find(
      (b) => b.id === req.params.bookId || b.slug === req.params.bookId
    );
    if (!book || !isBookPubliclyVisible(book)) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const rating = Math.floor(Number(req.body?.rating) || 0);
    const title = sanitizeText(req.body?.title, 140);
    const comment = sanitizeText(req.body?.comment, 1500);

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'कृपया १ ते ५ दरम्यान श्रेणी निवडा.'
            : 'Please select a rating between 1 and 5.',
      });
      return;
    }

    if (title.length < 3 || comment.length < 10) {
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'कृपया शीर्षक आणि किमान १० अक्षरांचा अभिप्राय लिहा.'
            : 'Please provide a review title and a comment of at least 10 characters.',
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const review: BookReviewRecord = {
      id: `rev-${Date.now()}-${generateOpaqueToken(3)}`,
      bookId: book.id,
      userId: user.id,
      reviewerName: user.name,
      rating,
      title,
      comment,
      status: 'published',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    reviewsStore.unshift(review);
    res.status(201).json({ review });
  }
);

app.patch(
  '/api/reviews/:id',
  requirePermission('reviews:write'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const review = reviewsStore.find((r) => r.id === req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }

    if (!canMutateReview(toPublicUserProfile(user), review)) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'IDOR_REVIEW_EDIT_DENIED',
        targetType: 'review',
        targetId: review.id,
        outcome: 'denied',
        details: `User '${user.id}' attempted to edit review owned by '${review.userId}'.`,
      });
      res.status(403).json({
        error: 'You can only edit your own reviews.',
      });
      return;
    }

    if (req.body?.rating !== undefined) {
      const r = Math.floor(Number(req.body.rating) || 0);
      if (r >= 1 && r <= 5) review.rating = r;
    }
    if (typeof req.body?.title === 'string') {
      const t = sanitizeText(req.body.title, 140);
      if (t.length >= 3) review.title = t;
    }
    if (typeof req.body?.comment === 'string') {
      const c = sanitizeText(req.body.comment, 1500);
      if (c.length >= 10) review.comment = c;
    }
    review.updatedAt = new Date().toISOString();

    res.json({ review });
  }
);

app.delete(
  '/api/reviews/:id',
  requirePermission('reviews:write'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const idx = reviewsStore.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }

    const review = reviewsStore[idx];
    if (!canMutateReview(toPublicUserProfile(user), review)) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'IDOR_REVIEW_DELETE_DENIED',
        targetType: 'review',
        targetId: review.id,
        outcome: 'denied',
        details: `User '${user.id}' attempted to delete review owned by '${review.userId}'.`,
      });
      res.status(403).json({
        error: 'You can only delete your own reviews.',
      });
      return;
    }

    reviewsStore.splice(idx, 1);
    res.json({ ok: true });
  }
);

// ============================================================================
// READER ACCOUNT & SELF-SERVICE API (/api/account/*)
// ============================================================================

app.get(
  '/api/account/profile',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    // Reject if caller passes a query param attempting to read another userId
    if (
      typeof req.query.userId === 'string' &&
      req.query.userId !== user.id
    ) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'IDOR_PROFILE_READ_DENIED',
        targetType: 'user',
        targetId: req.query.userId,
        outcome: 'denied',
        details: 'Attempted cross-account profile read via userId query parameter.',
      });
      res.status(403).json({
        error: 'Forbidden: You may only access your own profile.',
      });
      return;
    }
    res.json({ user: toPublicUserProfile(user) });
  }
);

app.patch(
  '/api/account/profile',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    // Detect mass-assignment / role tampering attempts
    if (
      req.body?.role !== undefined ||
      req.body?.accountStatus !== undefined ||
      req.body?.isAdmin !== undefined
    ) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'MASS_ASSIGNMENT_ATTEMPT_BLOCKED',
        targetType: 'user',
        targetId: user.id,
        outcome: 'denied',
        details: 'Ignored restricted fields (role/accountStatus) in profile update.',
      });
    }

    if (typeof req.body?.name === 'string') {
      const cleanName = sanitizeText(req.body.name, 120);
      if (cleanName.length < 2) {
        res.status(400).json({
          error:
            lang === 'mr'
              ? 'कृपया वैध नाव लिहा.'
              : 'Please enter a valid name (at least 2 characters).',
        });
        return;
      }
      user.name = cleanName;
    }

    if (typeof req.body?.phone === 'string' && req.body.phone.trim()) {
      const pCheck = validateIndianPhone(req.body.phone, lang);
      if (!pCheck.isValid) {
        res.status(400).json({ error: pCheck.error });
        return;
      }
      user.phone = pCheck.normalizedValue;
    }

    if (typeof req.body?.city === 'string') {
      user.city = sanitizeText(req.body.city, 80);
    }

    if (typeof req.body?.bio === 'string') {
      user.bio = sanitizeText(req.body.bio, 600);
    }

    if (
      req.body?.notificationPreferences &&
      typeof req.body.notificationPreferences === 'object'
    ) {
      const prefs = req.body.notificationPreferences;
      user.notificationPreferences = {
        newReleases: Boolean(
          prefs.newReleases ?? user.notificationPreferences.newReleases
        ),
        orderUpdates: Boolean(
          prefs.orderUpdates ?? user.notificationPreferences.orderUpdates
        ),
        vachankattaDigest: Boolean(
          prefs.vachankattaDigest ?? user.notificationPreferences.vachankattaDigest
        ),
        publishingAlerts: Boolean(
          prefs.publishingAlerts ?? user.notificationPreferences.publishingAlerts
        ),
      };
    }

    user.updatedAt = new Date().toISOString();
    res.json({ user: toPublicUserProfile(user) });
  }
);

app.get(
  '/api/account/addresses',
  requirePermission('account:addresses'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const myAddresses = addressesStore.filter((a) => a.userId === user.id);
    res.json({ addresses: myAddresses });
  }
);

app.post(
  '/api/account/addresses',
  requirePermission('account:addresses'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    const label = sanitizeText(req.body?.label, 60) || 'घर';
    const fullName = sanitizeText(req.body?.fullName, 120) || user.name;
    const phoneCheck = validateIndianPhone(req.body?.phone || '', lang);
    const addressLine1 = sanitizeText(req.body?.addressLine1, 220);
    const addressLine2 = sanitizeText(req.body?.addressLine2, 220);
    const city = sanitizeText(req.body?.city, 80);
    const district = sanitizeText(req.body?.district, 80) || city;
    const state = sanitizeText(req.body?.state, 80) || 'महाराष्ट्र';
    const pinCheck = validateIndianPinCode(req.body?.postalCode || '', lang);

    if (
      !phoneCheck.isValid ||
      addressLine1.length < 5 ||
      city.length < 2 ||
      !pinCheck.isValid
    ) {
      res.status(400).json({
        error:
          phoneCheck.error ||
          pinCheck.error ||
          (lang === 'mr'
            ? 'कृपया संपूर्ण पत्ता आणि शहर भरा.'
            : 'Please complete the street address and city.'),
      });
      return;
    }

    const isDefault = Boolean(req.body?.isDefault);
    if (isDefault) {
      for (const a of addressesStore) {
        if (a.userId === user.id) a.isDefault = false;
      }
    }

    const nowIso = new Date().toISOString();
    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}-${generateOpaqueToken(3)}`,
      userId: user.id,
      label,
      fullName,
      phone: phoneCheck.normalizedValue,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      district,
      state,
      postalCode: pinCheck.normalizedValue,
      isDefault,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    addressesStore.unshift(newAddr);
    res.status(201).json({ address: newAddr });
  }
);

app.delete(
  '/api/account/addresses/:id',
  requirePermission('account:addresses'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const idx = addressesStore.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Address not found.' });
      return;
    }

    const addr = addressesStore[idx];
    if (addr.userId !== user.id) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'IDOR_ADDRESS_DELETE_DENIED',
        targetType: 'user',
        targetId: addr.id,
        outcome: 'denied',
        details: `User '${user.id}' attempted to delete address owned by '${addr.userId}'.`,
      });
      res.status(403).json({
        error: 'Forbidden: You cannot modify another user’s saved address.',
      });
      return;
    }

    addressesStore.splice(idx, 1);
    res.json({ ok: true });
  }
);

app.get(
  '/api/account/orders',
  requirePermission('account:orders'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const myOrders = ordersStore.filter((o) => o.userId === user.id);
    res.json({ orders: myOrders });
  }
);

app.get(
  '/api/account/orders/:id',
  requirePermission('account:orders'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const order = ordersStore.find(
      (o) => o.id === req.params.id || o.orderNumber === req.params.id
    );
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (!canAccessOrderResource(toPublicUserProfile(user), order)) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'IDOR_ORDER_ACCESS_DENIED',
        targetType: 'order',
        targetId: order.id,
        outcome: 'denied',
        details: `User '${user.id}' attempted to read order '${order.orderNumber}' belonging to another customer.`,
      });
      res.status(403).json({
        error: 'Forbidden: You do not have permission to view this order.',
      });
      return;
    }

    res.json({ order });
  }
);

// Link eligible Guest Order to Verified Reader Account
app.post(
  '/api/account/orders/link',
  requirePermission('account:orders'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    const orderNumber = sanitizeText(req.body?.orderNumber, 40).toUpperCase();
    const guestAccessToken = sanitizeText(req.body?.guestAccessToken, 120);

    if (!orderNumber) {
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'कृपया ऑर्डर क्रमांक टाका.'
            : 'Please enter the order number.',
      });
      return;
    }

    const order = ordersStore.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber
    );
    if (!order) {
      res.status(404).json({
        error:
          lang === 'mr'
            ? 'ऑर्डर सापडली नाही.'
            : 'No matching guest order found.',
      });
      return;
    }

    if (order.userId && order.userId !== user.id) {
      res.status(403).json({
        error:
          lang === 'mr'
            ? 'ही ऑर्डर आधीच दुसऱ्या खात्याशी जोडलेली आहे.'
            : 'This order is already linked to another account.',
      });
      return;
    }

    const tokenMatches =
      Boolean(guestAccessToken) &&
      Boolean(order.guestAccessToken) &&
      guestAccessToken === order.guestAccessToken;

    const verifiedEmailMatches =
      user.emailVerified &&
      order.customer.email.toLowerCase() === user.email.toLowerCase();

    if (!tokenMatches && !verifiedEmailMatches) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'GUEST_ORDER_LINK_DENIED',
        targetType: 'order',
        targetId: order.id,
        outcome: 'denied',
        details:
          'Attempted to link guest order without matching verified email or valid guestAccessToken.',
      });
      res.status(403).json({
        error:
          lang === 'mr'
            ? 'ऑर्डर जोडण्यासाठी वैध गेस्ट टोकन किंवा प्रमाणित ईमेल जुळणे आवश्यक आहे.'
            : 'Linking requires either a valid guest order access token or a verified matching email address.',
      });
      return;
    }

    order.userId = user.id;
    order.updatedAt = new Date().toISOString();
    order.auditTrail.push({
      timestamp: order.updatedAt,
      actor: user.email,
      action: 'ORDER_LINKED_TO_ACCOUNT',
      note: `Order linked to registered account (${user.id}).`,
    });

    res.json({ ok: true, order });
  }
);

app.post(
  '/api/account/wishlist/toggle',
  requirePermission('account:wishlist'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const bookId = sanitizeText(req.body?.bookId, 80);
    const book = booksStore.find((b) => b.id === bookId && isBookPubliclyVisible(b));
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const idx = user.wishlistBookIds.indexOf(bookId);
    let added = false;
    if (idx > -1) {
      user.wishlistBookIds.splice(idx, 1);
    } else {
      user.wishlistBookIds.push(bookId);
      added = true;
    }
    user.updatedAt = new Date().toISOString();

    res.json({
      added,
      wishlistBookIds: user.wishlistBookIds,
      user: toPublicUserProfile(user),
    });
  }
);

app.post(
  '/api/account/change-password',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    const currentPassword =
      typeof req.body?.currentPassword === 'string'
        ? req.body.currentPassword
        : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      res.status(401).json({
        error:
          lang === 'mr'
            ? 'सध्याचा पासवर्ड चुकीचा आहे.'
            : 'Current password is incorrect.',
      });
      return;
    }

    const pwdCheck = validatePasswordStrength(newPassword, lang);
    if (!pwdCheck.isValid) {
      res.status(400).json({ error: pwdCheck.error });
      return;
    }

    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    // Invalidate all other sessions except the current one
    const revokedOtherSessions = invalidateUserSessions(
      user.id,
      req.authSession?.id
    );

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'PASSWORD_CHANGED',
      targetType: 'user',
      targetId: user.id,
      outcome: 'success',
      details: `Password changed; revoked ${revokedOtherSessions} other active session(s).`,
    });

    res.json({
      ok: true,
      revokedOtherSessions,
      message:
        lang === 'mr'
          ? 'पासवर्ड यशस्वीरित्या बदलला आहे.'
          : 'Password changed successfully.',
    });
  }
);

app.get(
  '/api/account/sessions',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const currentId = req.authSession?.id;
    const activeSessions = sessionsStore
      .filter(
        (s) =>
          s.userId === user.id &&
          !s.revokedAt &&
          new Date(s.expiresAt).getTime() > Date.now()
      )
      .map((s) => ({
        id: s.id,
        userId: s.userId,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        lastActiveAt: s.lastActiveAt,
        isCurrent: s.id === currentId,
      }));

    res.json({ sessions: activeSessions });
  }
);

app.delete(
  '/api/account/sessions/:sessionId',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const targetSession = sessionsStore.find(
      (s) => s.id === req.params.sessionId
    );
    if (!targetSession) {
      res.status(404).json({ error: 'Session not found.' });
      return;
    }

    if (targetSession.userId !== user.id) {
      res.status(403).json({
        error: 'Forbidden: Cannot revoke another user’s session.',
      });
      return;
    }

    targetSession.revokedAt = new Date().toISOString();
    res.json({ ok: true });
  }
);

app.post(
  '/api/account/delete-request',
  requirePermission('account:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({
        error:
          lang === 'mr'
            ? 'खाते हटवण्यासाठी कृपया तुमचा पासवर्ड अचूक टाका.'
            : 'Please confirm your current password to deactivate your account.',
      });
      return;
    }

    const nowIso = new Date().toISOString();
    user.accountStatus = 'deactivated';
    user.deletionRequestedAt = nowIso;
    user.updatedAt = nowIso;

    // Invalidate all sessions while preserving order & audit history
    invalidateUserSessions(user.id);
    clearSessionCookie(res);

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'ACCOUNT_DEACTIVATION_REQUESTED',
      targetType: 'user',
      targetId: user.id,
      outcome: 'success',
      details:
        'User deactivated their account; sessions revoked, historical orders and audit trail preserved.',
    });

    res.json({
      ok: true,
      message:
        lang === 'mr'
          ? 'तुमचे खाते निष्क्रिय करण्यात आले आहे.'
          : 'Your account has been deactivated and signed out.',
    });
  }
);

// ============================================================================
// AUTHOR ONBOARDING & PUBLISHING PORTAL API (/api/author-applications, /api/author/*)
// ============================================================================

app.get(
  '/api/author-applications/mine',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const myApps = authorApplicationsStore.filter((a) => a.userId === user.id);
    res.json({ applications: myApps });
  }
);

app.post(
  '/api/author-applications',
  requirePermission('author:apply'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    const existingPending = authorApplicationsStore.find(
      (a) => a.userId === user.id && a.status === 'pending'
    );
    if (existingPending) {
      res.status(409).json({
        error:
          lang === 'mr'
            ? 'तुमचा लेखक अर्ज आधीच संपादकीय परीक्षणामध्ये आहे.'
            : 'You already have a pending author application under editorial review.',
      });
      return;
    }

    const penName = sanitizeText(req.body?.penName, 120) || user.name;
    const region = sanitizeText(req.body?.region, 80) || user.city || 'महाराष्ट्र';
    const literaryRole =
      sanitizeText(req.body?.literaryRole, 100) || 'लेखक व निबंधकार';
    const biography = sanitizeText(req.body?.biography, 1500);
    const portfolioSummary = sanitizeText(req.body?.portfolioSummary, 1500);
    const sampleWritingExcerpt = sanitizeText(
      req.body?.sampleWritingExcerpt,
      4000
    );
    const phoneCheck = validateIndianPhone(
      req.body?.phone || user.phone || '',
      lang
    );

    if (!phoneCheck.isValid || biography.length < 30 || sampleWritingExcerpt.length < 50) {
      res.status(400).json({
        error:
          phoneCheck.error ||
          (lang === 'mr'
            ? 'कृपया साहित्यिक परिचय (किमान ३० अक्षरे) आणि लेखनाचा नमुना (किमान ५० अक्षरे) भरा.'
            : 'Please provide a literary biography (min 30 chars) and writing sample (min 50 chars).'),
      });
      return;
    }

    const themes = Array.isArray(req.body?.themes)
      ? req.body.themes.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
      : ['समकालीन मराठी साहित्य'];

    const nowIso = new Date().toISOString();
    const application: AuthorApplicationRecord = {
      id: `app-${Date.now()}-${generateOpaqueToken(3)}`,
      userId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      phone: phoneCheck.normalizedValue,
      penName,
      region,
      literaryRole,
      biography,
      themes,
      portfolioSummary,
      sampleWritingExcerpt,
      // Explicitly pending; applicants cannot self-approve
      status: 'pending',
      submittedAt: nowIso,
      updatedAt: nowIso,
    };

    authorApplicationsStore.unshift(application);

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'AUTHOR_APPLICATION_SUBMITTED',
      targetType: 'author_application',
      targetId: application.id,
      outcome: 'success',
      details: `Submitted author onboarding application (${application.penName}).`,
    });

    res.status(201).json({ application });
  }
);

app.get(
  '/api/author/dashboard',
  requirePermission('author:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const authorProfile = authorsStore.find(
      (a) => a.id === user.linkedAuthorId || a.ownerUserId === user.id
    );

    const myBooks = booksStore.filter(
      (b) =>
        b.ownerUserId === user.id ||
        (user.linkedAuthorId && b.authorId === user.linkedAuthorId)
    );

    // Compute royalty & sales summary strictly for this author's books (never exposing customer PII)
    const myBookIds = new Set(myBooks.map((b) => b.id));
    let totalCopiesSold = 0;
    let grossBookRevenue = 0;
    for (const order of ordersStore) {
      if (order.paymentStatus === 'verified') {
        for (const item of order.items) {
          if (myBookIds.has(item.bookId)) {
            totalCopiesSold += item.approvedQuantity;
            grossBookRevenue += item.lineTotal;
          }
        }
      }
    }

    res.json({
      authorProfile: authorProfile || null,
      books: myBooks,
      royalties: {
        totalCopiesSold,
        grossBookRevenue,
        royaltyRatePercent: 15,
        estimatedRoyaltyInr: Math.round(grossBookRevenue * 0.15),
      },
    });
  }
);

app.patch(
  '/api/author/profile',
  requirePermission('author:profile'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    let authorProfile = authorsStore.find(
      (a) => a.id === user.linkedAuthorId || a.ownerUserId === user.id
    );

    if (!authorProfile) {
      const slug = `author-${user.id.slice(-6)}`;
      authorProfile = {
        id: `author-${Date.now()}`,
        slug,
        name: sanitizeText(req.body?.name, 120) || user.name,
        transliteratedName:
          sanitizeText(req.body?.transliteratedName, 120) || user.name,
        literaryRole:
          sanitizeText(req.body?.literaryRole, 100) || 'समकालीन मराठी लेखक',
        region: sanitizeText(req.body?.region, 80) || user.city || 'महाराष्ट्र',
        biography: sanitizeText(req.body?.biography, 1500) || user.bio || '',
        editorialNote:
          sanitizeText(req.body?.editorialNote, 600) ||
          'अकथ प्रकाशन मान्यताप्राप्त लेखक.',
        themes: ['मराठी साहित्य'],
        bookIds: [],
        articleIds: [],
        publicProfileStatus: 'published',
        verificationStatus: 'publisher_verified',
        provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक',
        ownerUserId: user.id,
      };
      authorsStore.unshift(authorProfile);
      user.linkedAuthorId = authorProfile.id;
    } else {
      if (typeof req.body?.name === 'string' && req.body.name.trim()) {
        authorProfile.name = sanitizeText(req.body.name, 120);
      }
      if (typeof req.body?.literaryRole === 'string') {
        authorProfile.literaryRole = sanitizeText(req.body.literaryRole, 100);
      }
      if (typeof req.body?.region === 'string') {
        authorProfile.region = sanitizeText(req.body.region, 80);
      }
      if (typeof req.body?.biography === 'string') {
        authorProfile.biography = sanitizeText(req.body.biography, 1500);
      }
      if (typeof req.body?.editorialNote === 'string') {
        authorProfile.editorialNote = sanitizeText(req.body.editorialNote, 600);
      }
    }

    res.json({ authorProfile });
  }
);

app.post(
  '/api/author/books',
  requirePermission('author:books:create'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    // Authors cannot directly publish without editorial moderation
    if (
      user.role !== 'admin' &&
      req.body?.publicationStatus === 'published'
    ) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'AUTHOR_DIRECT_PUBLISH_BLOCKED',
        targetType: 'book',
        outcome: 'denied',
        details:
          'Author attempted to create a book with publicationStatus="published" bypassing moderation.',
      });
      res.status(403).json({
        error:
          lang === 'mr'
            ? 'लेखक थेट पुस्तक प्रकाशित करू शकत नाहीत. कृपया प्रथम मसुदा तयार करून संपादकीय परीक्षणासाठी पाठवा.'
            : 'Authors cannot directly publish books without editorial moderation. Please save as a draft and submit for review.',
      });
      return;
    }

    const title = sanitizeText(req.body?.title, 180);
    const subtitle = sanitizeText(req.body?.subtitle, 180);
    const transliteratedTitle =
      sanitizeText(req.body?.transliteratedTitle, 180) || title;
    const category = sanitizeText(req.body?.category, 80) || 'कादंबरी';
    const description = sanitizeText(req.body?.description, 3000);
    const editorialContext =
      sanitizeText(req.body?.editorialContext, 1500) ||
      'अकथ प्रकाशन लेखक मसुदा.';
    const price = Math.max(50, Math.floor(Number(req.body?.price) || 280));
    const pageCount = Math.max(32, Math.floor(Number(req.body?.pageCount) || 160));
    const format =
      sanitizeText(req.body?.format, 100) ||
      'पेपरबॅक (क्रीम आर्चिव्हल पेपर)';

    if (title.length < 2 || description.length < 20) {
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'कृपया पुस्तकाचे शीर्षक आणि किमान २० अक्षरांचे वर्णन द्या.'
            : 'Please provide a book title and a description of at least 20 characters.',
      });
      return;
    }

    const categorySlugMap: Record<string, string> = {
      कादंबरी: 'novel',
      कथासंग्रह: 'short-stories',
      कवितासंग्रह: 'poetry',
      'समीक्षा व निबंध': 'essays',
      अनुवाद: 'translation',
    };

    const slugBase = transliteratedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${slugBase || 'akath-draft'}-${Date.now().toString().slice(-4)}`;

    const newBook: BookRecord = {
      id: `book-draft-${Date.now()}-${generateOpaqueToken(2)}`,
      slug,
      title,
      subtitle: subtitle || undefined,
      transliteratedTitle,
      authorId: user.linkedAuthorId || 'author-g-k-ainapure',
      contributorIds: [],
      category,
      categorySlug: categorySlugMap[category] || 'novel',
      topics: Array.isArray(req.body?.topics)
        ? req.body.topics.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
        : [category],
      language: 'मराठी',
      publisher: 'अकथ प्रकाशन',
      edition: 'पहिली आवृत्ती (मसुदा)',
      publicationDate: new Date().toISOString().slice(0, 10),
      pageCount,
      format,
      price,
      currency: 'INR',
      stock: Math.max(0, Math.floor(Number(req.body?.stock) || 25)),
      availability: 'forthcoming',
      shippingNote: 'संपादकीय मंजुरीनंतर वितरणासाठी उपलब्ध.',
      description,
      editorialContext,
      rightsNote: `© ${user.name} / अकथ प्रकाशन`,
      isFeatured: false,
      isNewRelease: true,
      isEditorSelection: false,
      relatedArticleIds: [],
      relatedBookIds: [],
      readingListIds: [],
      verificationStatus: 'publisher_verified',
      provenanceLabel: 'लेखक संपादकीय मसुदा',
      coverStyle: {
        backgroundHex: '#243B8A',
        accentHex: '#FFD966',
        textHex: '#FFFDF7',
        borderPattern: 'classic_frame',
        emblemText: 'अकथ मसुदा · कासव मुद्रा',
      },
      ownerUserId: user.id,
      publicationStatus: 'draft',
    };

    booksStore.unshift(newBook);

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'BOOK_DRAFT_CREATED',
      targetType: 'book',
      targetId: newBook.id,
      outcome: 'success',
      details: `Created book draft '${newBook.title}' (${newBook.id}).`,
    });

    res.status(201).json({ book: newBook });
  }
);

app.patch(
  '/api/author/books/:id',
  requirePermission('author:books:edit_own'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const perm = canAuthorModifyBook(toPublicUserProfile(user), book);
    if (!perm.allowed) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'AUTHOR_BOOK_EDIT_DENIED',
        targetType: 'book',
        targetId: book.id,
        outcome: 'denied',
        details: perm.reason || 'Unauthorized book edit attempt.',
      });
      res.status(403).json({ error: perm.reason || 'Forbidden.' });
      return;
    }

    // Authors cannot self-publish via PATCH
    if (
      user.role !== 'admin' &&
      req.body?.publicationStatus === 'published'
    ) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'AUTHOR_SELF_PUBLISH_BLOCKED',
        targetType: 'book',
        targetId: book.id,
        outcome: 'denied',
        details: 'Author attempted to set publicationStatus="published" directly.',
      });
      res.status(403).json({
        error:
          'Authors cannot directly publish books without administrative moderation.',
      });
      return;
    }

    if (typeof req.body?.title === 'string' && req.body.title.trim().length >= 2) {
      book.title = sanitizeText(req.body.title, 180);
    }
    if (typeof req.body?.subtitle === 'string') {
      book.subtitle = sanitizeText(req.body.subtitle, 180) || undefined;
    }
    if (
      typeof req.body?.description === 'string' &&
      req.body.description.trim().length >= 20
    ) {
      book.description = sanitizeText(req.body.description, 3000);
    }
    if (typeof req.body?.category === 'string' && req.body.category.trim()) {
      book.category = sanitizeText(req.body.category, 80);
    }
    if (req.body?.price !== undefined) {
      book.price = Math.max(50, Math.floor(Number(req.body.price) || book.price));
    }
    if (req.body?.pageCount !== undefined) {
      book.pageCount = Math.max(
        32,
        Math.floor(Number(req.body.pageCount) || book.pageCount || 160)
      );
    }

    res.json({ book });
  }
);

app.post(
  '/api/author/books/:id/cover',
  requirePermission('author:books:edit_own'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const perm = canAuthorModifyBook(toPublicUserProfile(user), book);
    if (!perm.allowed) {
      res.status(403).json({ error: perm.reason || 'Forbidden.' });
      return;
    }

    const check = validateCoverUpload(req.body?.fileMeta, lang);
    if (!check.isValid || !check.sanitized) {
      recordSecurityAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: req.ip || '127.0.0.1',
        action: 'UNSAFE_COVER_UPLOAD_REJECTED',
        targetType: 'book',
        targetId: book.id,
        outcome: 'denied',
        details: `Rejected cover upload: ${check.error}`,
      });
      res.status(400).json({ error: check.error });
      return;
    }

    book.coverUploadMeta = check.sanitized;
    res.json({ ok: true, book });
  }
);

app.post(
  '/api/author/books/:id/submit-review',
  requirePermission('author:books:submit_review'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const perm = canAuthorModifyBook(toPublicUserProfile(user), book);
    if (!perm.allowed) {
      res.status(403).json({ error: perm.reason || 'Forbidden.' });
      return;
    }

    book.publicationStatus = 'submitted_for_review';
    book.moderationFeedback = 'संपादकीय समितीच्या परीक्षणामध्ये प्राप्त.';

    recordSecurityAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'BOOK_SUBMITTED_FOR_REVIEW',
      targetType: 'book',
      targetId: book.id,
      outcome: 'success',
      details: `Book '${book.title}' submitted for editorial moderation.`,
    });

    res.json({ ok: true, book });
  }
);

// ============================================================================
// CART & CHECKOUT API (GUEST CONTINUITY + AUTHENTICATED LINKING)
// ============================================================================

app.post('/api/cart/quote', (req: AuthenticatedRequest, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (req.authUser) {
    req.authUser.savedCart = items.filter(
      (i: CartItemInput) =>
        i && typeof i.bookId === 'string' && Number(i.quantity) >= 1
    );
  }
  const quote = calculateServerCartQuote(items, lang);
  res.json(quote);
});

app.post('/api/orders', (req: AuthenticatedRequest, res: Response) => {
  const ip = req.ip || 'local';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'orders', 25)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : 'Too many requests. Please try again in a moment.',
    });
    return;
  }

  const idempotencyKey = sanitizeText(req.body?.idempotencyKey, 100);
  if (!idempotencyKey) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'ऑर्डर सुरक्षिततेसाठी idempotencyKey आवश्यक आहे.'
          : 'An idempotencyKey is required for order safety.',
    });
    return;
  }

  const existingOrder = ordersStore.find(
    (o) => o.idempotencyKey === idempotencyKey
  );
  if (existingOrder) {
    res.json({
      order: existingOrder,
      duplicatePrevented: true,
    });
    return;
  }

  const rawItems: CartItemInput[] = Array.isArray(req.body?.items)
    ? req.body.items
    : [];
  const quote = calculateServerCartQuote(rawItems, lang);

  if (!quote.isValidForCheckout) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'तुमच्या पिशवीतील पुस्तके सध्या ऑर्डरसाठी उपलब्ध नाहीत.'
          : 'Selected items in your cart are unavailable for checkout.',
      validationMessages: quote.validationMessages,
    });
    return;
  }

  const customer = req.body?.customer || {};
  const fullName = sanitizeText(customer.fullName, 120);
  const rawPhone = typeof customer.phone === 'string' ? customer.phone : '';
  const rawEmail = typeof customer.email === 'string' ? customer.email : '';
  const addressLine1 = sanitizeText(customer.addressLine1, 220);
  const addressLine2 = sanitizeText(customer.addressLine2, 220);
  const city = sanitizeText(customer.city, 80);
  const district = sanitizeText(customer.district, 80);
  const state = sanitizeText(customer.state, 80) || 'महाराष्ट्र';
  const rawPostalCode =
    typeof customer.postalCode === 'string' ? customer.postalCode : '';
  const orderNotes = sanitizeText(customer.orderNotes, 500);
  const isInstitutionalOrder = Boolean(customer.isInstitutionalOrder);
  const institutionName = sanitizeText(customer.institutionName, 160);

  const fieldErrors: Record<string, string> = {};

  if (fullName.length < 2) {
    fieldErrors.fullName =
      lang === 'mr' ? 'कृपया तुमचे पूर्ण नाव लिहा.' : 'Please enter your full name.';
  }

  const phoneCheck = validateIndianPhone(rawPhone, lang);
  if (!phoneCheck.isValid) {
    fieldErrors.phone = phoneCheck.error!;
  }

  const emailCheck = validateEmail(rawEmail, lang);
  if (!emailCheck.isValid) {
    fieldErrors.email = emailCheck.error!;
  }

  if (addressLine1.length < 5) {
    fieldErrors.addressLine1 =
      lang === 'mr'
        ? 'कृपया पूर्ण घर क्रमांक, रस्ता किंवा परिसराचा पत्ता लिहा.'
        : 'Please enter your complete street and locality address.';
  }

  if (city.length < 2) {
    fieldErrors.city =
      lang === 'mr'
        ? 'कृपया तुमचे शहर किंवा गाव लिहा.'
        : 'Please enter your city or town.';
  }

  const pinCheck = validateIndianPinCode(rawPostalCode, lang);
  if (!pinCheck.isValid) {
    fieldErrors.postalCode = pinCheck.error!;
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstErrorMessage = Object.values(fieldErrors)[0];
    res.status(400).json({
      error: firstErrorMessage,
      fieldErrors,
    });
    return;
  }

  const paymentMethod: OrderRecord['paymentMethod'] = [
    'upi_verified',
    'razorpay_standard',
    'institutional_invoice',
  ].includes(req.body?.paymentMethod)
    ? req.body.paymentMethod
    : 'upi_verified';

  const orderSeq = 1043 + ordersStore.length;
  const nowIso = new Date().toISOString();
  const guestAccessToken = `gtok-${generateOpaqueToken(20)}`;

  const newOrder: OrderRecord = {
    id: `ord-${Date.now()}`,
    orderNumber: `AK-2026-${orderSeq}`,
    idempotencyKey,
    userId: req.authUser?.id,
    guestAccessToken,
    createdAt: nowIso,
    updatedAt: nowIso,
    customer: {
      fullName,
      phone: phoneCheck.normalizedValue,
      email: emailCheck.normalizedValue,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      district: district || city,
      state,
      postalCode: pinCheck.normalizedValue,
      orderNotes: orderNotes || undefined,
      isInstitutionalOrder,
      institutionName: isInstitutionalOrder ? institutionName : undefined,
    },
    items: quote.items.filter((i) => i.approvedQuantity > 0),
    subtotal: quote.subtotal,
    shippingCost: quote.shippingCost,
    grandTotal: quote.grandTotal,
    currency: 'INR',
    paymentMethod,
    paymentStatus: 'unverified',
    orderStatus: 'pending_payment',
    fulfilment: {},
    auditTrail: [
      {
        timestamp: nowIso,
        actor: req.authUser ? req.authUser.email : 'guest',
        action: 'ORDER_CREATED',
        note: `सर्व्हर-तपासणीसह ऑर्डर तयार (एकूण: ₹${quote.grandTotal}). पेमेंट पडताळणी प्रलंबित.`,
      },
    ],
  };

  ordersStore.unshift(newOrder);
  recordAnalytics('checkout_initiated', newOrder.orderNumber, {
    grandTotal: newOrder.grandTotal,
  });

  res.status(201).json({ order: newOrder });
});

// ============================================================================
// SEC-01: PAYMENT VERIFICATION HELPERS, PII REDACTION & REPLAY PROTECTION
// ============================================================================

const consumedPaymentReferences = new Map<string, string>(); // paymentRef -> orderId

function verifyOpaqueTokenConstantTime(
  provided?: string,
  expected?: string
): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(hashOpaqueToken(provided.trim()), 'hex');
  const b = Buffer.from(hashOpaqueToken(expected.trim()), 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function maskEmailForRedactedOrder(email: string): string {
  const [local, domain] = (email || '').split('@');
  if (!local || !domain) return '***@***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function maskPhoneForRedactedOrder(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '**********';
  return `******${digits.slice(-4)}`;
}

function redactOrderForResponse(order: OrderRecord): OrderRecord {
  const cloned: OrderRecord = {
    ...order,
    guestAccessToken: undefined,
    customer: {
      ...order.customer,
      phone: maskPhoneForRedactedOrder(order.customer.phone),
      email: maskEmailForRedactedOrder(order.customer.email),
      addressLine1: `[Redacted — ${order.customer.city}]`,
      addressLine2: undefined,
    },
  };
  return cloned;
}

function executeOrderPaymentTransition(params: {
  order: OrderRecord;
  outcome: 'success' | 'failed';
  paymentReference?: string;
  actorLabel: string;
  lang: AppLanguage;
  authUser?: InternalUserRecord;
}): {
  status: number;
  body: Record<string, unknown>;
} {
  const { order, outcome, paymentReference, actorLabel, lang, authUser } = params;

  // Prevent arbitrary payment status updates on cancelled or refunded orders
  if (
    order.orderStatus === 'cancelled' ||
    order.orderStatus === 'refunded' ||
    order.paymentStatus === 'refunded'
  ) {
    return {
      status: 400,
      body: {
        error:
          lang === 'mr'
            ? 'रद्द केलेल्या किंवा परतावा दिलेल्या ऑर्डरची पेमेंट स्थिती बदलता येत नाही.'
            : 'Cannot modify payment status for a cancelled or refunded order.',
        code: 'INVALID_ORDER_STATE',
      },
    };
  }

  // Idempotent guard: prevent repeated inventory deductions if already verified
  if (order.paymentStatus === 'verified') {
    if (outcome === 'failed') {
      return {
        status: 400,
        body: {
          error:
            lang === 'mr'
              ? 'प्रमाणेित पेमेंट पुन्हा अयशस्वी म्हणून चिन्हांकित करता येत नाही.'
              : 'Cannot downgrade an already verified payment to failed.',
          code: 'ALREADY_VERIFIED_IMMUTABLE',
        },
      };
    }
    return {
      status: 200,
      body: {
        order: redactOrderForResponse(order),
        alreadyVerified: true,
      },
    };
  }

  const nowIso = new Date().toISOString();

  if (outcome === 'failed') {
    order.paymentStatus = 'failed';
    order.orderStatus = 'payment_failed';
    order.updatedAt = nowIso;
    order.auditTrail.push({
      timestamp: nowIso,
      actor: actorLabel,
      action: 'PAYMENT_FAILED',
      note: 'पेमेंट गेटवेकडून व्यवहार अपयशी/रद्द झाल्याचा संदेश. साठा राखीव ठेवलेला नाही.',
    });
    recordAnalytics('payment_failed', order.orderNumber);
    return {
      status: 200,
      body: {
        order: redactOrderForResponse(order),
      },
    };
  }

  // Check paymentReference replay across different orders
  const cleanRef = sanitizeText(paymentReference, 80);
  if (cleanRef) {
    const existingOrderForRef = consumedPaymentReferences.get(cleanRef);
    if (existingOrderForRef && existingOrderForRef !== order.id) {
      return {
        status: 409,
        body: {
          error:
            lang === 'mr'
              ? 'हा पेमेंट संदर्भ क्रमांक आधीच वापरला गेला आहे.'
              : 'This payment reference has already been used for another order.',
          code: 'PAYMENT_REFERENCE_REPLAY',
        },
      };
    }
  }

  // Verify stock availability before any deduction
  for (const line of order.items) {
    const book = booksStore.find((b) => b.id === line.bookId);
    if (!book || book.stock < line.approvedQuantity) {
      return {
        status: 409,
        body: {
          error:
            lang === 'mr'
              ? `'${line.title}' चा साठा आता अपुरा आहे. कृपया ऑर्डर पुन्हा तपासा.`
              : `'${line.title}' no longer has enough stock. Please review your cart.`,
          code: 'INSUFFICIENT_STOCK',
        },
      };
    }
  }

  // Deduct stock exactly once and record inventory movement
  for (const line of order.items) {
    const book = booksStore.find((b) => b.id === line.bookId);
    if (book) {
      const previousStock = book.stock;
      book.stock = Math.max(0, book.stock - line.approvedQuantity);
      if (book.stock === 0) {
        book.availability = 'out_of_stock';
      } else if (book.stock <= 5) {
        book.availability = 'limited_stock';
      }
      inventoryMovementsStore.unshift({
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowIso,
        bookId: book.id,
        bookTitle: book.title,
        isbn: book.isbn,
        type: 'order_reserved',
        delta: -line.approvedQuantity,
        previousStock,
        newStock: book.stock,
        reason: `Verified payment for order ${order.orderNumber}`,
        actorEmail: actorLabel,
      });
    }
  }

  const finalPaymentRef =
    cleanRef ||
    `UPI-AKATH-${Math.floor(100000000 + Math.random() * 900000000)}`;
  consumedPaymentReferences.set(finalPaymentRef, order.id);

  order.paymentStatus = 'verified';
  order.paymentReference = finalPaymentRef;
  order.orderStatus = 'payment_verified';
  order.updatedAt = nowIso;
  order.auditTrail.push({
    timestamp: nowIso,
    actor: actorLabel,
    action: 'PAYMENT_VERIFIED',
    note: `सर्व्हरद्वारे पेमेंट पडताळणी पूर्ण (संदर्भ: ${finalPaymentRef}). पुस्तक साठा अद्ययावत केला.`,
  });

  if (authUser) {
    authUser.savedCart = [];
  }

  recordAnalytics('purchase_completed', order.orderNumber, {
    grandTotal: order.grandTotal,
  });

  return {
    status: 200,
    body: {
      order: redactOrderForResponse(order),
    },
  };
}

// 1. Dedicated Payment Provider Webhook Endpoint (HMAC-SHA256 Signed & Replay-Protected)
app.post('/api/webhooks/payment', (req: AuthenticatedRequest, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  if (!checkRateLimit(ip, 'payment_webhook', 30, 60_000)) {
    res.status(429).json({
      error: 'Too many webhook requests.',
      code: 'RATE_LIMITED',
    });
    return;
  }

  const signatureHeader =
    (req.headers['x-webhook-signature'] as string | undefined) ||
    (req.headers['x-razorpay-signature'] as string | undefined);
  const timestampHeader = req.headers['x-webhook-timestamp'] as
    | string
    | undefined;
  const eventId = sanitizeText(
    req.body?.eventId || req.headers['x-webhook-event-id'],
    100
  );
  const rawPayload = req.rawBody ?? JSON.stringify(req.body ?? {});

  const verification = verifyPaymentWebhookSignatureWithDetails(
    rawPayload,
    signatureHeader,
    PAYMENT_WEBHOOK_SECRET,
    {
      timestampHeader,
      eventId: eventId || undefined,
      enforceReplayProtection: true,
    }
  );

  if (!verification.valid) {
    recordSecurityAudit({
      actorUserId: null,
      actorRole: 'guest',
      ipAddress: ip,
      action: `PAYMENT_WEBHOOK_REJECTED:${(verification.reason || 'invalid').toUpperCase()}`,
      targetType: 'order',
      targetId: sanitizeText(req.body?.orderId || req.body?.orderNumber, 60),
      outcome: 'denied',
      details: `Payment webhook rejected (${verification.reason}).`,
    });
    const status = verification.reason === 'replayed_event' ? 409 : 401;
    res.status(status).json({
      error:
        verification.reason === 'replayed_event'
          ? 'Duplicate or replayed webhook event.'
          : 'Invalid or missing payment webhook signature.',
      code: (verification.reason || 'invalid_signature').toUpperCase(),
    });
    return;
  }

  const targetOrderId = sanitizeText(
    req.body?.orderId || req.body?.orderNumber,
    60
  );
  const order = ordersStore.find(
    (o) =>
      o.id === targetOrderId ||
      o.orderNumber.toUpperCase() === targetOrderId.toUpperCase()
  );
  if (!order) {
    res.status(404).json({ error: 'Order not found.', code: 'ORDER_NOT_FOUND' });
    return;
  }

  // Verify webhook amount matches server order total if provided
  if (
    req.body?.amount !== undefined &&
    Number(req.body.amount) !== order.grandTotal
  ) {
    recordSecurityAudit({
      actorUserId: null,
      actorRole: 'guest',
      ipAddress: ip,
      action: 'PAYMENT_WEBHOOK_AMOUNT_MISMATCH',
      targetType: 'order',
      targetId: order.id,
      outcome: 'denied',
      details: `Webhook amount (${req.body.amount}) did not match order grandTotal (${order.grandTotal}).`,
    });
    res.status(400).json({
      error: 'Webhook payment amount does not match order grandTotal.',
      code: 'AMOUNT_MISMATCH',
    });
    return;
  }

  const outcome = req.body?.outcome === 'failed' ? 'failed' : 'success';
  const result = executeOrderPaymentTransition({
    order,
    outcome,
    paymentReference: req.body?.paymentReference,
    actorLabel: 'payment_gateway_webhook',
    lang: 'en',
  });

  if (result.status !== 200) {
    res.status(result.status).json(result.body);
    return;
  }

  recordSecurityAudit({
    actorUserId: null,
    actorRole: 'guest',
    ipAddress: ip,
    action: `PAYMENT_WEBHOOK_${outcome.toUpperCase()}`,
    targetType: 'order',
    targetId: order.id,
    outcome: 'success',
    details: `Authentic payment webhook processed for order '${order.orderNumber}'.`,
  });

  // Return minimal webhook acknowledgement with zero customer PII
  res.status(200).json({
    received: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    alreadyVerified: Boolean(result.body.alreadyVerified),
  });
});

// 2. Dedicated Admin Manual Payment Verification Endpoint
app.post(
  '/api/admin/orders/:id/verify-payment',
  requirePermission('admin:orders:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const ip = req.ip || '127.0.0.1';
    const admin = req.authUser!;
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
    if (!checkRateLimit(ip, 'admin_verify_payment', 30, 60_000)) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    const order = ordersStore.find(
      (o) =>
        o.id === req.params.id ||
        o.orderNumber.toUpperCase() === String(req.params.id).toUpperCase()
    );
    if (!order) {
      res.status(404).json({
        error: lang === 'mr' ? 'ऑर्डर सापडली नाही.' : 'Order not found.',
      });
      return;
    }

    const outcome = req.body?.outcome === 'failed' ? 'failed' : 'success';
    const result = executeOrderPaymentTransition({
      order,
      outcome,
      paymentReference: req.body?.paymentReference,
      actorLabel: admin.email,
      lang,
    });

    if (result.status === 200) {
      recordSecurityAudit({
        actorUserId: admin.id,
        actorEmail: admin.email,
        actorRole: admin.role,
        ipAddress: ip,
        action: `ADMIN_PAYMENT_VERIFY_${outcome.toUpperCase()}`,
        targetType: 'order',
        targetId: order.id,
        outcome: 'success',
        details: `Admin manually verified payment (${outcome}) for order '${order.orderNumber}'.`,
      });
    }

    res.status(result.status).json(result.body);
  }
);

// Server-Side HMAC Signature Verification Middleware (Enforces PAYMENT_WEBHOOK_SECRET HMAC-SHA256)
function verifyPaymentHmacMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || '127.0.0.1';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

  const signatureHeader =
    (req.headers['x-webhook-signature'] as string | undefined) ||
    (req.headers['x-hmac-signature'] as string | undefined) ||
    (req.headers['x-payment-signature'] as string | undefined) ||
    (req.headers['x-razorpay-signature'] as string | undefined);
  const timestampHeader =
    (req.headers['x-webhook-timestamp'] as string | undefined) ||
    (req.headers['x-payment-timestamp'] as string | undefined);
  const eventId = sanitizeText(
    req.body?.eventId || req.headers['x-webhook-event-id'],
    100
  );

  if (!signatureHeader || !signatureHeader.trim()) {
    recordSecurityAudit({
      actorUserId: req.authUser?.id ?? null,
      actorEmail: req.authUser?.email,
      actorRole: req.authUser?.role ?? 'guest',
      ipAddress: ip,
      action: 'ORDER_PAYMENT_VERIFY_MISSING_HMAC',
      targetType: 'order',
      targetId: sanitizeText(req.params.id || req.body?.orderId, 60),
      outcome: 'denied',
      details:
        'Rejected payment verification request: missing HMAC signature header.',
    });
    res.status(401).json({
      error:
        lang === 'mr'
          ? 'पेमेंट पडताळणीसाठी वैध HMAC स्वाक्षरी (signature) आवश्यक आहे.'
          : 'A valid HMAC payment signature header is required to process payment verification.',
      code: 'MISSING_SIGNATURE',
    });
    return;
  }

  const rawPayload = req.rawBody ?? JSON.stringify(req.body ?? {});
  const webhookCheck = verifyPaymentWebhookSignatureWithDetails(
    rawPayload,
    signatureHeader,
    PAYMENT_WEBHOOK_SECRET,
    {
      timestampHeader,
      eventId: eventId || undefined,
      enforceReplayProtection: true,
    }
  );

  if (!webhookCheck.valid) {
    recordSecurityAudit({
      actorUserId: req.authUser?.id ?? null,
      actorEmail: req.authUser?.email,
      actorRole: req.authUser?.role ?? 'guest',
      ipAddress: ip,
      action: `ORDER_PAYMENT_VERIFY_BAD_SIGNATURE:${(
        webhookCheck.reason || 'invalid'
      ).toUpperCase()}`,
      targetType: 'order',
      targetId: sanitizeText(req.params.id || req.body?.orderId, 60),
      outcome: 'denied',
      details: `Rejected invalid/replayed HMAC signature (${webhookCheck.reason}).`,
    });
    const errStatus = webhookCheck.reason === 'replayed_event' ? 409 : 403;
    res.status(errStatus).json({
      error:
        webhookCheck.reason === 'replayed_event'
          ? 'Duplicate or replayed payment verification event.'
          : 'Invalid or expired HMAC payment signature.',
      code: (webhookCheck.reason || 'INVALID_SIGNATURE').toUpperCase(),
    });
    return;
  }

  next();
}

// 3. HMAC-Protected Payment Verification Endpoint (Strictly requires valid PAYMENT_WEBHOOK_SECRET HMAC signature)
app.post(
  '/api/orders/:id/verify-payment',
  verifyPaymentHmacMiddleware,
  (req: AuthenticatedRequest, res: Response) => {
    const ip = req.ip || '127.0.0.1';
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    if (!checkRateLimit(ip, 'verify_payment', 15, 60_000)) {
      res.status(429).json({
        error:
          lang === 'mr'
            ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
            : 'Too many payment verification attempts. Please wait a moment.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    const order = ordersStore.find(
      (o) =>
        o.id === req.params.id ||
        o.orderNumber.toUpperCase() === String(req.params.id).toUpperCase()
    );
    if (!order) {
      res.status(404).json({
        error: lang === 'mr' ? 'ऑर्डर सापडली नाही.' : 'Order not found.',
      });
      return;
    }

    // Additional defense-in-depth ownership check if guest token or user session is attached
    const providedGuestToken = sanitizeText(
      req.body?.guestAccessToken || req.headers['x-guest-access-token'],
      120
    );
    const isAdmin =
      req.authUser?.role === 'admin' &&
      hasPermission(
        req.authUser.role,
        req.authUser.accountStatus,
        'admin:orders:manage'
      );
    const isCrossUserAttempt = Boolean(
      req.authUser &&
        !isAdmin &&
        order.userId &&
        order.userId !== req.authUser.id
    );
    const hasInvalidProvidedGuestToken = Boolean(
      providedGuestToken &&
        !verifyOpaqueTokenConstantTime(
          providedGuestToken,
          order.guestAccessToken
        )
    );

    if (isCrossUserAttempt || hasInvalidProvidedGuestToken) {
      recordSecurityAudit({
        actorUserId: req.authUser?.id ?? null,
        actorEmail: req.authUser?.email,
        actorRole: req.authUser?.role ?? 'guest',
        ipAddress: ip,
        action: 'ORDER_PAYMENT_VERIFY_FORBIDDEN',
        targetType: 'order',
        targetId: order.id,
        outcome: 'denied',
        details: `Blocked cross-user or invalid-token payment verification attempt on order '${order.orderNumber}'.`,
      });
      res.status(403).json({
        error:
          lang === 'mr'
            ? 'या ऑर्डरचे पेमेंट सत्यापित करण्याची परवानगी नाही.'
            : 'Forbidden: You are not authorized to verify payment for this order.',
        code: 'ORDER_OWNERSHIP_REQUIRED',
      });
      return;
    }

    // Prevent payment amount / total tampering
    const suppliedAmount = req.body?.amount ?? req.body?.grandTotal;
    if (
      suppliedAmount !== undefined &&
      Number(suppliedAmount) !== order.grandTotal
    ) {
      recordSecurityAudit({
        actorUserId: req.authUser?.id ?? null,
        actorEmail: req.authUser?.email,
        actorRole: req.authUser?.role ?? 'guest',
        ipAddress: ip,
        action: 'PAYMENT_AMOUNT_TAMPER_BLOCKED',
        targetType: 'order',
        targetId: order.id,
        outcome: 'denied',
        details: `Tampered payment amount (${suppliedAmount}) rejected; expected ₹${order.grandTotal}.`,
      });
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'पेमेंट रक्कम ऑर्डरच्या एकूण रकमेपेक्षा वेगळी आहे.'
            : 'Payment amount does not match the server-calculated order total.',
        code: 'PAYMENT_AMOUNT_MISMATCH',
      });
      return;
    }

    const outcome = req.body?.outcome === 'failed' ? 'failed' : 'success';
    const actorLabel = req.authUser?.email || 'payment_gateway_hmac_verified';

    const result = executeOrderPaymentTransition({
      order,
      outcome,
      paymentReference: req.body?.paymentReference,
      actorLabel,
      lang,
      authUser: req.authUser,
    });

    res.status(result.status).json(result.body);
  }
);

// 4. Server-Side Storefront Checkout Payment Capture Endpoint (Verifies Ownership & Signs HMAC Server-Side)
app.post(
  '/api/orders/:id/checkout-payment',
  (req: AuthenticatedRequest, res: Response) => {
    const ip = req.ip || '127.0.0.1';
    const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';

    if (!checkRateLimit(ip, 'checkout_payment', 15, 60_000)) {
      res.status(429).json({
        error:
          lang === 'mr'
            ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
            : 'Too many payment verification attempts. Please wait a moment.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    if (req.authViaCookie && req.authSession) {
      const headerCsrf = req.headers['x-csrf-token'];
      if (
        typeof headerCsrf !== 'string' ||
        headerCsrf !== req.authSession.csrfToken
      ) {
        res.status(403).json({
          error: 'Invalid or missing CSRF security token.',
          code: 'CSRF_INVALID',
        });
        return;
      }
    }

    const providedGuestToken = sanitizeText(
      req.body?.guestAccessToken || req.headers['x-guest-access-token'],
      120
    );

    if (!req.authUser && !providedGuestToken) {
      res.status(401).json({
        error:
          lang === 'mr'
            ? 'पेमेंट पडताळणीसाठी अधिकृत सत्र किंवा ऑर्डर सुरक्षा टोकन आवश्यक आहे.'
            : 'Authentication or guest order token is required to confirm checkout payment.',
        code: 'UNAUTHENTICATED_CHECKOUT_PAYMENT',
      });
      return;
    }

    const order = ordersStore.find(
      (o) =>
        o.id === req.params.id ||
        o.orderNumber.toUpperCase() === String(req.params.id).toUpperCase()
    );
    if (!order) {
      res.status(404).json({
        error: lang === 'mr' ? 'ऑर्डर सापडली नाही.' : 'Order not found.',
      });
      return;
    }

    const isAdmin =
      req.authUser?.role === 'admin' &&
      hasPermission(
        req.authUser.role,
        req.authUser.accountStatus,
        'admin:orders:manage'
      );
    const isAuthenticatedOwner = Boolean(
      req.authUser && order.userId && req.authUser.id === order.userId
    );
    const hasValidGuestToken = verifyOpaqueTokenConstantTime(
      providedGuestToken,
      order.guestAccessToken
    );
    const isCrossUserAttempt = Boolean(
      req.authUser &&
        !isAdmin &&
        order.userId &&
        order.userId !== req.authUser.id
    );

    if (
      isCrossUserAttempt ||
      (!isAdmin && !isAuthenticatedOwner && !hasValidGuestToken)
    ) {
      res.status(403).json({
        error:
          lang === 'mr'
            ? 'या ऑर्डरचे पेमेंट सत्यापित करण्याची परवानगी नाही.'
            : 'Forbidden: You are not authorized to verify payment for this order.',
        code: 'ORDER_OWNERSHIP_REQUIRED',
      });
      return;
    }

    const outcome = req.body?.outcome === 'failed' ? 'failed' : 'success';
    const ts = String(Date.now());
    const serverGatewayPayload = JSON.stringify({
      orderId: order.id,
      outcome,
      amount: order.grandTotal,
      timestamp: ts,
    });
    const serverHmac = computeWebhookSignature(
      serverGatewayPayload,
      PAYMENT_WEBHOOK_SECRET,
      ts
    );
    const hmacCheck = verifyPaymentWebhookSignatureWithDetails(
      serverGatewayPayload,
      serverHmac,
      PAYMENT_WEBHOOK_SECRET,
      {
        timestampHeader: ts,
        eventId: `chk-${order.id}-${ts}-${Math.random().toString(36).slice(2, 7)}`,
        enforceReplayProtection: true,
      }
    );
    if (!hmacCheck.valid) {
      res.status(403).json({
        error: 'Server payment gateway HMAC verification failed.',
        code: 'GATEWAY_HMAC_FAILED',
      });
      return;
    }

    const result = executeOrderPaymentTransition({
      order,
      outcome,
      paymentReference: req.body?.paymentReference,
      actorLabel: req.authUser?.email || 'verified_checkout_owner',
      lang,
      authUser: req.authUser,
    });

    res.status(result.status).json(result.body);
  }
);

// Guest order lookup (requires Order Number + matching Contact OR unguessable guestAccessToken)
app.get('/api/orders/lookup', (req: Request, res: Response) => {
  const ip = req.ip || '127.0.0.1';
  const lang: AppLanguage = req.query.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'order_lookup', 20, 60_000)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : 'Too many order lookup requests. Please wait a moment.',
    });
    return;
  }

  const orderNumber = sanitizeText(req.query.orderNumber, 40).toUpperCase();
  const rawContact = sanitizeText(req.query.contact, 120).toLowerCase();
  const guestToken = sanitizeText(req.query.token, 120);

  if (!orderNumber || (!rawContact && !guestToken)) {
    res.status(400).json({
      error:
        lang === 'mr'
          ? 'कृपया ऑर्डर क्रमांक आणि नोंदणीकृत ईमेल, मोबाईल क्रमांक किंवा ऑर्डर टोकन टाका.'
          : 'Please enter both your order number and registered email, mobile number, or guest access token.',
    });
    return;
  }

  const phoneLookup = validateIndianPhone(rawContact, lang);
  const normalizedPhone = phoneLookup.isValid
    ? phoneLookup.normalizedValue
    : rawContact.replace(/\D/g, '');

  const order = ordersStore.find((o) => {
    if (o.orderNumber.toUpperCase() !== orderNumber) return false;
    if (
      guestToken &&
      o.guestAccessToken &&
      verifyOpaqueTokenConstantTime(guestToken, o.guestAccessToken)
    ) {
      return true;
    }
    if (!rawContact) return false;
    return (
      o.customer.email.toLowerCase() === rawContact ||
      (normalizedPhone.length >= 10 && o.customer.phone === normalizedPhone)
    );
  });

  if (!order) {
    res.status(404).json({
      error:
        lang === 'mr'
          ? 'दिलेल्या क्रमांकाशी जुळणारी ऑर्डर सापडली नाही. कृपया तपशील पुन्हा तपासा.'
          : 'No matching order found for these details. Please double-check and try again.',
    });
    return;
  }

  res.json({ order: redactOrderForResponse(order) });
});

// ============================================================================
// MANUSCRIPT SUBMISSION, NEWSLETTER & CONTACT API
// ============================================================================

app.post('/api/manuscripts', (req, res) => {
  const ip = req.ip || 'local';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'manuscripts', 10)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया काही मिनिटांनी पुन्हा प्रयत्न करा.'
          : 'Please wait a few minutes before submitting again.',
    });
    return;
  }

  if (req.body?.websiteUrl) {
    res.status(200).json({ fakeSuccess: true });
    return;
  }

  const authorName = sanitizeText(req.body?.authorName, 120);
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const rawPhone = typeof req.body?.phone === 'string' ? req.body.phone : '';
  const city = sanitizeText(req.body?.city, 80);
  const manuscriptTitle = sanitizeText(req.body?.manuscriptTitle, 180);
  const category = sanitizeText(req.body?.category, 80);
  const wordCountEstimate = sanitizeText(req.body?.wordCountEstimate, 60);
  const synopsis = sanitizeText(req.body?.synopsis, 3000);
  const sampleExcerptText = sanitizeText(req.body?.sampleExcerptText, 8000);
  const originalWorkConfirmed = Boolean(req.body?.originalWorkConfirmed);
  const privacyConsentConfirmed = Boolean(req.body?.privacyConsentConfirmed);

  const fieldErrors: Record<string, string> = {};
  if (authorName.length < 2) {
    fieldErrors.authorName =
      lang === 'mr'
        ? 'कृपया लेखकाचे पूर्ण नाव लिहा.'
        : 'Please enter the author’s full name.';
  }

  const emailCheck = validateEmail(rawEmail, lang);
  if (!emailCheck.isValid) {
    fieldErrors.email = emailCheck.error!;
  }

  const phoneCheck = validateIndianPhone(rawPhone, lang);
  if (!phoneCheck.isValid) {
    fieldErrors.phone = phoneCheck.error!;
  }

  if (manuscriptTitle.length < 2) {
    fieldErrors.manuscriptTitle =
      lang === 'mr'
        ? 'कृपया हस्तलिखिताचे शीर्षक लिहा.'
        : 'Please enter the manuscript title.';
  }

  if (synopsis.length < 40) {
    fieldErrors.synopsis =
      lang === 'mr'
        ? 'कृपया हस्तलिखिताचा किमान ४० अक्षरांचा सारांश लिहा.'
        : 'Please provide a synopsis of at least 40 characters.';
  }

  if (sampleExcerptText.length < 80) {
    fieldErrors.sampleExcerptText =
      lang === 'mr'
        ? 'कृपया किमान ८० अक्षरांचा नमुना उतारा समाविष्ट करा.'
        : 'Please include a sample excerpt of at least 80 characters.';
  }

  if (!originalWorkConfirmed || !privacyConsentConfirmed) {
    fieldErrors.consent =
      lang === 'mr'
        ? 'कृपया मूळ लेखनाची हमी आणि गोपनीयता संमती तपासा.'
        : 'Please confirm original authorship and privacy consent.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    res.status(400).json({
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    });
    return;
  }

  let fileAttachmentMeta: ManuscriptSubmission['fileAttachmentMeta'];
  if (
    req.body?.fileAttachmentMeta &&
    typeof req.body.fileAttachmentMeta === 'object'
  ) {
    const rawFile = req.body.fileAttachmentMeta;
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf'];
    const fileName = sanitizeText(rawFile.fileName, 160);
    const hasValidExt = allowedExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext)
    );
    const sizeBytes = Number(rawFile.fileSizeBytes) || 0;

    if (!hasValidExt || sizeBytes > 15 * 1024 * 1024) {
      res.status(400).json({
        error:
          lang === 'mr'
            ? 'फक्त PDF, DOCX किंवा TXT फॉरमॅटमधील १५ MB पर्यंतची फाईल स्वीकारली जाते.'
            : 'Only PDF, DOCX, or TXT files up to 15 MB are accepted.',
      });
      return;
    }

    fileAttachmentMeta = {
      fileName,
      fileType: sanitizeText(rawFile.fileType, 80),
      fileSizeBytes: sizeBytes,
    };
  }

  const refNum = 205 + manuscriptsStore.length;
  const submission: ManuscriptSubmission = {
    id: `ms-${Date.now()}`,
    referenceCode: `AK-MS-2026-${refNum}`,
    submittedAt: new Date().toISOString(),
    authorName,
    email: emailCheck.normalizedValue,
    phone: phoneCheck.normalizedValue,
    city: city || 'महाराष्ट्र',
    manuscriptTitle,
    category: category || 'कादंबरी',
    wordCountEstimate: wordCountEstimate || 'नमूद नाही',
    synopsis,
    sampleExcerptText,
    fileAttachmentMeta,
    originalWorkConfirmed,
    privacyConsentConfirmed,
    reviewStatus: 'received',
    editorialInternalNote: 'संपादकीय प्राथमिक वाचनासाठी प्राप्त.',
  };

  manuscriptsStore.unshift(submission);
  recordAnalytics('manuscript_submitted', submission.referenceCode, { category });

  res.status(201).json({ submission });
});

app.post('/api/newsletter/subscribe', (req, res) => {
  const ip = req.ip || 'local';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'newsletter', 15)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : 'Too many attempts. Please try again shortly.',
    });
    return;
  }

  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const name = sanitizeText(req.body?.name, 100);
  const consentConfirmed = req.body?.consentConfirmed !== false;
  const subscriptionSource = sanitizeText(req.body?.source, 80) || 'website';
  const preferredTopics = Array.isArray(req.body?.preferredTopics)
    ? req.body.preferredTopics
        .map((t: unknown) => sanitizeText(t, 40))
        .filter(Boolean)
    : ['नवीन पुस्तके', 'वाचनकट्टा निवड'];

  const emailCheck = validateEmail(rawEmail, lang);
  if (!emailCheck.isValid) {
    res.status(400).json({
      error: emailCheck.error,
      fieldErrors: { email: emailCheck.error },
    });
    return;
  }

  if (!consentConfirmed) {
    const consentMsg =
      lang === 'mr'
        ? 'वाचनपत्रिका पाठवण्यासाठी तुमची संमती आवश्यक आहे.'
        : 'Please confirm consent to receive the literary newsletter.';
    res.status(400).json({
      error: consentMsg,
      fieldErrors: { consent: consentMsg },
    });
    return;
  }

  const normalizedEmail = emailCheck.normalizedValue;
  const existing = subscribersStore.find(
    (s) => s.email.toLowerCase() === normalizedEmail
  );
  if (existing) {
    existing.status = 'active';
    existing.preferredTopics = preferredTopics;
    if (name) existing.name = name;
    res.json({
      subscriber: existing,
      message:
        lang === 'mr'
          ? 'तुमची अकथ वाचनपत्रिका नोंदणी अद्ययावत करण्यात आली आहे.'
          : 'Your Akath literary newsletter subscription has been updated.',
    });
    return;
  }

  const subscriber: NewsletterSubscriber = {
    id: `sub-${Date.now()}`,
    email: normalizedEmail,
    name: name || undefined,
    preferredTopics,
    consentConfirmed: true,
    subscriptionSource,
    subscribedAt: new Date().toISOString(),
    status: 'active',
    unsubscribeToken: `unsub-akath-${Math.random().toString(36).slice(2, 10)}`,
  };

  subscribersStore.unshift(subscriber);
  recordAnalytics('newsletter_subscribed', undefined, {
    source: subscriptionSource,
  });

  res.status(201).json({
    subscriber,
    message:
      lang === 'mr'
        ? 'अकथ वाचनपत्रिकेत तुमचे स्वागत आहे! दर पंधरवड्याला निवडक मराठी वाचन तुमच्या ईमेलवर येईल.'
        : 'Welcome to the Akath Literary Newsletter. Curated Marathi reading notes will arrive fortnightly.',
  });
});

app.post('/api/contact', (req, res) => {
  const ip = req.ip || 'local';
  const lang: AppLanguage = req.body?.lang === 'en' ? 'en' : 'mr';
  if (!checkRateLimit(ip, 'contact', 15)) {
    res.status(429).json({
      error:
        lang === 'mr'
          ? 'कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
          : 'Please wait a moment before trying again.',
    });
    return;
  }

  const name = sanitizeText(req.body?.name, 120);
  const role = [
    'Reader',
    'Author',
    'Bookstore_Institution',
    'Contributor',
  ].includes(req.body?.role)
    ? req.body.role
    : 'Reader';
  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const rawPhone = typeof req.body?.phone === 'string' ? req.body.phone : '';
  const rawEmailOrPhone =
    typeof req.body?.emailOrPhone === 'string' ? req.body.emailOrPhone : '';
  const subject = sanitizeText(req.body?.subject, 180);
  const message = sanitizeText(req.body?.message, 2500);
  const preferWhatsAppFollowup = Boolean(req.body?.preferWhatsAppFollowup);

  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) {
    fieldErrors.name =
      lang === 'mr' ? 'कृपया तुमचे नाव लिहा.' : 'Please enter your name.';
  }

  let validatedContactSummary = '';
  if (rawEmail || rawPhone) {
    if (rawEmail) {
      const eCheck = validateEmail(rawEmail, lang);
      if (!eCheck.isValid) {
        fieldErrors.email = eCheck.error!;
      } else {
        validatedContactSummary = eCheck.normalizedValue;
      }
    }
    if (rawPhone) {
      const pCheck = validateIndianPhone(rawPhone, lang);
      if (!pCheck.isValid) {
        fieldErrors.phone = pCheck.error!;
      } else {
        validatedContactSummary = validatedContactSummary
          ? `${validatedContactSummary} / ${pCheck.normalizedValue}`
          : pCheck.normalizedValue;
      }
    }
    if (!rawEmail && !rawPhone) {
      fieldErrors.email =
        lang === 'mr'
          ? 'कृपया वैध ईमेल पत्ता लिहा.'
          : 'Please enter a valid email address.';
    }
  } else {
    const trimmed = rawEmailOrPhone.trim();
    if (trimmed.includes('@')) {
      const eCheck = validateEmail(trimmed, lang);
      if (!eCheck.isValid) {
        fieldErrors.emailOrPhone = eCheck.error!;
      } else {
        validatedContactSummary = eCheck.normalizedValue;
      }
    } else {
      const pCheck = validateIndianPhone(trimmed, lang);
      if (!pCheck.isValid) {
        fieldErrors.emailOrPhone = pCheck.error!;
      } else {
        validatedContactSummary = pCheck.normalizedValue;
      }
    }
  }

  if (message.length < 10) {
    fieldErrors.message =
      lang === 'mr'
        ? 'कृपया तुमचा संदेश सविस्तर लिहा (किमान १० अक्षरे).'
        : 'Please write a message of at least 10 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    res.status(400).json({
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    });
    return;
  }

  const inquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    name,
    role,
    emailOrPhone: validatedContactSummary,
    subject: subject || 'सर्वसाधारण चौकशी',
    message,
    preferWhatsAppFollowup,
  };

  inquiriesStore.unshift(inquiry);
  recordAnalytics('contact_completed', undefined, { role });

  res.status(201).json({
    inquiry,
    message:
      lang === 'mr'
        ? 'तुमचा संदेश अकथ प्रकाशनकडे पोहोचला आहे. आम्ही २ कामकाजाच्या दिवसांत प्रतिसाद देऊ.'
        : 'Your message has been received by Akath Prakashan. We will respond within 2 working days.',
  });
});

// ============================================================================
// EDITORIAL & PUBLISHING OPERATIONS ADMIN API (STRICT SERVER RBAC PROTECTED)
// ============================================================================

app.get(
  '/api/admin/dashboard',
  requirePermission('admin:dashboard'),
  (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      books: booksStore,
      authors: authorsStore,
      articles: articlesStore,
      excerpts: excerptsStore,
      readingLists: readingListsStore,
      orders: ordersStore,
      manuscripts: manuscriptsStore,
      subscribers: subscribersStore,
      inquiries: inquiriesStore,
      users: usersStore.map(toPublicUserProfile),
      authorApplications: authorApplicationsStore,
      reviews: reviewsStore,
      auditLogs: securityAuditStore.slice(0, 120),
      inventoryMovements: inventoryMovementsStore,
      mediaAssets: mediaAssetsStore,
      promotions: promotionsStore,
      siteConfig: siteConfigStore.published,
      adminNotifications: adminNotificationsStore,
      schemaMigrations: SCHEMA_MIGRATIONS,
      analytics: analyticsStore.slice(0, 60),
      auditSummary: TECHNICAL_AUDIT_SUMMARY,
    });
  }
);

app.get(
  '/api/admin/users',
  requirePermission('admin:users:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const q = sanitizeText(req.query.q, 80).toLowerCase();
    const roleFilter = sanitizeText(req.query.role, 30);
    const statusFilter = sanitizeText(req.query.status, 30);

    const filtered = usersStore
      .filter((u) => {
        if (roleFilter && u.role !== roleFilter) return false;
        if (statusFilter && u.accountStatus !== statusFilter) return false;
        if (q) {
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.city && u.city.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .map(toPublicUserProfile);

    res.json({ users: filtered });
  }
);

app.patch(
  '/api/admin/users/:id/status',
  requirePermission('admin:users:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const targetUser = usersStore.find((u) => u.id === req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (targetUser.id === admin.id) {
      res.status(400).json({
        error: 'Administrators cannot suspend or deactivate their own active account.',
      });
      return;
    }

    const nextStatus = req.body?.accountStatus as
      | 'active'
      | 'suspended'
      | 'deactivated';
    if (!['active', 'suspended', 'deactivated'].includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid accountStatus value.' });
      return;
    }

    const prevStatus = targetUser.accountStatus;
    targetUser.accountStatus = nextStatus;
    targetUser.updatedAt = new Date().toISOString();

    let revokedSessions = 0;
    if (nextStatus !== 'active') {
      revokedSessions = invalidateUserSessions(targetUser.id);
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: `USER_STATUS_CHANGED:${nextStatus.toUpperCase()}`,
      targetType: 'user',
      targetId: targetUser.id,
      outcome: 'success',
      details: `Changed user '${targetUser.email}' status from '${prevStatus}' to '${nextStatus}' (revoked ${revokedSessions} session(s)).`,
    });

    res.json({
      user: toPublicUserProfile(targetUser),
      revokedSessions,
    });
  }
);

app.patch(
  '/api/admin/users/:id/role',
  requirePermission('admin:users:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const targetUser = usersStore.find((u) => u.id === req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const nextRole = req.body?.role as 'reader' | 'author';
    if (!['reader', 'author'].includes(nextRole)) {
      res.status(400).json({
        error:
          'Only reader or author roles can be assigned via user management. Admin provisioning requires the server bootstrap flow.',
      });
      return;
    }

    const prevRole = targetUser.role;
    targetUser.role = nextRole;
    targetUser.updatedAt = new Date().toISOString();

    if (nextRole === 'author' && !targetUser.linkedAuthorId) {
      const newAuthor: AuthorRecord = {
        id: `author-${Date.now()}`,
        slug: `author-${targetUser.id.slice(-6)}`,
        name: targetUser.name,
        transliteratedName: targetUser.name,
        literaryRole: 'लेखक व निबंधकार',
        region: targetUser.city || 'महाराष्ट्र',
        biography: targetUser.bio || 'अकथ प्रकाशन मान्यताप्राप्त लेखक.',
        editorialNote: 'अकथ प्रकाशन संपादकीय मंडळाद्वारे प्रमाणित.',
        themes: ['समकालीन मराठी साहित्य'],
        bookIds: [],
        articleIds: [],
        publicProfileStatus: 'published',
        verificationStatus: 'publisher_verified',
        provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक',
        ownerUserId: targetUser.id,
      };
      authorsStore.unshift(newAuthor);
      targetUser.linkedAuthorId = newAuthor.id;
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: `USER_ROLE_CHANGED:${nextRole.toUpperCase()}`,
      targetType: 'user',
      targetId: targetUser.id,
      outcome: 'success',
      details: `Changed user '${targetUser.email}' role from '${prevRole}' to '${nextRole}'.`,
    });

    res.json({ user: toPublicUserProfile(targetUser) });
  }
);

app.post(
  '/api/admin/author-applications/:id/decision',
  requirePermission('admin:authors:approve'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const application = authorApplicationsStore.find(
      (a) => a.id === req.params.id
    );
    if (!application) {
      res.status(404).json({ error: 'Author application not found.' });
      return;
    }

    const decision = req.body?.decision as 'approved' | 'rejected';
    if (!['approved', 'rejected'].includes(decision)) {
      res.status(400).json({ error: 'Decision must be "approved" or "rejected".' });
      return;
    }

    const moderationNote =
      sanitizeText(req.body?.moderationNote, 600) ||
      (decision === 'approved'
        ? 'संपादकीय मंडळाकडून लेखक अर्ज मंजूर.'
        : 'संपादकीय निकषांनुसार सध्या अर्ज अस्वीकृत.');

    const nowIso = new Date().toISOString();
    application.status = decision;
    application.moderationNote = moderationNote;
    application.reviewedByUserId = admin.id;
    application.reviewedAt = nowIso;
    application.updatedAt = nowIso;

    const applicantUser = usersStore.find((u) => u.id === application.userId);
    if (decision === 'approved' && applicantUser) {
      applicantUser.role = 'author';
      applicantUser.updatedAt = nowIso;

      let authorProfile = authorsStore.find(
        (a) => a.ownerUserId === applicantUser.id
      );
      if (!authorProfile) {
        authorProfile = {
          id: `author-${Date.now()}`,
          slug: `author-${applicantUser.id.slice(-6)}`,
          name: application.penName || applicantUser.name,
          transliteratedName: application.penName || applicantUser.name,
          literaryRole: application.literaryRole,
          region: application.region,
          biography: application.biography,
          editorialNote: moderationNote,
          themes: application.themes,
          bookIds: [],
          articleIds: [],
          publicProfileStatus: 'published',
          verificationStatus: 'publisher_verified',
          provenanceLabel: 'अकथ प्रकाशन अधिकृत लेखक',
          ownerUserId: applicantUser.id,
        };
        authorsStore.unshift(authorProfile);
      }
      applicantUser.linkedAuthorId = authorProfile.id;
      application.createdAuthorId = authorProfile.id;
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: `AUTHOR_APPLICATION_${decision.toUpperCase()}`,
      targetType: 'author_application',
      targetId: application.id,
      outcome: 'success',
      details: `Application '${application.id}' for '${application.applicantEmail}' ${decision}.`,
    });

    res.json({
      application,
      user: applicantUser ? toPublicUserProfile(applicantUser) : null,
    });
  }
);

app.patch(
  '/api/admin/books/:id/moderation',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const publicationStatus = req.body?.publicationStatus as BookPublicationStatus;
    const allowedStatuses: BookPublicationStatus[] = [
      'draft',
      'submitted_for_review',
      'revision_requested',
      'approved',
      'published',
      'unpublished',
      'archived',
    ];
    if (!allowedStatuses.includes(publicationStatus)) {
      res.status(400).json({ error: 'Invalid publicationStatus.' });
      return;
    }

    book.publicationStatus = publicationStatus;
    if (typeof req.body?.moderationFeedback === 'string') {
      book.moderationFeedback = sanitizeText(req.body.moderationFeedback, 600);
    }
    if (publicationStatus === 'published' && book.stock > 0) {
      book.availability = book.stock <= 5 ? 'limited_stock' : 'in_stock';
      book.shippingNote = '२४–४८ तासांत नांदेड / पुणे केंद्रातून रवाना';
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: `BOOK_MODERATION:${publicationStatus.toUpperCase()}`,
      targetType: 'book',
      targetId: book.id,
      outcome: 'success',
      details: `Book '${book.title}' status set to '${publicationStatus}'.`,
    });

    res.json({ book });
  }
);

app.patch(
  '/api/admin/orders/:id/status',
  requirePermission('admin:orders:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const order = ordersStore.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'ऑर्डर सापडली नाही.' });
      return;
    }

    const newStatus = req.body?.orderStatus as OrderStatus;
    const note =
      sanitizeText(req.body?.note, 250) ||
      `स्थिती '${newStatus}' मध्ये बदलली.`;
    const courierPartner = sanitizeText(req.body?.courierPartner, 80);
    const trackingNumber = sanitizeText(req.body?.trackingNumber, 80);

    if (newStatus) {
      order.orderStatus = newStatus;
      if (newStatus === 'refunded') {
        order.paymentStatus = 'refunded';
      }
    }
    if (courierPartner) order.fulfilment.courierPartner = courierPartner;
    if (trackingNumber) order.fulfilment.trackingNumber = trackingNumber;
    if (newStatus === 'shipped' && !order.fulfilment.dispatchedAt) {
      order.fulfilment.dispatchedAt = new Date().toISOString();
    }

    order.updatedAt = new Date().toISOString();
    order.auditTrail.push({
      timestamp: order.updatedAt,
      actor: admin.email,
      action: `STATUS_${newStatus.toUpperCase()}`,
      note,
    });

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: `ORDER_STATUS_UPDATED:${newStatus.toUpperCase()}`,
      targetType: 'order',
      targetId: order.id,
      outcome: 'success',
      details: `Order '${order.orderNumber}' updated to '${newStatus}'.`,
    });

    res.json({ order });
  }
);

app.patch(
  '/api/admin/books/:id/inventory',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'पुस्तक सापडले नाही.' });
      return;
    }

    const newStock = Math.max(0, Math.floor(Number(req.body?.stock) || 0));
    const newPrice = Math.max(
      50,
      Math.floor(Number(req.body?.price) || book.price)
    );

    book.stock = newStock;
    book.price = newPrice;
    if (newStock === 0) {
      book.availability = 'out_of_stock';
    } else if (newStock <= 5) {
      book.availability = 'limited_stock';
    } else {
      book.availability = 'in_stock';
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'BOOK_INVENTORY_UPDATED',
      targetType: 'book',
      targetId: book.id,
      outcome: 'success',
      details: `Updated '${book.title}' stock=${newStock}, price=₹${newPrice}.`,
    });

    res.json({ book });
  }
);

app.patch(
  '/api/admin/articles/:id/workflow',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const article = articlesStore.find((a) => a.id === req.params.id);
    if (!article) {
      res.status(404).json({ error: 'लेख सापडला नाही.' });
      return;
    }

    const workflowStatus =
      req.body?.workflowStatus as EditorialArticle['workflowStatus'];
    if (workflowStatus) {
      article.workflowStatus = workflowStatus;
      article.updatedAt = new Date().toISOString().slice(0, 10);
    }

    res.json({ article });
  }
);

app.patch(
  '/api/admin/manuscripts/:id/status',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const ms = manuscriptsStore.find((m) => m.id === req.params.id);
    if (!ms) {
      res.status(404).json({ error: 'हस्तलिखित सापडले नाही.' });
      return;
    }

    const reviewStatus =
      req.body?.reviewStatus as ManuscriptSubmission['reviewStatus'];
    const editorialInternalNote = sanitizeText(
      req.body?.editorialInternalNote,
      400
    );

    if (reviewStatus) ms.reviewStatus = reviewStatus;
    if (editorialInternalNote) ms.editorialInternalNote = editorialInternalNote;

    res.json({ submission: ms });
  }
);

app.patch(
  '/api/admin/reviews/:id/status',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const review = reviewsStore.find((r) => r.id === req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    const status = req.body?.status as BookReviewRecord['status'];
    if (['published', 'pending_moderation', 'hidden'].includes(status)) {
      review.status = status;
      review.updatedAt = new Date().toISOString();
    }
    res.json({ review });
  }
);

app.get(
  '/api/admin/audit-logs',
  requirePermission('admin:audit:view'),
  (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      auditLogs: securityAuditStore.slice(0, 200),
      schemaMigrations: SCHEMA_MIGRATIONS,
    });
  }
);

// ============================================================================
// NO-CODE ADMIN CMS ENDPOINTS (BOOKS, INVENTORY, ARTICLES, SITE CONFIG, PROMOS)
// ============================================================================

app.post(
  '/api/admin/books',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const title = sanitizeText(req.body?.title, 180);
    const description = sanitizeText(req.body?.description, 3000);
    if (title.length < 2 || description.length < 10) {
      res.status(400).json({
        error: 'Book title (min 2 chars) and description (min 10 chars) are required.',
      });
      return;
    }

    const subtitle = sanitizeText(req.body?.subtitle, 180) || undefined;
    const transliteratedTitle =
      sanitizeText(req.body?.transliteratedTitle, 180) || title;
    const category = sanitizeText(req.body?.category, 80) || 'कादंबरी';
    const categorySlug =
      category === 'कवितासंग्रह'
        ? 'poetry'
        : category === 'कथासंग्रह'
        ? 'short-stories'
        : category === 'समीक्षा व निबंध'
        ? 'essays'
        : category === 'अनुवाद'
        ? 'translation'
        : 'novel';
    const isbn = sanitizeText(req.body?.isbn, 40) || undefined;
    const publisher =
      sanitizeText(req.body?.publisher, 120) || 'अकथ प्रकाशन, नांदेड व पुणे';
    const edition = sanitizeText(req.body?.edition, 80) || 'पहिली आवृत्ती (२०२६)';
    const price = Math.max(50, Math.floor(Number(req.body?.price) || 250));
    const listPrice = req.body?.listPrice
      ? Math.max(price, Math.floor(Number(req.body.listPrice)))
      : undefined;
    const stock = Math.max(0, Math.floor(Number(req.body?.stock) ?? 20));
    const pageCount = Math.max(32, Math.floor(Number(req.body?.pageCount) || 160));
    const authorId =
      sanitizeText(req.body?.authorId, 80) ||
      authorsStore[0]?.id ||
      'author-digambar-kadam';
    const publicationStatus: BookPublicationStatus = [
      'draft',
      'published',
      'unpublished',
      'archived',
    ].includes(req.body?.publicationStatus)
      ? req.body.publicationStatus
      : 'published';

    // Check duplicate ISBN or title
    if (
      isbn &&
      booksStore.some(
        (b) => b.isbn && b.isbn.toLowerCase() === isbn.toLowerCase()
      )
    ) {
      res.status(409).json({
        error: `A book with ISBN '${isbn}' already exists in the catalog.`,
      });
      return;
    }

    const id = `book-${Date.now()}-${generateOpaqueToken(3)}`;
    const slug =
      transliteratedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || id;

    const newBook: BookRecord = {
      id,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      title,
      subtitle,
      transliteratedTitle,
      authorId,
      contributorIds: [],
      category,
      categorySlug,
      topics: Array.isArray(req.body?.topics)
        ? req.body.topics.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
        : [category],
      language: 'मराठी',
      edition,
      publicationDate: new Date().toISOString().slice(0, 10),
      format: 'पेपरबॅक (डेमी साईज)',
      pageCount,
      isbn,
      publisher,
      price,
      listPrice,
      currency: 'INR',
      stock,
      availability:
        stock === 0 ? 'out_of_stock' : stock <= 5 ? 'limited_stock' : 'in_stock',
      shippingNote:
        stock > 0
          ? '२४–४८ तासांत नांदेड / पुणे केंद्रातून रवाना'
          : 'सध्या साठा उपलब्ध नाही',
      description,
      editorialContext:
        sanitizeText(req.body?.editorialIntroduction, 1200) || description,
      rightsNote: 'सर्व हक्क अकथ प्रकाशन व लेखकाकडे सुरक्षित.',
      isFeatured: Boolean(req.body?.isFeatured),
      isNewRelease: true,
      isEditorSelection: false,
      relatedArticleIds: [],
      relatedBookIds: [],
      readingListIds: [],
      verificationStatus: 'publisher_verified',
      provenanceLabel: 'अकथ प्रकाशन अधिकृत आवृत्ती',
      coverStyle: {
        backgroundHex: '#174D3A',
        accentHex: '#FFD966',
        textHex: '#FFFDF7',
        borderPattern: 'classic_frame',
        emblemText: 'अकथ प्रकाशन · ग्रंथ',
      },
      ownerUserId: admin.id,
      publicationStatus,
    };

    booksStore.unshift(newBook);

    if (stock > 0) {
      inventoryMovementsStore.unshift({
        id: `inv-${Date.now()}`,
        timestamp: new Date().toISOString(),
        bookId: newBook.id,
        bookTitle: newBook.title,
        isbn: newBook.isbn,
        type: 'stock_in',
        delta: stock,
        previousStock: 0,
        newStock: stock,
        reason: 'Initial catalog listing created by Administrator',
        actorEmail: admin.email,
      });
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'ADMIN_BOOK_CREATED',
      targetType: 'book',
      targetId: newBook.id,
      outcome: 'success',
      details: `Created book '${newBook.title}' (${newBook.publicationStatus}).`,
    });

    res.status(201).json({ book: newBook });
  }
);

app.patch(
  '/api/admin/books/:id',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const book = booksStore.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    if (typeof req.body?.title === 'string' && req.body.title.trim().length >= 2) {
      book.title = sanitizeText(req.body.title, 180);
    }
    if (typeof req.body?.subtitle === 'string') {
      book.subtitle = sanitizeText(req.body.subtitle, 180) || undefined;
    }
    if (typeof req.body?.description === 'string' && req.body.description.trim().length >= 10) {
      book.description = sanitizeText(req.body.description, 3000);
    }
    if (typeof req.body?.category === 'string' && req.body.category.trim()) {
      book.category = sanitizeText(req.body.category, 80);
    }
    if (typeof req.body?.isbn === 'string') {
      book.isbn = sanitizeText(req.body.isbn, 40) || undefined;
    }
    if (typeof req.body?.edition === 'string' && req.body.edition.trim()) {
      book.edition = sanitizeText(req.body.edition, 80);
    }
    if (req.body?.price !== undefined) {
      book.price = Math.max(50, Math.floor(Number(req.body.price) || book.price));
    }
    if (req.body?.listPrice !== undefined) {
      book.listPrice = req.body.listPrice
        ? Math.max(book.price, Math.floor(Number(req.body.listPrice)))
        : undefined;
    }
    if (typeof req.body?.isFeatured === 'boolean') {
      book.isFeatured = req.body.isFeatured;
    }
    if (req.body?.publicationStatus) {
      book.publicationStatus = req.body.publicationStatus;
    }

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'ADMIN_BOOK_UPDATED',
      targetType: 'book',
      targetId: book.id,
      outcome: 'success',
      details: `Updated book '${book.title}' metadata/pricing.`,
    });

    res.json({ book });
  }
);

app.get(
  '/api/admin/books/export-csv',
  requirePermission('admin:books:moderate'),
  (_req: AuthenticatedRequest, res: Response) => {
    const csv = exportBooksToCsv(booksStore);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="akath-books-catalog.csv"'
    );
    res.send(csv);
  }
);

app.post(
  '/api/admin/books/import-csv',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const csvText = typeof req.body?.csvText === 'string' ? req.body.csvText : '';
    const lines = csvText
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      res.status(400).json({
        error: 'CSV must contain a header row and at least one book row.',
      });
      return;
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const titleIdx = headers.indexOf('title');
    const priceIdx = headers.indexOf('price');
    const stockIdx = headers.indexOf('stock');
    const catIdx = headers.indexOf('category');
    const isbnIdx = headers.indexOf('isbn');

    if (titleIdx === -1 || priceIdx === -1) {
      res.status(400).json({
        error: 'CSV header must include at least "title" and "price" columns.',
      });
      return;
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const rowTitle = sanitizeText(cols[titleIdx], 180);
      const rowPrice = Math.floor(Number(cols[priceIdx]) || 0);
      const rowStock =
        stockIdx > -1 ? Math.max(0, Math.floor(Number(cols[stockIdx]) || 0)) : 15;
      const rowCat =
        catIdx > -1 && cols[catIdx] ? sanitizeText(cols[catIdx], 80) : 'कादंबरी';
      const rowIsbn =
        isbnIdx > -1 && cols[isbnIdx] ? sanitizeText(cols[isbnIdx], 40) : undefined;

      if (!rowTitle || rowPrice < 50) {
        errors.push(`Row ${i + 1}: Invalid title or price (< ₹50).`);
        continue;
      }

      const existing = booksStore.find(
        (b) =>
          b.title.toLowerCase() === rowTitle.toLowerCase() ||
          (rowIsbn && b.isbn && b.isbn.toLowerCase() === rowIsbn.toLowerCase())
      );

      if (existing) {
        existing.price = rowPrice;
        existing.stock = rowStock;
        existing.category = rowCat;
        if (rowIsbn) existing.isbn = rowIsbn;
        importedCount++;
      } else {
        const id = `book-csv-${Date.now()}-${i}`;
        booksStore.unshift({
          id,
          slug: `book-${Date.now()}-${i}`,
          title: rowTitle,
          transliteratedTitle: rowTitle,
          authorId: authorsStore[0]?.id || 'author-digambar-kadam',
          contributorIds: [],
          category: rowCat,
          categorySlug: 'novel',
          topics: [rowCat],
          language: 'मराठी',
          edition: 'पहिली आवृत्ती (२०२६)',
          publicationDate: new Date().toISOString().slice(0, 10),
          format: 'पेपरबॅक',
          pageCount: 160,
          isbn: rowIsbn,
          publisher: 'अकथ प्रकाशन, नांदेड व पुणे',
          price: rowPrice,
          currency: 'INR',
          stock: rowStock,
          availability:
            rowStock === 0
              ? 'out_of_stock'
              : rowStock <= 5
              ? 'limited_stock'
              : 'in_stock',
          shippingNote: '२४–४८ तासांत नांदेड / पुणे केंद्रातून रवाना',
          description: `${rowTitle} — अकथ प्रकाशन साहित्य सूचीतील ग्रंथ.`,
          editorialContext: `${rowTitle} — अकथ प्रकाशन साहित्य सूचीतील ग्रंथ.`,
          rightsNote: 'सर्व हक्क अकथ प्रकाशन व लेखकाकडे सुरक्षित.',
          isFeatured: false,
          isNewRelease: true,
          isEditorSelection: false,
          relatedArticleIds: [],
          relatedBookIds: [],
          readingListIds: [],
          verificationStatus: 'publisher_verified',
          provenanceLabel: 'अकथ प्रकाशन अधिकृत आवृत्ती',
          coverStyle: {
            backgroundHex: '#174D3A',
            accentHex: '#FFD966',
            textHex: '#FFFDF7',
            borderPattern: 'classic_frame',
            emblemText: 'अकथ प्रकाशन',
          },
          ownerUserId: admin.id,
          publicationStatus: 'published',
        });
        importedCount++;
      }
    }

    res.json({ importedCount, errors, totalBooks: booksStore.length });
  }
);

app.post(
  '/api/admin/inventory/adjust',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const bookId = sanitizeText(req.body?.bookId, 80);
    const delta = Math.floor(Number(req.body?.delta) || 0);
    const reason =
      sanitizeText(req.body?.reason, 240) || 'Manual administrative stock audit';
    const type: InventoryMovementRecord['type'] = [
      'stock_in',
      'stock_out',
      'damaged',
      'returned',
      'manual_adjustment',
    ].includes(req.body?.type)
      ? req.body.type
      : delta >= 0
      ? 'stock_in'
      : 'manual_adjustment';

    const book = booksStore.find((b) => b.id === bookId);
    if (!book) {
      res.status(404).json({ error: 'Book not found.' });
      return;
    }

    const prevStock = book.stock;
    const newStock = Math.max(0, prevStock + delta);
    book.stock = newStock;
    book.availability =
      newStock === 0
        ? 'out_of_stock'
        : newStock <= 5
        ? 'limited_stock'
        : 'in_stock';

    const movement: InventoryMovementRecord = {
      id: `inv-${Date.now()}-${generateOpaqueToken(2)}`,
      timestamp: new Date().toISOString(),
      bookId: book.id,
      bookTitle: book.title,
      isbn: book.isbn,
      type,
      delta: newStock - prevStock,
      previousStock: prevStock,
      newStock,
      reason,
      actorEmail: admin.email,
    };

    inventoryMovementsStore.unshift(movement);
    res.json({ book, movement });
  }
);

app.post(
  '/api/admin/articles',
  requirePermission('admin:books:moderate'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const title = sanitizeText(req.body?.title, 180);
    const summary = sanitizeText(req.body?.summary, 600);
    const bodyText = sanitizeText(req.body?.bodyText, 8000);

    if (title.length < 3 || bodyText.length < 20) {
      res.status(400).json({
        error: 'Article title and body paragraphs are required.',
      });
      return;
    }

    const categoryMarathi =
      sanitizeText(req.body?.category, 60) || 'संपादकीय निबंध';
    const contributorName =
      sanitizeText(req.body?.contributorName, 100) || admin.name;
    const workflowStatus: EditorialArticle['workflowStatus'] = [
      'draft',
      'editorial_review',
      'published',
    ].includes(req.body?.workflowStatus)
      ? req.body.workflowStatus
      : 'published';

    const paragraphs = bodyText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const nowDate = new Date().toISOString().slice(0, 10);
    const newArticle: EditorialArticle = {
      id: `art-${Date.now()}`,
      slug: `vachankatta-${Date.now().toString().slice(-6)}`,
      title,
      subtitle: sanitizeText(req.body?.subtitle, 220) || summary,
      transliteratedTitle: sanitizeText(req.body?.transliteratedTitle, 180) || title,
      categoryMarathi,
      categorySlug: 'articles',
      authorId: authorsStore[0]?.id || 'author-digambar-kadam',
      contributorName,
      contributorRole: sanitizeText(req.body?.contributorRole, 80) || 'संपादकीय लेखक',
      publishedAt: nowDate,
      updatedAt: nowDate,
      readingTimeMinutes: Math.max(3, Math.ceil(bodyText.split(/\s+/).length / 160)),
      summary: summary || paragraphs[0] || title,
      leadParagraph: paragraphs[0] || summary || title,
      tags: Array.isArray(req.body?.tags)
        ? req.body.tags.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
        : [categoryMarathi],
      relatedBookIds: [],
      relatedAuthorIds: [],
      relatedArticleIds: [],
      verificationStatus: 'publisher_verified',
      provenanceLabel: 'अकथ संपादकीय मंच',
      workflowStatus,
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          heading: sanitizeText(req.body?.sectionHeading, 140) || title,
          paragraphs,
          pullQuote: sanitizeText(req.body?.pullQuote, 300) || undefined,
        },
      ],
    };

    articlesStore.unshift(newArticle);
    res.status(201).json({ article: newArticle });
  }
);

app.patch(
  '/api/admin/site-config',
  requirePermission('admin:dashboard'),
  (req: AuthenticatedRequest, res: Response) => {
    const admin = req.authUser!;
    const current = siteConfigStore.published;

    if (req.body?.hero && typeof req.body.hero === 'object') {
      current.hero = {
        ...current.hero,
        ...req.body.hero,
      };
    }
    if (req.body?.promoBanner && typeof req.body.promoBanner === 'object') {
      current.promoBanner = {
        ...current.promoBanner,
        ...req.body.promoBanner,
      };
    }
    if (Array.isArray(req.body?.featuredBookIds)) {
      current.featuredBookIds = req.body.featuredBookIds.map((id: unknown) =>
        sanitizeText(id, 80)
      );
    }
    if (Array.isArray(req.body?.sectionOrder)) {
      current.sectionOrder = req.body.sectionOrder;
    }
    if (req.body?.freeShippingThreshold !== undefined) {
      current.freeShippingThreshold = Math.max(
        0,
        Math.floor(Number(req.body.freeShippingThreshold) || 600)
      );
    }

    current.updatedAt = new Date().toISOString();
    current.updatedBy = admin.email;

    saveCmsBackupSnapshot({
      actorEmail: admin.email,
      books: booksStore,
    });

    recordSecurityAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      ipAddress: req.ip || '127.0.0.1',
      action: 'SITE_CONFIG_UPDATED',
      targetType: 'system',
      outcome: 'success',
      details: 'Updated storefront homepage & banner configuration via Visual Website Editor.',
    });

    res.json({ siteConfig: current });
  }
);

app.post(
  '/api/admin/promotions',
  requirePermission('admin:orders:manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const code = sanitizeText(req.body?.code, 30)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const title = sanitizeText(req.body?.title, 120);
    const discountValue = Math.max(1, Math.floor(Number(req.body?.discountValue) || 10));
    const discountType: PromotionRecord['discountType'] =
      req.body?.discountType === 'fixed_amount' ? 'fixed_amount' : 'percentage';

    if (code.length < 3 || !title) {
      res.status(400).json({ error: 'Valid promo code and title are required.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const promo: PromotionRecord = {
      id: `promo-${Date.now()}`,
      code,
      title,
      description: sanitizeText(req.body?.description, 240) || title,
      discountType,
      discountValue,
      minOrderSubtotal: Math.max(
        0,
        Math.floor(Number(req.body?.minOrderSubtotal) || 300)
      ),
      active: true,
      startsAt: nowIso,
      usedCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    promotionsStore.unshift(promo);
    res.status(201).json({ promotion: promo });
  }
);

app.post('/api/analytics/event', (req, res) => {
  const eventType = req.body?.eventType as AnalyticsEvent['eventType'];
  const entitySlug = sanitizeText(req.body?.entitySlug, 100);
  if (eventType) {
    recordAnalytics(eventType, entitySlug || undefined, req.body?.metadata);
  }
  res.json({ ok: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');
    app.use('/assets', express.static(assetsPath));
    app.use((req, res, next) => {
      const assetsIdx = req.path.indexOf('/assets/');
      if (assetsIdx > 0) {
        req.url = req.url.slice(assetsIdx);
        return express.static(distPath)(req, res, next);
      }
      next();
    });
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Akath Prakashan Server running on http://localhost:${PORT}`);
  });
}

startServer();
