import {
  UserRole,
  AccountStatus,
  Permission,
  BookRecord,
  OrderRecord,
  BookReviewRecord,
  PublicUserProfile,
} from '../types/publishing';
import { AppLanguage } from '../utils/validation';

// ============================================================================
// 1. CENTRALIZED ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  guest: ['catalog:browse', 'checkout:guest'],
  reader: [
    'catalog:browse',
    'checkout:guest',
    'account:profile',
    'account:orders',
    'account:addresses',
    'account:wishlist',
    'reviews:write',
    'author:apply',
  ],
  author: [
    'catalog:browse',
    'checkout:guest',
    'account:profile',
    'account:orders',
    'account:addresses',
    'account:wishlist',
    'reviews:write',
    'author:profile',
    'author:books:create',
    'author:books:edit_own',
    'author:books:submit_review',
    'author:royalties:view',
  ],
  admin: [
    'catalog:browse',
    'checkout:guest',
    'account:profile',
    'account:orders',
    'account:addresses',
    'account:wishlist',
    'reviews:write',
    'author:profile',
    'author:books:create',
    'author:books:edit_own',
    'author:books:submit_review',
    'author:royalties:view',
    'admin:dashboard',
    'admin:users:manage',
    'admin:authors:approve',
    'admin:books:moderate',
    'admin:articles:manage',
    'admin:orders:manage',
    'admin:inventory:manage',
    'admin:media:manage',
    'admin:promotions:manage',
    'admin:site:edit',
    'admin:audit:view',
  ],
};

/**
 * Checks if a given role and account status grants a specific permission.
 * Default-deny: suspended or deactivated accounts only retain guest read capabilities.
 */
export function hasPermission(
  role: UserRole | undefined | null,
  accountStatus: AccountStatus | undefined | null,
  permission: Permission,
  staffPermissions?: readonly Permission[]
): boolean {
  const effectiveRole: UserRole = role || 'guest';
  if (effectiveRole !== 'guest' && accountStatus !== 'active') {
    return ROLE_PERMISSIONS.guest.includes(permission);
  }
  const allowed = ROLE_PERMISSIONS[effectiveRole];
  if (allowed && allowed.includes(permission)) return true;
  if (Array.isArray(staffPermissions) && staffPermissions.includes(permission)) {
    return true;
  }
  return false;
}

// ============================================================================
// 2. RESOURCE OWNERSHIP & MODERATION POLICIES (IDOR PREVENTION)
// ============================================================================

export function isBookPubliclyVisible(book: BookRecord): boolean {
  const status = book.publicationStatus || 'published';
  return status === 'published';
}

export function canUserViewBook(
  user: PublicUserProfile | null,
  book: BookRecord,
  authorOwnerId?: string
): boolean {
  if (isBookPubliclyVisible(book)) return true;
  if (!user || user.accountStatus !== 'active') return false;
  if (user.role === 'admin') return true;
  if (
    user.role === 'author' &&
    (book.ownerUserId === user.id ||
      (user.linkedAuthorId && book.authorId === user.linkedAuthorId) ||
      (authorOwnerId && authorOwnerId === user.id))
  ) {
    return true;
  }
  return false;
}

export function canAuthorModifyBook(
  user: PublicUserProfile | null,
  book: BookRecord
): { allowed: boolean; reason?: string } {
  if (!user || user.accountStatus !== 'active') {
    return { allowed: false, reason: 'Authentication required.' };
  }
  if (user.role === 'admin') {
    return { allowed: true };
  }
  if (user.role !== 'author') {
    return { allowed: false, reason: 'Only approved authors can edit book listings.' };
  }
  const isOwner =
    book.ownerUserId === user.id ||
    Boolean(user.linkedAuthorId && book.authorId === user.linkedAuthorId);
  if (!isOwner) {
    return {
      allowed: false,
      reason: 'You do not have permission to modify another author’s book.',
    };
  }
  const status = book.publicationStatus || 'published';
  if (status === 'published' || status === 'archived') {
    return {
      allowed: false,
      reason:
        'Published or archived books cannot be directly edited without editorial moderation.',
    };
  }
  return { allowed: true };
}

export function canAccessOrderResource(
  user: PublicUserProfile | null,
  order: OrderRecord,
  providedGuestToken?: string
): boolean {
  // 1. Admin has authorized order management access
  if (user && user.accountStatus === 'active' && user.role === 'admin') {
    return true;
  }
  // 2. Registered user who owns the order
  if (
    user &&
    user.accountStatus === 'active' &&
    order.userId &&
    order.userId === user.id
  ) {
    return true;
  }
  // 3. Unguessable guest order access token
  if (
    providedGuestToken &&
    order.guestAccessToken &&
    providedGuestToken === order.guestAccessToken
  ) {
    return true;
  }
  return false;
}

export function canMutateReview(
  user: PublicUserProfile | null,
  review: BookReviewRecord
): boolean {
  if (!user || user.accountStatus !== 'active') return false;
  if (user.role === 'admin') return true;
  return review.userId === user.id;
}

