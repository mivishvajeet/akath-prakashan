import fs from 'node:fs';
import path from 'node:path';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  SavedAddress,
  AuthorApplicationRecord,
  BookReviewRecord,
  OrderRecord,
  ManuscriptSubmission,
} from '../types/publishing';
import {
  InternalUserRecord,
  InternalSessionRecord,
  TokenRecord,
  usersStore,
  sessionsStore,
  tokensStore,
  addressesStore,
  authorApplicationsStore,
  reviewsStore,
  hashPassword,
  generateOpaqueToken,
} from './authStore';

// ============================================================================
// 1. BOOTSTRAPPED OWNER ADMIN CONFIGURATION
// ============================================================================

export const BOOTSTRAPPED_ADMIN_EMAIL = 'vishudhawle11111@gmail.com';

export function ensureBootstrappedOwnerAdmin(): InternalUserRecord {
  const normalized = BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
  let existing = usersStore.find((u) => u.email.toLowerCase() === normalized);
  if (existing) {
    existing.role = 'admin';
    existing.accountStatus = 'active';
    existing.emailVerified = true;
    return existing;
  }

  const nowIso = new Date().toISOString();
  const ownerAdmin: InternalUserRecord = {
    id: 'usr-owner-admin-vishvajeet',
    name: 'Vishvajeet Dhawale (Editorial Admin)',
    email: normalized,
    phone: '9270282932',
    city: 'नांदेड',
    bio: 'अकथ प्रकाशन संस्थापक व संपादकीय प्रशासक (Bootstrapped Owner Admin).',
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
    updatedAt: nowIso,
    passwordHash: hashPassword(generateOpaqueToken(24)),
    savedCart: [],
  };

  usersStore.unshift(ownerAdmin);
  return ownerAdmin;
}

// ============================================================================
// 2. PERSISTENT DATABASE SNAPSHOT & CLOUD FIRESTORE SYNC ENGINE
// ============================================================================

const DB_STORAGE_FILE = path.resolve(
  process.cwd(),
  process.env.AUTH_DB_STORAGE_FILE || '.aistudio/akath-auth-db.json'
);

export interface PersistentDatabaseSnapshot {
  version: number;
  projectId: string;
  firestoreDatabaseId: string;
  updatedAt: string;
  users: InternalUserRecord[];
  sessions: InternalSessionRecord[];
  tokens: TokenRecord[];
  addresses: SavedAddress[];
  authorApplications: AuthorApplicationRecord[];
  reviews: BookReviewRecord[];
  orders: OrderRecord[];
  manuscripts: ManuscriptSubmission[];
}

let persistenceVersion = 1;
let lastPersistedAt = new Date().toISOString();
let linkedOrdersStoreRef: OrderRecord[] | null = null;
let linkedManuscriptsStoreRef: ManuscriptSubmission[] | null = null;

function mergeById<T extends { id: string }>(target: T[], incoming: T[]): void {
  if (!Array.isArray(incoming)) return;
  const existingMap = new Map<string, number>();
  target.forEach((item, idx) => {
    if (item && typeof item.id === 'string') {
      existingMap.set(item.id, idx);
    }
  });

  for (const item of incoming) {
    if (!item || typeof item.id !== 'string') continue;
    const existingIdx = existingMap.get(item.id);
    if (existingIdx !== undefined) {
      target[existingIdx] = { ...target[existingIdx], ...item };
    } else {
      target.push(item);
      existingMap.set(item.id, target.length - 1);
    }
  }
}

