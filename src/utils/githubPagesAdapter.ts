import {
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_EXCERPTS,
  INITIAL_ARTICLES,
  INITIAL_READING_LISTS,
} from '../data/seedData';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
  FirstPageReactionCounts,
  ReadingList,
  CartItemInput,
  ValidatedCartLine,
  CartQuoteResponse,
  OrderRecord,
  ManuscriptSubmission,
  ContactInquiry,
} from '../types/publishing';
import {
  validateEmail,
  validateIndianPhone,
  validateIndianPinCode,
  AppLanguage,
} from './validation';

const GH_STORAGE_KEYS = {
  books: 'akath_gh_books_v1',
  authors: 'akath_gh_authors_v1',
  articles: 'akath_gh_articles_v1',
  excerpts: 'akath_gh_excerpts_v1',
  readingLists: 'akath_gh_reading_lists_v1',
  orders: 'akath_gh_orders_v1',
  manuscripts: 'akath_gh_manuscripts_v1',
  inquiries: 'akath_gh_inquiries_v1',
  sessionUser: 'akath_gh_session_user_v1',
};

const KNOWN_APP_ROUTES = new Set([
  'books',
  'authors',
  'vachankatta',
  'about',
  'submit-manuscript',
  'contact',
  'cart',
  'checkout',
  'track-order',
  'shipping-returns',
  'privacy',
  'terms',
  'policies',
  'admin',
  'audit',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'account',
  'author',
  'author-portal',
  'index.html',
]);

let cachedBasePath: string | null = null;

/**
 * Reliably detects the deployment base path (e.g. '/akath-prakashan' on GitHub Pages
 * project sites, or '' when deployed at the root domain '/').
 */
export function getGitHubPagesBasePath(): string {
  if (typeof window === 'undefined') return '';
  if (cachedBasePath !== null) return cachedBasePath;

  // 1. Check Vite's configured BASE_URL if it is an explicit subpath
  const envBase = (import.meta as any).env?.BASE_URL;
  if (
    typeof envBase === 'string' &&
    envBase.startsWith('/') &&
    envBase !== '/' &&
    !envBase.startsWith('/.')
  ) {
    cachedBasePath = envBase.replace(/\/+$/, '');
    return cachedBasePath;
  }

  // 2. Inspect the loaded bundle <script src=".../assets/index-*.js"> or <link href=".../assets/index-*.css"> URL
  if (typeof document !== 'undefined') {
    const assetUrls: string[] = [];
    for (const s of Array.from(document.getElementsByTagName('script'))) {
      if (s.src) assetUrls.push(s.src);
    }
    for (const l of Array.from(document.getElementsByTagName('link'))) {
      if (l.rel === 'stylesheet' && l.href) assetUrls.push(l.href);
    }
    for (const rawUrl of assetUrls) {
      try {
        const parsed = new URL(rawUrl, window.location.origin);
        const assetsIdx = parsed.pathname.indexOf('/assets/');
        if (assetsIdx > 0) {
          cachedBasePath = parsed.pathname.slice(0, assetsIdx);
          return cachedBasePath;
        }
      } catch {
        // Ignore malformed asset URL
      }
    }
  }

  // 3. Fallback: inspect window.location.pathname on *.github.io
  if (window.location.hostname.endsWith('.github.io')) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && !KNOWN_APP_ROUTES.has(segments[0])) {
      cachedBasePath = `/${segments[0]}`;
      return cachedBasePath;
    }
  }

  cachedBasePath = '';
  return cachedBasePath;
}

/**
 * Normalizes any raw browser pathname (including GitHub Pages '/<repo-name>/',
 * '/<repo-name>/index.html', or trailing slashes) into a clean SPA route like '/' or '/books'.
 */
export function normalizeAppRoutePath(rawPathname?: string): string {
  const base = getGitHubPagesBasePath();
  let path = rawPathname || (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';

  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || '/';
  }

  // Strip trailing /index.html
  if (path === '/index.html' || path.endsWith('/index.html')) {
    path = path.slice(0, -'/index.html'.length) || '/';
  }

  // Ensure leading slash and strip trailing slash (except root '/')
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.replace(/\/+$/, '');
  }

  return path || '/';
}

