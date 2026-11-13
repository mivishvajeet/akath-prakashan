import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  PublicUserProfile,
  SavedAddress,
  OrderRecord,
  ManuscriptSubmission,
  BookReviewRecord,
} from '../types/publishing';

// ============================================================================
// 1. INITIALIZE FIREBASE APP, FIRESTORE & AUTH
// ============================================================================

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ============================================================================
// 2. MANDATORY FIRESTORE ERROR HANDLER (FIREBASE-INTEGRATION-RPC SPEC)
// ============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// 3. BOOT CONNECTION VALIDATION (getDocFromServer)
// ============================================================================

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testConnection();
}

// ============================================================================
// 4. DEFENSIVE PAYLOAD SANITIZATION (MATCHING firebase-blueprint.json)
// ============================================================================

const ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;
const INDIAN_PHONE_PATTERN = /^[6-9][0-9]{9}$/;
const PIN_CODE_PATTERN = /^[1-9][0-9]{5}$/;

function sanitizeId(raw: string, fallbackPrefix = 'rec'): string {
  const cleaned = (raw || '')
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, 128);
  if (cleaned.length >= 2 && ID_PATTERN.test(cleaned)) {
    return cleaned;
  }
  return `${fallbackPrefix}-${Date.now()}`;
}

function truncateStr(val: string | undefined | null, maxLen: number): string {
  if (!val) return '';
  return String(val).trim().slice(0, maxLen);
}

// ============================================================================
// 5. CLOUD FIRESTORE SYNCHRONIZATION HELPERS
// ============================================================================