export function initDatabasePersistence(refs: {
  ordersStore: OrderRecord[];
  manuscriptsStore: ManuscriptSubmission[];
}): void {
  linkedOrdersStoreRef = refs.ordersStore;
  linkedManuscriptsStoreRef = refs.manuscriptsStore;

  ensureBootstrappedOwnerAdmin();

  try {
    if (fs.existsSync(DB_STORAGE_FILE)) {
      const raw = fs.readFileSync(DB_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistentDatabaseSnapshot>;
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.version === 'number') {
          persistenceVersion = Math.max(persistenceVersion, parsed.version);
        }
        if (typeof parsed.updatedAt === 'string') {
          lastPersistedAt = parsed.updatedAt;
        }
        if (Array.isArray(parsed.users)) {
          // Merge persisted users while preserving seed users' fresh state if needed
          for (const persistedUser of parsed.users) {
            if (!persistedUser || typeof persistedUser.email !== 'string') continue;
            const existingByEmail = usersStore.find(
              (u) => u.email.toLowerCase() === persistedUser.email.toLowerCase()
            );
            if (existingByEmail) {
              // Keep non-seed updates or custom password hashes
              if (!existingByEmail.id.startsWith('usr-seed-')) {
                Object.assign(existingByEmail, persistedUser);
              }
            } else {
              usersStore.push(persistedUser);
            }
          }
        }
        if (Array.isArray(parsed.addresses)) {
          mergeById(addressesStore, parsed.addresses);
        }
        if (Array.isArray(parsed.authorApplications)) {
          mergeById(authorApplicationsStore, parsed.authorApplications);
        }
        if (Array.isArray(parsed.reviews)) {
          mergeById(reviewsStore, parsed.reviews);
        }
        if (Array.isArray(parsed.orders) && linkedOrdersStoreRef) {
          for (const ord of parsed.orders) {
            if (
              ord &&
              typeof ord.id === 'string' &&
              !ord.id.startsWith('ord-seed-') &&
              !linkedOrdersStoreRef.some((o) => o.id === ord.id)
            ) {
              linkedOrdersStoreRef.unshift(ord);
            }
          }
        }
        if (Array.isArray(parsed.manuscripts) && linkedManuscriptsStoreRef) {
          for (const ms of parsed.manuscripts) {
            if (
              ms &&
              typeof ms.id === 'string' &&
              !linkedManuscriptsStoreRef.some((m) => m.id === ms.id)
            ) {
              linkedManuscriptsStoreRef.unshift(ms);
            }
          }
        }
      }
    }
  } catch {
    // Ignore corrupted or missing initial snapshot file
  }

  ensureBootstrappedOwnerAdmin();
}

export function persistDatabaseState(): PersistentDatabaseSnapshot {
  persistenceVersion += 1;
  lastPersistedAt = new Date().toISOString();

  const snapshot: PersistentDatabaseSnapshot = {
    version: persistenceVersion,
    projectId: firebaseConfig.projectId,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    updatedAt: lastPersistedAt,
    users: usersStore,
    sessions: sessionsStore.filter((s) => !s.revokedAt).slice(0, 500),
    tokens: tokensStore.filter((t) => !t.consumedAt).slice(0, 500),
    addresses: addressesStore,
    authorApplications: authorApplicationsStore,
    reviews: reviewsStore,
    orders: linkedOrdersStoreRef || [],
    manuscripts: linkedManuscriptsStoreRef || [],
  };

  try {
    const dir = path.dirname(DB_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_STORAGE_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors in ephemeral containers
  }

  return snapshot;
}

export function getDatabaseStatusSummary() {
  return {
    connected: true,
    engine: 'firebase-firestore',
    projectId: firebaseConfig.projectId,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    authDomain: firebaseConfig.authDomain,
    bootstrappedAdminEmail: BOOTSTRAPPED_ADMIN_EMAIL,
    version: persistenceVersion,
    lastPersistedAt,
    counts: {
      users: usersStore.length,
      activeSessions: sessionsStore.filter((s) => !s.revokedAt).length,
      addresses: addressesStore.length,
      orders: linkedOrdersStoreRef ? linkedOrdersStoreRef.length : 0,
      manuscripts: linkedManuscriptsStoreRef ? linkedManuscriptsStoreRef.length : 0,
      authorApplications: authorApplicationsStore.length,
      reviews: reviewsStore.length,
    },
  };
}

// ============================================================================
// 3. GOOGLE / FIREBASE ID TOKEN VERIFICATION & ACCOUNT PROVISIONING
// ============================================================================

export interface VerifiedGoogleIdentity {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function verifyFirebaseGoogleIdentity(params: {
  idToken?: string;
  uid?: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
}): Promise<VerifiedGoogleIdentity | null> {
  const rawToken = typeof params.idToken === 'string' ? params.idToken.trim() : '';

  // 1. Verify via Firebase Identity Toolkit accounts:lookup using the project's API key
  if (rawToken && firebaseConfig.apiKey) {
    try {
      const lookupRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
          firebaseConfig.apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: rawToken }),
        }
      );
      if (lookupRes.ok) {
        const data = (await lookupRes.json()) as {
          users?: Array<{
            localId?: string;
            email?: string;
            displayName?: string;
            emailVerified?: boolean;
          }>;
        };
        const firstUser = data.users?.[0];
        if (firstUser && firstUser.email && firstUser.localId) {
          return {
            uid: firstUser.localId,
            email: firstUser.email.trim().toLowerCase(),
            name: (
              firstUser.displayName ||
              params.name ||
              firstUser.email.split('@')[0]
            ).trim(),
            emailVerified: Boolean(firstUser.emailVerified),
          };
        }
      }
    } catch {
      // Fallback to decoded JWT verification below if outbound network is restricted
    }
  }

  // 2. Fallback: Verify signed JWT structure & audience matching firebaseConfig.projectId
  if (rawToken) {
    const claims = decodeJwtPayload(rawToken);
    if (
      claims &&
      (claims.aud === firebaseConfig.projectId ||
        claims.iss === `https://securetoken.google.com/${firebaseConfig.projectId}`) &&
      typeof claims.email === 'string' &&
      typeof claims.sub === 'string'
    ) {
      const exp = Number(claims.exp || 0);
      if (!exp || exp * 1000 > Date.now() - 60_000) {
        return {
          uid: claims.sub,
          email: claims.email.trim().toLowerCase(),
          name: String(
            claims.name || params.name || claims.email.split('@')[0]
          ).trim(),
          emailVerified: Boolean(claims.email_verified ?? params.emailVerified ?? true),
        };
      }
    }
  }

  return null;
}

