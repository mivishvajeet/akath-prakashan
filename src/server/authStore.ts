import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  UserRole,
  AccountStatus,
  PublicUserProfile,
  SavedAddress,
  SessionInfo,
  AuthorApplicationRecord,
  BookReviewRecord,
  SecurityAuditEvent,
  CartItemInput,
} from '../types/publishing';

// ============================================================================
// 1. CRYPTOGRAPHIC PASSWORD HASHING (SCRYPT + TIMING-SAFE COMPARISON)
// ============================================================================

const SCRYPT_KEYLEN = 64;

export function hashPassword(plaintext: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plaintext, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(plaintext: string, storedHash: string): boolean {
  if (!plaintext || !storedHash || !storedHash.startsWith('scrypt$')) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, hexKey] = parts;
  try {
    const keyBuffer = Buffer.from(hexKey, 'hex');
    const derived = crypto.scryptSync(plaintext, salt, SCRYPT_KEYLEN);
    if (keyBuffer.length !== derived.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derived);
  } catch {
    return false;
  }
}

export function generateOpaqueToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

export function hashOpaqueToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// ============================================================================
// 2. DATABASE SCHEMA MIGRATIONS & RECORD DEFINITIONS
// ============================================================================

export interface SchemaMigrationRecord {
  version: string;
  name: string;
  appliedAt: string;
  reversible: boolean;
  rollbackDescription: string;
}

export const SCHEMA_MIGRATIONS: SchemaMigrationRecord[] = [
  {
    version: '20261001_001',
    name: 'initial_publishing_catalog_and_orders',
    appliedAt: '2026-10-01T00:00:00.000Z',
    reversible: true,
    rollbackDescription: 'Drops books, authors, articles, excerpts, orders tables.',
  },
  {
    version: '20261031_002',
    name: 'create_users_sessions_and_security_tokens',
    appliedAt: '2026-10-31T00:00:00.000Z',
    reversible: true,
    rollbackDescription:
      'Drops users, user_sessions, verification_tokens, and password_reset_tokens tables.',
  },
  {
    version: '20261031_003',
    name: 'add_author_applications_and_book_ownership',
    appliedAt: '2026-10-31T00:05:00.000Z',
    reversible: true,
    rollbackDescription:
      'Drops author_applications table and removes ownerUserId/publicationStatus columns from books.',
  },
  {
    version: '20261031_004',
    name: 'add_guest_order_tokens_saved_addresses_reviews_and_audit_log',
    appliedAt: '2026-10-31T00:10:00.000Z',
    reversible: true,
    rollbackDescription:
      'Drops saved_addresses, book_reviews, security_audit_logs and removes guestAccessToken/userId from orders.',
  },
  {
    version: '20261031_005',
    name: 'add_no_code_admin_cms_media_inventory_promotions_and_site_config',
    appliedAt: '2026-10-31T02:30:00.000Z',
    reversible: true,
    rollbackDescription:
      'Drops media_assets, inventory_movements, promotions, site_configs, article_revisions, and admin_notifications tables.',
  },
];

export interface InternalUserRecord extends PublicUserProfile {
  passwordHash: string;
  savedCart: CartItemInput[];
  deletionRequestedAt?: string;
}

export interface InternalSessionRecord extends SessionInfo {
  tokenHash: string;
  csrfToken: string;
  revokedAt?: string;
}

export interface TokenRecord {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  purpose: 'email_verification' | 'password_reset';
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
}

// ============================================================================
// 3. SERVER-CONTROLLED ADMIN BOOTSTRAP TOKEN (NO HARDCODED PASSWORDS)
// ============================================================================

const BOOTSTRAP_TOKEN_FILE = path.join(
  process.cwd(),
  '.aistudio',
  'server-bootstrap-token.txt'
);

function initServerBootstrapToken(): string {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_TOKEN?.trim();
  if (
    fromEnv &&
    fromEnv.length >= 16 &&
    fromEnv !== 'replace-with-strong-server-bootstrap-token'
  ) {
    return fromEnv;
  }

  try {
    const dir = path.dirname(BOOTSTRAP_TOKEN_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(BOOTSTRAP_TOKEN_FILE)) {
      const existing = fs.readFileSync(BOOTSTRAP_TOKEN_FILE, 'utf-8').trim();
      if (existing.length >= 32) return existing;
    }
    const generated = generateOpaqueToken(24);
    fs.writeFileSync(BOOTSTRAP_TOKEN_FILE, generated, { mode: 0o600 });
    return generated;
  } catch {
    return generateOpaqueToken(24);
  }
}

export const SERVER_ADMIN_BOOTSTRAP_TOKEN = initServerBootstrapToken();

// ============================================================================
// 4. AUTHORITATIVE AUTHENTICATION & RBAC DATA STORES
// ============================================================================