export async function syncUserProfileToCloud(
  profile: PublicUserProfile
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const uid = sanitizeId(currentUser.uid, 'usr');
  const path = `users/${uid}`;
  const nowIso = new Date().toISOString();

  const allowedRole =
    currentUser.email === 'vishudhawle11111@gmail.com'
      ? 'admin'
      : profile.role === 'reader'
      ? 'reader'
      : 'reader';

  const payload: Record<string, unknown> = {
    id: uid,
    ownerUid: uid,
    name: truncateStr(profile.name || currentUser.displayName || 'Akath Reader', 120),
    email: truncateStr(profile.email || currentUser.email || '', 254),
    role: allowedRole,
    accountStatus: 'active',
    emailVerified: true,
    wishlistBookIds: Array.isArray(profile.wishlistBookIds)
      ? profile.wishlistBookIds
          .filter((id) => typeof id === 'string' && id.length <= 128)
          .slice(0, 50)
      : [],
    createdAt: truncateStr(profile.createdAt || nowIso, 64),
    updatedAt: truncateStr(nowIso, 64),
  };

  if (profile.phone && INDIAN_PHONE_PATTERN.test(profile.phone.trim())) {
    payload.phone = profile.phone.trim();
  }
  if (profile.city && profile.city.trim()) {
    payload.city = truncateStr(profile.city, 80);
  }
  if (profile.bio && profile.bio.trim()) {
    payload.bio = truncateStr(profile.bio, 1000);
  }

  try {
    const existingSnap = await getDoc(doc(db, 'users', uid));
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      await setDoc(doc(db, 'users', uid), {
        ...payload,
        id: existingData.id || uid,
        ownerUid: existingData.ownerUid || uid,
        email: existingData.email || payload.email,
        role: existingData.role || payload.role,
        accountStatus: existingData.accountStatus || 'active',
        createdAt: existingData.createdAt || payload.createdAt,
      });
    } else {
      await setDoc(doc(db, 'users', uid), payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncSavedAddressToCloud(
  address: SavedAddress
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const addressId = sanitizeId(address.id, 'addr');
  const uid = sanitizeId(currentUser.uid, 'usr');
  const path = `addresses/${addressId}`;
  const nowIso = new Date().toISOString();

  if (
    !INDIAN_PHONE_PATTERN.test((address.phone || '').trim()) ||
    !PIN_CODE_PATTERN.test((address.postalCode || '').trim())
  ) {
    return;
  }

  const payload = {
    id: addressId,
    userId: uid,
    label: truncateStr(address.label || 'Home', 80),
    fullName: truncateStr(address.fullName || 'Reader', 120),
    phone: address.phone.trim(),
    addressLine1: truncateStr(address.addressLine1, 240),
    city: truncateStr(address.city, 80),
    district: truncateStr(address.district || address.city, 80),
    state: truncateStr(address.state || 'Maharashtra', 80),
    postalCode: address.postalCode.trim(),
    isDefault: Boolean(address.isDefault),
    createdAt: truncateStr(address.createdAt || nowIso, 64),
    updatedAt: truncateStr(address.updatedAt || nowIso, 64),
  };

  try {
    await setDoc(doc(db, 'addresses', addressId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSavedAddressFromCloud(
  addressId: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const cleanId = sanitizeId(addressId, 'addr');
  const path = `addresses/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'addresses', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncOrderToCloud(order: OrderRecord): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const orderId = sanitizeId(order.id, 'ord');
  const uid = sanitizeId(currentUser.uid, 'usr');
  const path = `orders/${orderId}`;
  const nowIso = new Date().toISOString();

  const payload: Record<string, unknown> = {
    id: orderId,
    orderNumber: sanitizeId(order.orderNumber || orderId, 'AK'),
    userId: uid,
    customerName: truncateStr(order.customer?.fullName || 'Reader', 120),
    customerEmail: truncateStr(
      order.customer?.email || currentUser.email || 'reader@akath.in',
      254
    ),
    subtotal: Math.max(0, Math.min(1000000, Number(order.subtotal) || 0)),
    shippingCost: Math.max(0, Math.min(10000, Number(order.shippingCost) || 0)),
    grandTotal: Math.max(0, Math.min(1010000, Number(order.grandTotal) || 0)),
    status: 'confirmed',
    createdAt: truncateStr(order.createdAt || nowIso, 64),
    updatedAt: truncateStr(order.updatedAt || nowIso, 64),
  };

  if (order.customer?.phone) {
    payload.customerPhone = truncateStr(order.customer.phone, 20);
  }

  try {
    await setDoc(doc(db, 'orders', orderId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncManuscriptToCloud(
  manuscript: ManuscriptSubmission
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const manuscriptId = sanitizeId(manuscript.id, 'ms');
  const uid = sanitizeId(currentUser.uid, 'usr');
  const path = `manuscripts/${manuscriptId}`;
  const nowIso = new Date().toISOString();

  const payload: Record<string, unknown> = {
    id: manuscriptId,
    referenceCode: sanitizeId(manuscript.referenceCode || manuscriptId, 'AKMS'),
    authorUserId: uid,
    penName: truncateStr(manuscript.authorName || 'Author', 120),
    email: truncateStr(manuscript.email || currentUser.email || '', 254),
    manuscriptTitle: truncateStr(manuscript.manuscriptTitle || 'Untitled', 200),
    genre: truncateStr(manuscript.category || 'novel', 64),
    synopsis: truncateStr(
      manuscript.synopsis && manuscript.synopsis.length >= 10
        ? manuscript.synopsis
        : `${manuscript.synopsis || ''} — Akath Prakashan submission`,
      5000
    ),
    status: 'received',
    submittedAt: truncateStr(manuscript.submittedAt || nowIso, 64),
    updatedAt: truncateStr(nowIso, 64),
  };

  if (manuscript.phone) {
    payload.phone = truncateStr(manuscript.phone, 20);
  }

  try {
    await setDoc(doc(db, 'manuscripts', manuscriptId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncReviewToCloud(
  review: BookReviewRecord
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const reviewId = sanitizeId(review.id, 'rev');
  const uid = sanitizeId(currentUser.uid, 'usr');
  const path = `reviews/${reviewId}`;
  const nowIso = new Date().toISOString();

  const payload = {
    id: reviewId,
    bookId: sanitizeId(review.bookId, 'book'),
    userId: uid,
    reviewerName: truncateStr(review.reviewerName || 'Reader', 120),
    rating: Math.max(1, Math.min(5, Math.round(Number(review.rating) || 5))),
    title: truncateStr(review.title || 'Book Review', 160),
    comment: truncateStr(review.comment || 'Recommended edition.', 2500),
    status: 'published',
    createdAt: truncateStr(review.createdAt || nowIso, 64),
    updatedAt: truncateStr(review.updatedAt || nowIso, 64),
  };

  try {
    await setDoc(doc(db, 'reviews', reviewId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudUserBundle(): Promise<{
  profile: Record<string, unknown> | null;
  addresses: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  manuscripts: Record<string, unknown>[];
} | null> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return null;

  const uid = sanitizeId(currentUser.uid, 'usr');
  let profile: Record<string, unknown> | null = null;
  const addresses: Record<string, unknown>[] = [];
  const orders: Record<string, unknown>[] = [];
  const manuscripts: Record<string, unknown>[] = [];

  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      profile = userSnap.data() as Record<string, unknown>;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }

  try {
    const addrQ = query(
      collection(db, 'addresses'),
      where('userId', '==', uid)
    );
    const addrSnaps = await getDocs(addrQ);
    addrSnaps.forEach((docSnap) => {
      addresses.push(docSnap.data() as Record<string, unknown>);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'addresses');
  }

  try {
    const ordQ = query(collection(db, 'orders'), where('userId', '==', uid));
    const ordSnaps = await getDocs(ordQ);
    ordSnaps.forEach((docSnap) => {
      orders.push(docSnap.data() as Record<string, unknown>);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }

  try {
    const msQ = query(
      collection(db, 'manuscripts'),
      where('authorUserId', '==', uid)
    );
    const msSnaps = await getDocs(msQ);
    msSnaps.forEach((docSnap) => {
      manuscripts.push(docSnap.data() as Record<string, unknown>);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'manuscripts');
  }

  return { profile, addresses, orders, manuscripts };
}

// ============================================================================
// 6. GOOGLE SIGN-IN POPUP AUTHENTICATION WORKFLOW
// ============================================================================

export interface GoogleAuthResult {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  idToken: string;
}

export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser: FirebaseUser = credential.user;
  const idToken = await fbUser.getIdToken();
  const email = (fbUser.email || '').trim().toLowerCase();
  const name = (fbUser.displayName || email.split('@')[0] || 'Akath Reader').trim();

  return {
    uid: fbUser.uid,
    email,
    name,
    emailVerified: Boolean(fbUser.emailVerified),
    idToken,
  };
}

export async function signOutFirebaseClient(): Promise<void> {
  try {
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
  } catch {
    // Ignore sign-out errors if no active Firebase client session
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