export function resolvePublicAssetUrl(url?: string): string | undefined {
  if (!url) return url;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = getGitHubPagesBasePath();
  if (base && (url === base || url.startsWith(`${base}/`))) {
    return url;
  }
  const normalizedClean = url.replace(/^\.\//, '');
  const withLeadingSlash = normalizedClean.startsWith('/')
    ? normalizedClean
    : `/${normalizedClean}`;
  if (
    withLeadingSlash.startsWith('/assets/') ||
    withLeadingSlash === '/manifest.json'
  ) {
    return base ? `${base}${withLeadingSlash}` : withLeadingSlash;
  }
  return url;
}

export const normalizeAssetPath = resolvePublicAssetUrl;

export function withResolvedBookAssets(book: BookRecord): BookRecord {
  return {
    ...book,
    coverImageUrl: resolvePublicAssetUrl(book.coverImageUrl),
    coverSpreadUrl: resolvePublicAssetUrl(book.coverSpreadUrl),
    coverPdfUrl: resolvePublicAssetUrl(book.coverPdfUrl),
    galleryImages: Array.isArray(book.galleryImages)
      ? book.galleryImages.map((img) => ({
          ...img,
          url: resolvePublicAssetUrl(img.url) || img.url,
        }))
      : book.galleryImages,
  };
}

export function withResolvedExcerptAssets(
  excerpt: FirstPageExcerpt
): FirstPageExcerpt {
  return {
    ...excerpt,
    pdfDocumentUrl: resolvePublicAssetUrl(excerpt.pdfDocumentUrl),
    folioPages: Array.isArray(excerpt.folioPages)
      ? excerpt.folioPages.map((page) => ({
          ...page,
          illustrationUrl: resolvePublicAssetUrl(page.illustrationUrl),
          emblemUrl: resolvePublicAssetUrl(page.emblemUrl),
        }))
      : excerpt.folioPages,
  };
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export function getStaticBooks(): BookRecord[] {
  const stored = readLocalJson<BookRecord[] | null>(GH_STORAGE_KEYS.books, null);
  const list = stored && stored.length > 0 ? stored : INITIAL_BOOKS;
  return list.map(withResolvedBookAssets);
}

export function getStaticAuthors(): AuthorRecord[] {
  const stored = readLocalJson<AuthorRecord[] | null>(GH_STORAGE_KEYS.authors, null);
  return stored && stored.length > 0 ? stored : INITIAL_AUTHORS;
}

export function getStaticArticles(): EditorialArticle[] {
  const stored = readLocalJson<EditorialArticle[] | null>(
    GH_STORAGE_KEYS.articles,
    null
  );
  return stored && stored.length > 0 ? stored : INITIAL_ARTICLES;
}

export function getStaticExcerpts(): FirstPageExcerpt[] {
  const stored = readLocalJson<FirstPageExcerpt[] | null>(
    GH_STORAGE_KEYS.excerpts,
    null
  );
  const list = stored && stored.length > 0 ? stored : INITIAL_EXCERPTS;
  return list.map(withResolvedExcerptAssets);
}

export function getStaticReadingLists(): ReadingList[] {
  const stored = readLocalJson<ReadingList[] | null>(
    GH_STORAGE_KEYS.readingLists,
    null
  );
  return stored && stored.length > 0 ? stored : INITIAL_READING_LISTS;
}

function computeStaticCartQuote(
  items: CartItemInput[],
  lang: AppLanguage
): CartQuoteResponse {
  const books = getStaticBooks();
  const authors = getStaticAuthors();
  const mergedMap = new Map<string, number>();
  const validationMessages: string[] = [];

  for (const entry of Array.isArray(items) ? items : []) {
    if (!entry || typeof entry.bookId !== 'string') continue;
    const reqQty = Math.floor(Number(entry.quantity) || 0);
    if (reqQty < 1) {
      validationMessages.push(
        lang === 'mr'
          ? 'किमान १ प्रत निवडणे आवश्यक आहे.'
          : 'Minimum quantity per book is 1.'
      );
      continue;
    }
    mergedMap.set(entry.bookId, (mergedMap.get(entry.bookId) || 0) + reqQty);
  }

  const quoteLines: ValidatedCartLine[] = [];
  for (const [bookId, requestedQty] of mergedMap.entries()) {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.stock <= 0 || book.availability === 'out_of_stock') continue;
    const author = authors.find((a) => a.id === book.authorId);
    const maxAllowed = Math.min(book.stock, 10);
    const approvedQuantity = Math.min(requestedQty, maxAllowed);
    let stockWarning: string | undefined;
    if (requestedQty > maxAllowed) {
      stockWarning =
        lang === 'mr'
          ? `केवळ ${maxAllowed} प्रती उपलब्ध असल्यामुळे संख्या समायोजित केली आहे.`
          : `Quantity adjusted to ${maxAllowed} based on available stock.`;
    }
    quoteLines.push({
      bookId: book.id,
      slug: book.slug,
      title: book.title,
      authorName: author?.name || 'अकथ लेखक',
      format: book.format,
      unitPrice: book.price,
      listPrice: book.listPrice,
      requestedQuantity: requestedQty,
      approvedQuantity,
      availableStock: book.stock,
      lineTotal: book.price * approvedQuantity,
      stockWarning,
    });
  }

  const subtotal = quoteLines.reduce((acc, l) => acc + l.lineTotal, 0);
  const freeShippingThreshold = 500;
  const shippingCost =
    quoteLines.length === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : 45;
  const grandTotal = subtotal + shippingCost;

  return {
    items: quoteLines,
    subtotal,
    discountAmount: 0,
    shippingCost,
    shippingRuleNote:
      lang === 'mr'
        ? 'सर्व किमतीत लागू कर समाविष्ट आहेत. ₹५०० वरील ऑर्डरला मोफत घरपोच सुविधा.'
        : 'All prices inclusive of applicable taxes. Free shipping on orders ₹500+.',
    grandTotal,
    currency: 'INR',
    validationMessages,
    isValidForCheckout: quoteLines.length > 0,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleStaticApiRequest(
  pathname: string,
  searchParams: URLSearchParams,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  let body: Record<string, any> = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // 1. GET /api/bootstrap
  if (method === 'GET' && pathname === '/api/bootstrap') {
    return jsonResponse({
      books: getStaticBooks(),
      authors: getStaticAuthors(),
      articles: getStaticArticles(),
      excerpts: getStaticExcerpts(),
      readingLists: getStaticReadingLists(),
      promotions: [],
      siteConfig: {
        promoBanner: {
          enabled: true,
          badgeText: 'अकथ प्रकाशन',
          messageMarathi:
            '₹५०० वरील सर्व मराठी ग्रंथ ऑर्डरवर संपूर्ण भारतात मोफत घरपोच वितरण.',
          messageEnglish:
            'Complimentary tracked book-post shipping across India on orders ₹500+.',
          ctaLink: '/books',
        },
      },
    });
  }

  // 2. GET /api/auth/me
  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = readLocalJson(GH_STORAGE_KEYS.sessionUser, null);
    return jsonResponse({ user, csrfToken: 'gh-pages-static-csrf' });
  }

  // 3. POST /api/cart/quote
  if (method === 'POST' && pathname === '/api/cart/quote') {
    const lang: AppLanguage = body.lang === 'en' ? 'en' : 'mr';
    return jsonResponse(computeStaticCartQuote(body.items || [], lang));
  }

  // 4. GET /api/search
  if (method === 'GET' && pathname === '/api/search') {
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const books = getStaticBooks().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.transliteratedTitle.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
    const authors = getStaticAuthors().filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.transliteratedName.toLowerCase().includes(q)
    );
    const articles = getStaticArticles().filter((ar) =>
      ar.title.toLowerCase().includes(q)
    );
    return jsonResponse({ books, authors, articles });
  }

  // 5. POST /api/orders
  if (method === 'POST' && pathname === '/api/orders') {
    const lang: AppLanguage = body.lang === 'en' ? 'en' : 'mr';
    const customer = body.customer || {};
    const phoneCheck = validateIndianPhone(customer.phone || '', lang);
    const emailCheck = validateEmail(customer.email || '', lang);
    const pinCheck = validateIndianPinCode(customer.postalCode || '', lang);

    const fieldErrors: Record<string, string> = {};
    if (!customer.fullName || String(customer.fullName).trim().length < 2) {
      fieldErrors.fullName =
        lang === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा.' : 'Please enter your full name.';
    }
    if (!phoneCheck.isValid) fieldErrors.phone = phoneCheck.error || 'Invalid phone';
    if (!emailCheck.isValid) fieldErrors.email = emailCheck.error || 'Invalid email';
    if (!pinCheck.isValid) fieldErrors.postalCode = pinCheck.error || 'Invalid PIN';
    if (!customer.addressLine1 || String(customer.addressLine1).trim().length < 5) {
      fieldErrors.addressLine1 =
        lang === 'mr' ? 'कृपया संपूर्ण पत्ता लिहा.' : 'Please enter your full address.';
    }
    if (!customer.city || String(customer.city).trim().length < 2) {
      fieldErrors.city = lang === 'mr' ? 'कृपया शहर लिहा.' : 'Please enter your city.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return jsonResponse(
        {
          error:
            lang === 'mr'
              ? 'कृपया फॉर्ममधील त्रुटी तपासा.'
              : 'Please check the highlighted form fields.',
          fieldErrors,
        },
        400
      );
    }

    const quote = computeStaticCartQuote(body.items || [], lang);
    const orders = readLocalJson<OrderRecord[]>(GH_STORAGE_KEYS.orders, []);
    const nowIso = new Date().toISOString();
    const orderNumber = `AK-2026-${1043 + orders.length}`;
    const order: OrderRecord = {
      id: `ord-gh-${Date.now()}`,
      orderNumber,
      idempotencyKey: body.idempotencyKey || `idem-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      guestAccessToken: `gh-tok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      customer: {
        fullName: String(customer.fullName).trim(),
        phone: phoneCheck.normalizedValue,
        email: emailCheck.normalizedValue,
        addressLine1: String(customer.addressLine1).trim(),
        addressLine2: customer.addressLine2
          ? String(customer.addressLine2).trim()
          : undefined,
        city: String(customer.city).trim(),
        district: String(customer.district || customer.city).trim(),
        state: String(customer.state || 'Maharashtra').trim(),
        postalCode: pinCheck.normalizedValue,
        orderNotes: customer.orderNotes
          ? String(customer.orderNotes).trim()
          : undefined,
        isInstitutionalOrder: Boolean(customer.isInstitutionalOrder),
        institutionName: customer.institutionName
          ? String(customer.institutionName).trim()
          : undefined,
      },
      items: quote.items,
      subtotal: quote.subtotal,
      shippingCost: quote.shippingCost,
      grandTotal: quote.grandTotal,
      currency: 'INR',
      paymentMethod: body.paymentMethod || 'upi_verified',
      paymentStatus: 'unverified',
      paymentReference: '',
      orderStatus: 'pending_payment',
      fulfilment: {},
      auditTrail: [
        {
          timestamp: nowIso,
          actor: 'reader_checkout',
          action: 'ORDER_CREATED',
          note: 'Order created on Akath Prakashan storefront.',
        },
      ],
    };

    orders.unshift(order);
    writeLocalJson(GH_STORAGE_KEYS.orders, orders);
    return jsonResponse({ order }, 201);
  }

  // 6. POST /api/orders/:id/checkout-payment
  const checkoutPayMatch = pathname.match(
    /^\/api\/orders\/([^/]+)\/(checkout-payment|verify-payment)$/
  );
  if (method === 'POST' && checkoutPayMatch) {
    const orderId = checkoutPayMatch[1];
    const orders = readLocalJson<OrderRecord[]>(GH_STORAGE_KEYS.orders, []);
    const order = orders.find(
      (o) => o.id === orderId || o.orderNumber.toUpperCase() === orderId.toUpperCase()
    );
    if (!order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }
    const outcome = body.outcome === 'failed' ? 'failed' : 'success';
    order.paymentStatus = outcome === 'failed' ? 'failed' : 'verified';
    order.orderStatus = outcome === 'failed' ? 'payment_failed' : 'payment_verified';
    order.paymentReference =
      body.paymentReference || `UPI-AKATH-${String(Date.now()).slice(-8)}`;
    order.updatedAt = new Date().toISOString();
    writeLocalJson(GH_STORAGE_KEYS.orders, orders);
    return jsonResponse({ order });
  }

  // 7. GET /api/orders/lookup
  if (method === 'GET' && pathname === '/api/orders/lookup') {
    const orderNumber = (searchParams.get('orderNumber') || '').trim().toUpperCase();
    const orders = readLocalJson<OrderRecord[]>(GH_STORAGE_KEYS.orders, []);
    const order = orders.find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }
    return jsonResponse({ order });
  }

  // 8. POST /api/contact
  if (method === 'POST' && pathname === '/api/contact') {
    const inquiries = readLocalJson<ContactInquiry[]>(
      GH_STORAGE_KEYS.inquiries,
      []
    );
    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      name: String(body.name || '').trim(),
      role: body.role || 'Reader',
      emailOrPhone: String(body.email || body.phone || body.emailOrPhone || '').trim(),
      subject: String(body.subject || '').trim(),
      message: String(body.message || '').trim(),
      preferWhatsAppFollowup: Boolean(body.preferWhatsAppFollowup),
    };
    inquiries.unshift(inquiry);
    writeLocalJson(GH_STORAGE_KEYS.inquiries, inquiries);
    return jsonResponse({ inquiry }, 201);
  }

  // 9. POST /api/manuscripts
  if (method === 'POST' && pathname === '/api/manuscripts') {
    const manuscripts = readLocalJson<ManuscriptSubmission[]>(
      GH_STORAGE_KEYS.manuscripts,
      []
    );
    const submission: ManuscriptSubmission = {
      id: `ms-${Date.now()}`,
      referenceCode: `AK-MS-${101 + manuscripts.length}`,
      submittedAt: new Date().toISOString(),
      authorName: String(body.authorName || '').trim(),
      email: String(body.email || '').trim(),
      phone: String(body.phone || '').trim(),
      city: String(body.city || '').trim(),
      manuscriptTitle: String(body.manuscriptTitle || '').trim(),
      category: body.category || 'कादंबरी',
      wordCountEstimate: String(body.wordCountEstimate || body.wordCount || '25,000'),
      synopsis: String(body.synopsis || '').trim(),
      sampleExcerptText: String(
        body.sampleExcerptText || body.sampleExcerpt || ''
      ).trim(),
      originalWorkConfirmed: true,
      privacyConsentConfirmed: true,
      reviewStatus: 'received',
    };
    manuscripts.unshift(submission);
    writeLocalJson(GH_STORAGE_KEYS.manuscripts, manuscripts);
    return jsonResponse({ submission }, 201);
  }

  // 10. POST /api/excerpts/:id/react
  const reactMatch = pathname.match(/^\/api\/excerpts\/([^/]+)\/react$/);
  if (method === 'POST' && reactMatch) {
    const excerptId = reactMatch[1];
    const reactionType = body.reactionType as keyof FirstPageReactionCounts;
    const excerpts = getStaticExcerpts();
    const target = excerpts.find((e) => e.id === excerptId);
    if (!target) return jsonResponse({ error: 'Excerpt not found' }, 404);
    if (
      reactionType &&
      (reactionType === 'readMore' ||
        reactionType === 'struckByLine' ||
        reactionType === 'wantContext')
    ) {
      target.reactions[reactionType] += 1;
      writeLocalJson(GH_STORAGE_KEYS.excerpts, excerpts);
    }
    return jsonResponse({ reactions: target.reactions });
  }

  // 11. GET /api/books/:id/reviews
  const reviewsMatch = pathname.match(/^\/api\/books\/([^/]+)\/reviews$/);
  if (method === 'GET' && reviewsMatch) {
    return jsonResponse({ reviews: [] });
  }

  return jsonResponse({ ok: true });
}