export const usersStore: InternalUserRecord[] = [
  {
    id: 'usr-seed-author-1',
    name: 'जी. के. ऐनापुरे',
    email: 'gk.ainapure@akath.in',
    phone: '9834227102',
    city: 'सांगली',
    bio: 'समकालीन मराठी कथनपरंपरेला नवोत्तर संवेदनांचे भान देणारे सिद्धहस्त कथाकार, दीर्घकथाकार आणि कादंबरीकार.',
    role: 'author',
    accountStatus: 'active',
    emailVerified: true,
    linkedAuthorId: 'author-g-k-ainapure',
    wishlistBookIds: ['book-dhukyachi-dulai'],
    personalReadingList: [
      {
        bookId: 'book-scholar-juice',
        note: 'अकथ प्रकाशन क्र. ०१ — दीर्घकथा संग्रह संहिता',
        addedAt: '2026-10-12T09:00:00.000Z',
      },
    ],
    notificationPreferences: {
      newReleases: true,
      orderUpdates: true,
      vachankattaDigest: true,
      publishingAlerts: true,
    },
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
    // Random non-guessable hash at startup (no hardcoded password)
    passwordHash: hashPassword(generateOpaqueToken(24)),
    savedCart: [],
  },
  {
    id: 'usr-seed-reader-1',
    name: 'प्रा. अनिरुद्ध कुलकर्णी',
    email: 'aniruddha.kulkarni@example.com',
    phone: '9823011223',
    city: 'नांदेड',
    bio: 'समकालीन मराठी कथासाहित्य आणि समीक्षा वाचक.',
    role: 'reader',
    accountStatus: 'active',
    emailVerified: true,
    wishlistBookIds: ['book-scholar-juice', 'book-dhukyachi-dulai'],
    personalReadingList: [],
    notificationPreferences: {
      newReleases: true,
      orderUpdates: true,
      vachankattaDigest: true,
      publishingAlerts: false,
    },
    createdAt: '2026-10-01T08:30:00.000Z',
    updatedAt: '2026-10-20T10:15:00.000Z',
    passwordHash: hashPassword(generateOpaqueToken(24)),
    savedCart: [],
  },
  {
    id: 'usr-seed-applicant-1',
    name: 'सौ. कावेरी इनामदार',
    email: 'kaveri.inamdar@example.com',
    phone: '9850112233',
    city: 'छत्रपती संभाजीनगर',
    bio: 'मराठवाड्यातील लोकगीते, ओव्या आणि ग्रामीण स्त्री-परंपरेच्या अभ्यासक.',
    role: 'reader',
    accountStatus: 'active',
    emailVerified: true,
    wishlistBookIds: ['book-scholar-juice'],
    personalReadingList: [],
    notificationPreferences: {
      newReleases: true,
      orderUpdates: true,
      vachankattaDigest: true,
      publishingAlerts: true,
    },
    createdAt: '2026-10-12T10:00:00.000Z',
    updatedAt: '2026-10-25T11:30:00.000Z',
    passwordHash: hashPassword(generateOpaqueToken(24)),
    savedCart: [],
  },
  {
    id: 'usr-seed-admin-1',
    name: 'संपादकीय व प्रकाशन प्रशासक (Admin)',
    email: 'admin.console@akath.in',
    phone: '9270282932',
    city: 'नांदेड',
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
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
    passwordHash: hashPassword(generateOpaqueToken(24)),
    savedCart: [],
  },
];