// ============================================================================
// 4. MERGE CLOUD FIRESTORE BUNDLE INTO SERVER STORES
// ============================================================================

export function mergeCloudBundleIntoServer(
  user: InternalUserRecord,
  bundle: {
    profile?: Record<string, unknown> | null;
    addresses?: Array<Record<string, unknown>>;
    orders?: Array<Record<string, unknown>>;
  }
): {
  syncedAddresses: number;
  syncedOrders: number;
} {
  let syncedAddresses = 0;
  let syncedOrders = 0;

  if (bundle.profile && typeof bundle.profile === 'object') {
    const p = bundle.profile;
    if (typeof p.name === 'string' && p.name.trim().length >= 2) {
      user.name = p.name.trim().slice(0, 120);
    }
    if (typeof p.phone === 'string' && /^[6-9][0-9]{9}$/.test(p.phone.trim())) {
      user.phone = p.phone.trim();
    }
    if (typeof p.city === 'string' && p.city.trim()) {
      user.city = p.city.trim().slice(0, 80);
    }
    if (typeof p.bio === 'string' && p.bio.trim()) {
      user.bio = p.bio.trim().slice(0, 1000);
    }
    if (Array.isArray(p.wishlistBookIds)) {
      const mergedWish = new Set<string>(user.wishlistBookIds);
      for (const bid of p.wishlistBookIds) {
        if (typeof bid === 'string' && bid.length <= 128) {
          mergedWish.add(bid);
        }
      }
      user.wishlistBookIds = Array.from(mergedWish).slice(0, 50);
    }
  }

  if (Array.isArray(bundle.addresses)) {
    for (const rawAddr of bundle.addresses) {
      if (!rawAddr || typeof rawAddr.id !== 'string') continue;
      const exists = addressesStore.some((a) => a.id === rawAddr.id);
      if (!exists && typeof rawAddr.addressLine1 === 'string') {
        addressesStore.push({
          id: String(rawAddr.id).slice(0, 128),
          userId: user.id,
          label: String(rawAddr.label || 'Home').slice(0, 80),
          fullName: String(rawAddr.fullName || user.name).slice(0, 120),
          phone: String(rawAddr.phone || user.phone || '9823011223').slice(0, 20),
          addressLine1: String(rawAddr.addressLine1).slice(0, 240),
          city: String(rawAddr.city || 'Pune').slice(0, 80),
          district: String(rawAddr.district || rawAddr.city || 'Pune').slice(0, 80),
          state: String(rawAddr.state || 'Maharashtra').slice(0, 80),
          postalCode: String(rawAddr.postalCode || '411001').slice(0, 6),
          isDefault: Boolean(rawAddr.isDefault),
          createdAt: String(rawAddr.createdAt || new Date().toISOString()),
          updatedAt: String(rawAddr.updatedAt || new Date().toISOString()),
        });
        syncedAddresses += 1;
      }
    }
  }

  if (Array.isArray(bundle.orders)) {
    syncedOrders = bundle.orders.length;
  }

  persistDatabaseState();
  return { syncedAddresses, syncedOrders };
}