export function installGitHubPagesStaticAdapter(): void {
  if (typeof window === 'undefined') return;

  // 1. Restore clean SPA URL if redirected from GitHub Pages 404.html (?/path)
  const loc = window.location;
  if (loc.search && loc.search.startsWith('?/')) {
    const decoded = loc.search
      .slice(2)
      .split('&')
      .map((s) => s.replace(/~and~/g, '&'))
      .join('?');
    const basePrefix = loc.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
    const restoredPath = `${basePrefix}/${decoded.replace(/^\/+/, '')}${loc.hash}`;
    window.history.replaceState(null, '', restoredPath);
  } else if (loc.pathname.endsWith('/index.html')) {
    // Strip explicit /index.html on initial boot while preserving repository subpath
    const cleanPathname = loc.pathname.slice(0, -'index.html'.length) || '/';
    window.history.replaceState(null, '', `${cleanPathname}${loc.search}${loc.hash}`);
  }

  const isExplicitStaticHost =
    window.location.hostname.endsWith('.github.io') ||
    (import.meta as any).env?.VITE_GITHUB_PAGES === 'true';

  if (!isExplicitStaticHost) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  const staticFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const urlObj = new URL(urlStr, window.location.origin);
    const base = getGitHubPagesBasePath();
    const normalizedPath =
      base && urlObj.pathname.startsWith(base)
        ? urlObj.pathname.slice(base.length) || '/'
        : urlObj.pathname;

    if (!normalizedPath.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    return handleStaticApiRequest(normalizedPath, urlObj.searchParams, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: staticFetch,
      configurable: true,
      writable: true,
    });
  } catch {
    try {
      (window as any).fetch = staticFetch;
    } catch {
      // Ignore if environment forbids overriding window.fetch
    }
  }
}