export const sessionsStore: InternalSessionRecord[] = [];
export const tokensStore: TokenRecord[] = [];
export const addressesStore: SavedAddress[] = [
  {
    id: 'addr-seed-1',
    userId: 'usr-seed-reader-1',
    label: 'घर (वैशाखी नगर, नांदेड)',
    fullName: 'प्रा. अनिरुद्ध कुलकर्णी',
    phone: '9823011223',
    addressLine1: '१४, सरस्वती निवास, शिवाजीनगर',
    city: 'नांदेड',
    district: 'नांदेड',
    state: 'महाराष्ट्र',
    postalCode: '431605',
    isDefault: true,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
];

export const authorApplicationsStore: AuthorApplicationRecord[] = [
  {
    id: 'app-seed-1',
    userId: 'usr-seed-applicant-1',
    applicantName: 'सौ. कावेरी इनामदार',
    applicantEmail: 'kaveri.inamdar@example.com',
    phone: '9850112233',
    penName: 'कावेरी इनामदार',
    region: 'छत्रपती संभाजीनगर (मराठवाडा)',
    literaryRole: 'लोकसाहित्य संशोधक व ललित लेखिका',
    biography:
      'गेली बारा वर्षे मराठवाड्यातील जात्यावरच्या ओव्या, ऋतुचक्र आणि ग्रामीण स्त्रियांचे मौखिक साहित्य यावर क्षेत्रीय संशोधन व लेखन.',
    themes: ['लोकसाहित्य', 'समीक्षा व निबंध', 'ग्रामीण संस्कृती'],
    portfolioSummary:
      'प्रतिष्ठित साहित्य नियतकालिकांतून १८ शोधनिबंध व ललित लेख प्रकाशित.',
    sampleWritingExcerpt:
      'पहाटेच्या अंधारात जात्याची घरघर सुरू होते, तेव्हा ती केवळ धान्य दळण्याची क्रिया नसते; तर पिढ्यानपिढ्या स्त्रियांनी आपल्या सोसण्याचे आणि शहाणपणाचे दळलेले ते अक्षर असते.',
    status: 'pending',
    submittedAt: '2026-10-26T14:20:00.000Z',
    updatedAt: '2026-10-26T14:20:00.000Z',
  },
];

export const reviewsStore: BookReviewRecord[] = [
  {
    id: 'rev-seed-1',
    bookId: 'book-scholar-juice',
    userId: 'usr-seed-reader-1',
    reviewerName: 'प्रा. अनिरुद्ध कुलकर्णी',
    rating: 5,
    title: 'समकाळातील माणूस आणि समाज यांच्या नात्याचा गालिबी आरसा',
    comment:
      'जी. के. ऐनापुरे यांचा स्कॉलर ज्यूस हा दीर्घकथा संग्रह अंतर्मनाला अस्वस्थ करणारा आणि जीवनाला गेलेले अदृश्य तडे दाखवणारा आहे.',
    status: 'published',
    createdAt: '2026-10-22T11:20:00.000Z',
    updatedAt: '2026-10-22T11:20:00.000Z',
  },
  {
    id: 'rev-seed-2',
    bookId: 'book-dhukyachi-dulai',
    userId: 'usr-seed-reader-1',
    reviewerName: 'प्रा. अनिरुद्ध कुलकर्णी',
    rating: 5,
    title: 'भूतानच्या निसर्गाचा आणि शांततेचा संवेदनशील प्रवासानुभव',
    comment:
      'अनुरत्न वाघमारे यांची चित्रदर्शी भाषा वाचकाला प्रत्यक्ष भूतानच्या धुक्यात लपेटलेल्या डोंगरवाटांवर घेऊन जाते.',
    status: 'published',
    createdAt: '2026-10-24T16:05:00.000Z',
    updatedAt: '2026-10-24T16:05:00.000Z',
  },
];

export const securityAuditStore: SecurityAuditEvent[] = [
  {
    id: 'aud-seed-1',
    timestamp: '2026-10-31T00:00:00.000Z',
    actorUserId: null,
    actorRole: 'admin',
    ipAddress: '127.0.0.1',
    action: 'MIGRATIONS_VERIFIED',
    targetType: 'system',
    outcome: 'success',
    details: 'Applied 4 schema migrations (20261001_001 through 20261031_004).',
  },
];

// Outbox of verification and reset tokens for local development & automated verification
// (Never exposed to public API responses unless the user is in a local dev/test flow)
export const localEmailOutbox: {
  id: string;
  toEmail: string;
  subject: string;
  purpose: 'email_verification' | 'password_reset';
  rawToken: string;
  sentAt: string;
}[] = [];

// ============================================================================
// 5. HELPER FUNCTIONS FOR USER SANITIZATION, SESSIONS & AUDIT LOGGING
// ============================================================================

export function toPublicUserProfile(user: InternalUserRecord): PublicUserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    bio: user.bio,
    role: user.role,
    staffPermissions: user.staffPermissions ? [...user.staffPermissions] : undefined,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    linkedAuthorId: user.linkedAuthorId,
    wishlistBookIds: [...user.wishlistBookIds],
    personalReadingList: user.personalReadingList.map((item) => ({ ...item })),
    notificationPreferences: { ...user.notificationPreferences },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export function recordSecurityAudit(params: {
  actorUserId: string | null;
  actorEmail?: string;
  actorRole: UserRole;
  ipAddress: string;
  action: string;
  targetType: SecurityAuditEvent['targetType'];
  targetId?: string;
  outcome: SecurityAuditEvent['outcome'];
  details: string;
}): SecurityAuditEvent {
  const event: SecurityAuditEvent = {
    id: `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
  securityAuditStore.unshift(event);
  if (securityAuditStore.length > 1000) {
    securityAuditStore.pop();
  }
  return event;
}

export function invalidateUserSessions(
  userId: string,
  exceptSessionId?: string
): number {
  const nowIso = new Date().toISOString();
  let revokedCount = 0;
  for (const session of sessionsStore) {
    if (
      session.userId === userId &&
      !session.revokedAt &&
      session.id !== exceptSessionId
    ) {
      session.revokedAt = nowIso;
      revokedCount += 1;
    }
  }
  return revokedCount;
}

export function mergeCartItems(
  accountCart: CartItemInput[],
  guestCart: CartItemInput[],
  getBookStock: (bookId: string) => number
): CartItemInput[] {
  const merged = new Map<string, number>();
  for (const item of accountCart) {
    if (!item || typeof item.bookId !== 'string') continue;
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty > 0) merged.set(item.bookId, qty);
  }
  for (const item of guestCart) {
    if (!item || typeof item.bookId !== 'string') continue;
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty > 0) {
      merged.set(item.bookId, (merged.get(item.bookId) || 0) + qty);
    }
  }

  const result: CartItemInput[] = [];
  for (const [bookId, totalQty] of merged.entries()) {
    const stock = getBookStock(bookId);
    if (stock <= 0) continue;
    const maxAllowed = Math.min(stock, 20);
    result.push({
      bookId,
      quantity: Math.min(totalQty, maxAllowed),
    });
  }
  return result;
}