// ============================================================================
// 3. SAFE REDIRECT VALIDATION (OPEN-REDIRECT PREVENTION)
// ============================================================================

export function sanitizeRedirectPath(
  rawRedirect: unknown,
  fallback = '/account'
): string {
  if (typeof rawRedirect !== 'string') return fallback;
  const trimmed = rawRedirect.trim();
  if (!trimmed) return fallback;
  // Must start with a single '/' and never '//' or '/\' or contain protocol schemes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed)) {
    return fallback;
  }
  if (trimmed.includes('\r') || trimmed.includes('\n')) {
    return fallback;
  }
  return trimmed;
}

export function getDefaultDashboardForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'author':
      return '/author/dashboard';
    case 'reader':
      return '/account';
    default:
      return '/';
  }
}

// ============================================================================
// 4. PASSWORD STRENGTH & CREDENTIAL VALIDATION
// ============================================================================

export interface PasswordValidationResult {
  isValid: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  error?: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function validatePasswordStrength(
  password: unknown,
  lang: AppLanguage = 'mr'
): PasswordValidationResult {
  const raw = typeof password === 'string' ? password : '';
  const checks = {
    minLength: raw.length >= 8 && raw.length <= 128,
    hasUppercase: /[A-Z]/.test(raw),
    hasLowercase: /[a-z]/.test(raw),
    hasNumber: /\d/.test(raw),
    hasSpecial: /[^A-Za-z0-9]/.test(raw),
  };

  let passedCount = 0;
  if (checks.minLength) passedCount++;
  if (checks.hasUppercase && checks.hasLowercase) passedCount++;
  if (checks.hasNumber) passedCount++;
  if (checks.hasSpecial) passedCount++;

  const score = Math.min(4, Math.max(0, passedCount)) as 0 | 1 | 2 | 3 | 4;

  const labelsMr = ['अत्यंत कमकुवत', 'कमकुवत', 'साधारण', 'चांगला', 'अतिशय सुरक्षित'];
  const labelsEn = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const isValid =
    checks.minLength &&
    checks.hasUppercase &&
    checks.hasLowercase &&
    checks.hasNumber &&
    checks.hasSpecial;

  let error: string | undefined;
  if (!isValid) {
    error =
      lang === 'mr'
        ? 'पासवर्ड किमान ८ अक्षरांचा असावा आणि त्यात मोठे अक्षर (A-Z), लहान अक्षर (a-z), अंक (0-9) व विशेष चिन्ह (@#$!) असणे आवश्यक आहे.'
        : 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.';
  }

  return {
    isValid,
    score,
    label: lang === 'mr' ? labelsMr[score] : labelsEn[score],
    error,
    checks,
  };
}

// ============================================================================
// 5. SAFE FILE UPLOAD VALIDATION (BOOK COVERS)
// ============================================================================

const ALLOWED_COVER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
const ALLOWED_COVER_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateCoverUpload(
  fileMeta: unknown,
  lang: AppLanguage = 'mr'
): {
  isValid: boolean;
  error?: string;
  sanitized?: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
  };
} {
  if (!fileMeta || typeof fileMeta !== 'object') {
    return {
      isValid: false,
      error: lang === 'mr' ? 'अवैध कव्हर फाईल माहिती.' : 'Invalid cover file metadata.',
    };
  }
  const raw = fileMeta as Record<string, unknown>;
  const fileName =
    typeof raw.fileName === 'string'
      ? raw.fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 140)
      : '';
  const mimeType = typeof raw.mimeType === 'string' ? raw.mimeType.trim().toLowerCase() : '';
  const sizeBytes = Number(raw.sizeBytes) || 0;

  const lowerName = fileName.toLowerCase();
  const hasAllowedExt = ALLOWED_COVER_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  // Block double-extension attacks such as cover.php.jpg or cover.js.png
  const hasDangerousSegment = /\.(php|exe|sh|bat|js|mjs|html|htm|jsp|asp|py)\./i.test(
    lowerName
  );
  const hasAllowedMime = ALLOWED_COVER_MIMES.includes(mimeType);

  if (!fileName || !hasAllowedExt || hasDangerousSegment || !hasAllowedMime) {
    return {
      isValid: false,
      error:
        lang === 'mr'
          ? 'फक्त सुरक्षित इमेज फाईल्स (JPG, PNG, WEBP, SVG) स्वीकारल्या जातात.'
          : 'Only safe image files (JPG, PNG, WEBP, SVG) are permitted for book covers.',
    };
  }

  if (sizeBytes <= 0 || sizeBytes > MAX_COVER_BYTES) {
    return {
      isValid: false,
      error:
        lang === 'mr'
          ? 'कव्हर इमेजचा आकार ५ MB पेक्षा कमी असावा.'
          : 'Cover image size must be under 5 MB.',
    };
  }

  return {
    isValid: true,
    sanitized: {
      fileName,
      mimeType,
      sizeBytes,
      uploadedAt: new Date().toISOString(),
    },
  };
}