export interface AssetDiagnosticEntry {
  source: string;
  rawPath: string;
  resolvedUrl: string;
  matchesBasePath: boolean;
  httpStatus: number;
  contentType: string;
  ok: boolean;
}

export interface AssetDiagnosticSummary {
  timestamp: string;
  origin: string;
  pathname: string;
  normalizedRoute: string;
  viteBaseUrl: string;
  detectedBasePath: string;
  totalChecked: number;
  passedCount: number;
  failedCount: number;
  entries: AssetDiagnosticEntry[];
}

/**
 * Browser console diagnostic check that iterates over the site's manifest,
 * static book/excerpt asset paths, and rendered DOM asset elements to verify
 * that all URLs resolve properly against the repository base path.
 */
export async function runGitHubPagesAssetDiagnostics(): Promise<AssetDiagnosticSummary | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const detectedBase = getGitHubPagesBasePath();
  const viteBaseUrl = String((import.meta as any).env?.BASE_URL || '/');
  const normalizedRoute = normalizeAppRoutePath(window.location.pathname);
  const expectedPrefix = detectedBase ? `${detectedBase}/` : '/';

  const candidates = new Map<string, { source: string; rawPath: string; resolvedPath: string }>();

  const registerCandidate = (source: string, rawPath?: string) => {
    if (!rawPath || rawPath.startsWith('data:') || rawPath.startsWith('blob:')) return;
    const resolvedPath = resolvePublicAssetUrl(rawPath) || rawPath;
    const key = `${source}::${resolvedPath}`;
    if (!candidates.has(key)) {
      candidates.set(key, { source, rawPath, resolvedPath });
    }
  };

  // 1. Site Web App Manifest & Brand Assets
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const manifestPath = manifestLink?.getAttribute('href') || '/manifest.json';
  registerCandidate('manifest:link', manifestPath);
  registerCandidate('brand:logo', '/assets/akath/akath-logo.png');
  registerCandidate('brand:hero', '/assets/akath/hero-books.jpg');

  // Parse manifest.json if reachable to also verify icons[] and static_assets[]
  try {
    const resolvedManifestUrl = new URL(
      resolvePublicAssetUrl('/manifest.json') || '/manifest.json',
      window.location.origin
    ).toString();
    const manifestRes = await window.fetch(resolvedManifestUrl, { method: 'GET' });
    const manifestType = manifestRes.headers.get('content-type') || '';
    if (manifestRes.ok && manifestType.includes('json')) {
      const manifestJson = await manifestRes.json();
      if (Array.isArray(manifestJson.icons)) {
        for (const icon of manifestJson.icons) {
          if (icon?.src) {
            const normalizedIconSrc = icon.src.startsWith('/')
              ? icon.src
              : `/${icon.src.replace(/^\.\//, '')}`;
            registerCandidate('manifest:icon', normalizedIconSrc);
          }
        }
      }
      if (Array.isArray(manifestJson.static_assets)) {
        for (const assetPath of manifestJson.static_assets) {
          if (typeof assetPath === 'string') {
            registerCandidate('manifest:static_assets', assetPath);
          }
        }
      }
    }
  } catch {
    // Ignore manifest fetch error; handled in individual probe loop below
  }

  // 2. Static Book Catalogue Assets
  for (const book of getStaticBooks()) {
    registerCandidate(`book:${book.slug}:cover`, book.coverImageUrl);
    registerCandidate(`book:${book.slug}:spread`, book.coverSpreadUrl);
    registerCandidate(`book:${book.slug}:pdf`, book.coverPdfUrl);
    if (Array.isArray(book.galleryImages)) {
      book.galleryImages.forEach((img, idx) => {
        registerCandidate(`book:${book.slug}:gallery[${idx}]`, img.url);
      });
    }
  }

  // 3. Static First-Page Excerpt Assets
  for (const excerpt of getStaticExcerpts()) {
    registerCandidate(`excerpt:${excerpt.id}:pdf`, excerpt.pdfDocumentUrl);
    if (Array.isArray(excerpt.folioPages)) {
      excerpt.folioPages.forEach((page, idx) => {
        registerCandidate(
          `excerpt:${excerpt.id}:folio[${idx}]:illustration`,
          page.illustrationUrl
        );
        registerCandidate(
          `excerpt:${excerpt.id}:folio[${idx}]:emblem`,
          page.emblemUrl
        );
      });
    }
  }

  // 4. Rendered DOM scripts, stylesheets, and images
  document
    .querySelectorAll<HTMLScriptElement>('script[src]')
    .forEach((script, idx) => {
      registerCandidate(`dom:script[${idx}]`, script.getAttribute('src') || script.src);
    });
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
    .forEach((link, idx) => {
      registerCandidate(`dom:stylesheet[${idx}]`, link.getAttribute('href') || link.href);
    });
  document.querySelectorAll<HTMLImageElement>('img[src]').forEach((img, idx) => {
    registerCandidate(`dom:img[${idx}]`, img.getAttribute('src') || img.src);
  });

  // 5. Probe each candidate and validate base-path alignment + HTTP status
  const entries: AssetDiagnosticEntry[] = [];
  for (const item of candidates.values()) {
    let resolvedUrlObj: URL;
    try {
      resolvedUrlObj = new URL(item.resolvedPath, window.location.href);
    } catch {
      entries.push({
        source: item.source,
        rawPath: item.rawPath,
        resolvedUrl: item.resolvedPath,
        matchesBasePath: false,
        httpStatus: 0,
        contentType: 'invalid-url',
        ok: false,
      });
      continue;
    }

    const isSameOrigin = resolvedUrlObj.origin === window.location.origin;
    const matchesBasePath = isSameOrigin
      ? resolvedUrlObj.pathname.startsWith(expectedPrefix)
      : true;

    let httpStatus = 0;
    let contentType = '';
    let ok = false;

    if (!isSameOrigin) {
      // External font/CDN links
      httpStatus = 200;
      contentType = 'external-origin';
      ok = true;
    } else {
      try {
        let res = await window.fetch(resolvedUrlObj.toString(), { method: 'HEAD' });
        if (res.status === 405 || res.status === 404) {
          res = await window.fetch(resolvedUrlObj.toString(), { method: 'GET' });
        }
        httpStatus = res.status;
        contentType = res.headers.get('content-type') || '';
        const expectsHtml = resolvedUrlObj.pathname.endsWith('.html');
        const unexpectedHtmlFallback =
          !expectsHtml && contentType.includes('text/html');
        ok = res.ok && matchesBasePath && !unexpectedHtmlFallback;
      } catch {
        httpStatus = 0;
        contentType = 'network-error';
        ok = false;
      }
    }

    entries.push({
      source: item.source,
      rawPath: item.rawPath,
      resolvedUrl: resolvedUrlObj.pathname,
      matchesBasePath,
      httpStatus,
      contentType,
      ok,
    });
  }

  const passedCount = entries.filter((e) => e.ok).length;
  const failedCount = entries.length - passedCount;

  const summary: AssetDiagnosticSummary = {
    timestamp: new Date().toISOString(),
    origin: window.location.origin,
    pathname: window.location.pathname,
    normalizedRoute,
    viteBaseUrl,
    detectedBasePath: detectedBase || '/',
    totalChecked: entries.length,
    passedCount,
    failedCount,
    entries,
  };

  (window as any).__AKATH_ASSET_DIAGNOSTICS__ = summary;
  (window as any).runAkathAssetDiagnostics = runGitHubPagesAssetDiagnostics;

  console.groupCollapsed(
    `[Akath Asset Diagnostics] Base="${detectedBase || '/'}" | Route="${normalizedRoute}" | ${passedCount}/${entries.length} Resolved OK`
  );
  console.info('Environment & Base Path Summary:', {
    origin: summary.origin,
    pathname: summary.pathname,
    normalizedRoute: summary.normalizedRoute,
    viteBaseUrl: summary.viteBaseUrl,
    detectedBasePath: summary.detectedBasePath,
    totalChecked: summary.totalChecked,
    passedCount: summary.passedCount,
    failedCount: summary.failedCount,
  });
  console.table(entries);
  if (failedCount > 0) {
    console.warn(
      '[Akath Asset Diagnostics] Unresolved or mismatched asset paths detected:',
      entries.filter((e) => !e.ok)
    );
  }
  console.groupEnd();

  return summary;
}
