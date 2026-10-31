import React, { useState, useEffect } from 'react';
import {
  PublicUserProfile,
  BookRecord,
  AuthorRecord,
  OrderRecord,
  SavedAddress,
  SessionInfo,
  AuthorApplicationRecord,
} from '../types/publishing';
import { useLanguage } from '../i18n/translations';
import { validateEmail, validateIndianPhone } from '../utils/validation';
import { validatePasswordStrength, sanitizeRedirectPath } from '../auth/rbac';
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import { BookCoverArt } from '../components/BookCoverArt';
import {
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  Feather,
  BookOpen,
  Plus,
  Send,
  Trash2,
  LogOut,
  KeyRound,
  Sparkles,
  Upload,
} from 'lucide-react';

// ============================================================================
// HELPER FOR AUTHENTICATED API REQUESTS WITH BEARER + CSRF HEADERS
// ============================================================================

const SESSION_TOKEN_STORAGE_KEY = 'akath_session_token_v1';
const CSRF_TOKEN_STORAGE_KEY = 'akath_csrf_token_v1';

let memorySessionToken: string | null = null;
let memoryCsrfToken: string | null = null;

export function setAuthSessionTokens(
  sessionToken: string | null,
  csrfToken: string | null
): void {
  memorySessionToken = sessionToken;
  memoryCsrfToken = csrfToken;
  try {
    if (sessionToken) {
      sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, sessionToken);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    }
    if (csrfToken) {
      sessionStorage.setItem(CSRF_TOKEN_STORAGE_KEY, csrfToken);
    } else {
      sessionStorage.removeItem(CSRF_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or security errors in restricted contexts
  }
}

export function getAuthSessionTokens(): {
  sessionToken: string | null;
  csrfToken: string | null;
} {
  if (memorySessionToken || memoryCsrfToken) {
    return { sessionToken: memorySessionToken, csrfToken: memoryCsrfToken };
  }
  try {
    const sTok = sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
    const cTok = sessionStorage.getItem(CSRF_TOKEN_STORAGE_KEY);
    memorySessionToken = sTok;
    memoryCsrfToken = cTok;
    return { sessionToken: sTok, csrfToken: cTok };
  } catch {
    return { sessionToken: null, csrfToken: null };
  }
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
  csrfToken?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const stored = getAuthSessionTokens();
  const effectiveCsrf = csrfToken || stored.csrfToken;
  if (effectiveCsrf && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', effectiveCsrf);
  }
  if (stored.sessionToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${stored.sessionToken}`);
  }
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

// ============================================================================
// 1. ACCESS DENIED VIEW (403 FORBIDDEN / INSUFFICIENT ROLE)
// ============================================================================

export const AccessDeniedView: React.FC<{
  user: PublicUserProfile | null;
  requiredRoleLabel: string;
  reasonMessage?: string;
  intendedPath: string;
  onNavigate: (path: string) => void;
  onQuickPersonaSwitch?: (
    persona: 'reader' | 'author' | 'admin',
    targetPath?: string
  ) => void;
}> = ({
  user,
  requiredRoleLabel,
  reasonMessage,
  intendedPath,
  onNavigate,
  onQuickPersonaSwitch,
}) => {
  const { lang } = useLanguage();

  return (
    <div
      data-testid="access-denied-view"
      className="bg-[#FFFDF7] text-[#252832] min-h-[75vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 text-center space-y-6 shadow-[0_14px_36px_-18px_rgba(37,40,50,0.08)]">
        <div className="w-16 h-16 rounded-2xl bg-[#EF6855]/15 text-[#EF6855] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-lg bg-[#FFD966] text-[#252832] text-[12px] font-bold uppercase tracking-wide">
            403 · प्रवेश प्रतिबंधित (Access Restricted)
          </span>
          <h1 className="type-section-heading text-[#252832]">
            {lang === 'mr'
              ? `या विभागासाठी '${requiredRoleLabel}' परवानगी आवश्यक आहे`
              : `${requiredRoleLabel} Permission Required`}
          </h1>
          <p className="text-[15px] text-[#5A5F72] leading-relaxed">
            {reasonMessage ||
              (lang === 'mr'
                ? 'तुमच्या सध्याच्या खात्याला या पानावर किंवा कृतीवर प्रवेश करण्याची परवानगी नाही. सुरक्षिततेसाठी सर्व अधिकार सर्व्हरवर तपासले जातात.'
                : 'Your current account role does not grant access to this resource. All permissions are enforced on the server.')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] text-[13px] text-[#5A5F72] flex flex-wrap items-center justify-between gap-2">
          <span>
            {lang === 'mr' ? 'सध्याची भूमिका:' : 'Current Role:'}{' '}
            <strong className="text-[#243B8A] uppercase">
              {user ? user.role : 'guest'}
            </strong>
          </span>
          <span className="font-mono text-[12px]">{intendedPath}</span>
        </div>

        {onQuickPersonaSwitch && (
          <div className="p-4 rounded-2xl bg-[#243B8A] text-[#FFFDF7] text-left space-y-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#FFD966]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'mr'
                  ? 'झटपट डेमो प्रवेश (Instant Sandbox Role Switch):'
                  : 'Instant Demo Access (Preview Sandbox):'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intendedPath.startsWith('/admin') && (
                <button
                  type="button"
                  data-testid="access-denied-launch-admin-demo"
                  onClick={() => onQuickPersonaSwitch('admin', '/admin')}
                  className="px-4 py-2.5 rounded-xl bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-[13.5px] font-bold transition-colors"
                >
                  {lang === 'mr'
                    ? 'प्रशासक नियंत्रण कक्ष डेमो उघडा (Open Admin Console Demo)'
                    : 'Launch Admin Console Demo'}
                </button>
              )}
              {intendedPath.startsWith('/author') && (
                <button
                  type="button"
                  onClick={() =>
                    onQuickPersonaSwitch('author', '/author/dashboard')
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-[13.5px] font-bold transition-colors"
                >
                  {lang === 'mr'
                    ? 'लेखक दालन डेमो उघडा (Open Author Studio Demo)'
                    : 'Launch Author Studio Demo'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!user ? (
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  `/login?redirect=${encodeURIComponent(intendedPath)}`
                )
              }
              className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold transition-colors"
            >
              {lang === 'mr' ? 'लॉगिन करा' : 'Sign In to Continue'}
            </button>
          ) : user.role === 'reader' && intendedPath.startsWith('/author') ? (
            <button
              type="button"
              onClick={() => onNavigate('/author/apply')}
              className="px-6 py-3 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[14px] font-semibold transition-colors"
            >
              {lang === 'mr'
                ? 'लेखक भूमिकेसाठी अर्ज करा'
                : 'Apply for Author Access'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onNavigate('/books')}
            className="px-5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] text-[#252832] hover:bg-[#FFD966]/35 text-[14px] font-semibold transition-colors"
          >
            {lang === 'mr' ? 'पुस्तक दालन पाहा' : 'Browse Book Catalog'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. UNIFIED LOGIN, REGISTRATION, EMAIL VERIFICATION & PASSWORD RECOVERY VIEW
// ============================================================================

export const AuthPageView: React.FC<{
  initialMode:
    | 'login'
    | 'register'
    | 'forgot-password'
    | 'reset-password'
    | 'verify-email';
  redirectPath?: string;
  onAuthSuccess: (data: {
    user: PublicUserProfile;
    sessionToken?: string | null;
    csrfToken: string | null;
    mergedCart?: { bookId: string; quantity: number }[];
    redirectTo?: string;
  }) => void;
  onNavigate: (path: string) => void;
  guestCart: { bookId: string; quantity: number }[];
}> = ({
  initialMode,
  redirectPath,
  onAuthSuccess,
  onNavigate,
  guestCart,
}) => {
  const { lang } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [entryContext, setEntryContext] = useState<
    'reader' | 'author' | 'admin'
  >('reader');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  const [tokenInput, setTokenInput] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [devTokenNotice, setDevTokenNotice] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setFieldErrors({});
  }, [initialMode]);

  const pwdStrength = validatePasswordStrength(
    mode === 'reset-password' ? newResetPassword : password,
    lang
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      setFieldErrors({ email: emailCheck.error! });
      setError(emailCheck.error!);
      return;
    }
    if (!password) {
      const msg =
        lang === 'mr' ? 'कृपया पासवर्ड टाका.' : 'Please enter your password.';
      setFieldErrors({ password: msg });
      setError(msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailCheck.normalizedValue,
          password,
          guestCart,
          redirectTo: redirectPath,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }

      setAuthSessionTokens(data.sessionToken || null, data.csrfToken || null);
      onAuthSuccess({
        user: data.user,
        sessionToken: data.sessionToken || null,
        csrfToken: data.csrfToken || null,
        mergedCart: data.mergedCart,
        redirectTo: sanitizeRedirectPath(
          redirectPath || data.redirectTo,
          '/account'
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nextFieldErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextFieldErrors.name =
        lang === 'mr'
          ? 'कृपया तुमचे पूर्ण नाव लिहा.'
          : 'Please enter your full name.';
    }
    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextFieldErrors.email = emailCheck.error!;
    }
    if (phone.trim()) {
      const phoneCheck = validateIndianPhone(phone, lang);
      if (!phoneCheck.isValid) {
        nextFieldErrors.phone = phoneCheck.error!;
      }
    }
    if (!pwdStrength.isValid) {
      nextFieldErrors.password = pwdStrength.error!;
    }
    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword =
        lang === 'mr'
          ? 'पासवर्ड आणि पुष्टीकरण जुळत नाहीत.'
          : 'Passwords do not match.';
    }
    if (!consentConfirmed) {
      nextFieldErrors.consent =
        lang === 'mr'
          ? 'कृपया अटी आणि गोपनीयता धोरणास संमती द्या.'
          : 'Please accept the terms and privacy policy.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError(Object.values(nextFieldErrors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: emailCheck.normalizedValue,
          phone: phone.trim() || undefined,
          city: city.trim() || undefined,
          password,
          confirmPassword,
          consentConfirmed,
          guestCart,
          redirectTo:
            entryContext === 'author'
              ? '/author/apply'
              : redirectPath || '/account',
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldErrors(data.fieldErrors || {});
        setError(data.error || 'Registration failed.');
        return;
      }

      if (data.verificationTokenPreview) {
        setDevTokenNotice(data.verificationTokenPreview);
      }

      setAuthSessionTokens(data.sessionToken || null, data.csrfToken || null);
      onAuthSuccess({
        user: data.user,
        sessionToken: data.sessionToken || null,
        csrfToken: data.csrfToken || null,
        mergedCart: data.mergedCart,
        redirectTo:
          entryContext === 'author'
            ? '/author/apply'
            : sanitizeRedirectPath(redirectPath || data.redirectTo, '/account'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
        },
        body: JSON.stringify({ email, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed.');
        return;
      }
      setSuccessMsg(data.message);
      if (data.resetTokenPreview) {
        setTokenInput(data.resetTokenPreview);
        setDevTokenNotice(data.resetTokenPreview);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput,
          newPassword: newResetPassword,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        return;
      }
      setSuccessMsg(data.message);
      setTimeout(() => setMode('login'), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmailToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        return;
      }
      setSuccessMsg(data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSandboxSwitch = async (persona: 'reader' | 'author' | 'admin') => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/sandbox-persona', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setAuthSessionTokens(data.sessionToken || null, data.csrfToken || null);
        onAuthSuccess({
          user: data.user,
          sessionToken: data.sessionToken || null,
          csrfToken: data.csrfToken || null,
          mergedCart: data.mergedCart,
          redirectTo: data.redirectTo,
        });
      } else {
        setError(data.error || 'Could not switch preview persona.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-[980px] mx-auto space-y-6">
        {/* Top Instant Demo Role & Admin Console Banner */}
        <div
          data-testid="auth-page-demo-banner"
          className="bg-[#243B8A] text-[#FFFDF7] rounded-2xl p-4 sm:p-5 border border-[#1B2D6B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#FFD966]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'mr'
                  ? 'झटपट डेमो प्रवेश (१-क्लिक सर्व्हर सत्र)'
                  : '1-Click Live Role & Admin Console Demo'}
              </span>
            </div>
            <p className="text-[13px] text-[#FFFDF7]/85">
              {lang === 'mr'
                ? 'पासवर्ड न टाकता थेट प्रशासक कक्ष (Admin Console), लेखक पोर्टल किंवा वाचक खात्याची चाचणी करा:'
                : 'Test the live Admin Console, Author Studio, or Reader Account with 1 click:'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="top-sandbox-admin"
              disabled={submitting}
              onClick={() => handleSandboxSwitch('admin')}
              className="px-4 py-2.5 rounded-xl bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-[13px] font-bold transition-colors shadow-2xs"
            >
              {lang === 'mr'
                ? 'प्रशासक कक्ष डेमो (Admin Console)'
                : 'Admin Console Demo'}
            </button>
            <button
              type="button"
              data-testid="top-sandbox-author"
              disabled={submitting}
              onClick={() => handleSandboxSwitch('author')}
              className="px-3.5 py-2.5 rounded-xl bg-[#1B2D6B] hover:bg-white/15 text-[#FFFDF7] border border-white/20 text-[12.5px] font-semibold transition-colors"
            >
              {lang === 'mr' ? 'लेखक दालन डेमो' : 'Author Studio Demo'}
            </button>
            <button
              type="button"
              data-testid="top-sandbox-reader"
              disabled={submitting}
              onClick={() => handleSandboxSwitch('reader')}
              className="px-3.5 py-2.5 rounded-xl bg-[#1B2D6B] hover:bg-white/15 text-[#FFFDF7] border border-white/20 text-[12.5px] font-semibold transition-colors"
            >
              {lang === 'mr' ? 'वाचक खाते डेमो' : 'Reader Account Demo'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Editorial Identity & Entry-Point Selector */}
        <div className="lg:col-span-5 bg-[#243B8A] text-[#FFFDF7] rounded-3xl p-7 sm:p-8 space-y-6 shadow-[0_18px_42px_-18px_rgba(36,59,138,0.35)]">
          <div className="flex items-center gap-3">
            <AnimatedTortoiseEmblem
              className="w-12 h-12 shrink-0"
              variant="light"
              animate={true}
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FFD966]">
                अकथ प्रकाशन · सुरक्षित ओळख प्रणाली
              </p>
              <h2 className="font-serif text-[22px] font-bold text-[#FFFDF7]">
                {lang === 'mr'
                  ? 'वाचक, लेखक आणि संपादकीय कक्ष'
                  : 'Reader, Author & Editorial Access'}
              </h2>
            </div>
          </div>

          <p className="text-[14px] text-[#FFFDF7]/85 leading-relaxed">
            {lang === 'mr'
              ? 'पुस्तके पाहण्यासाठी किंवा गेस्ट चेकआउटसाठी खात्याची सक्ती नाही. मात्र ऑर्डर इतिहास, विशलिस्ट, पुस्तक समीक्षा आणि लेखक पोर्टलसाठी लॉगिन करा.'
              : 'No account is required to browse or complete guest checkout. Sign in to manage orders, wishlists, reviews, or author submissions.'}
          </p>

          {/* Role Entry-Point Context Selector */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-[#FFD966]">
              {lang === 'mr'
                ? 'प्रवेशद्वार निवडा (एकात्मिक सुरक्षा प्रणाली):'
                : 'Select Entry Point (Unified Identity System):'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'reader', mr: 'वाचक', en: 'Reader' },
                  { id: 'author', mr: 'लेखक', en: 'Author' },
                  { id: 'admin', mr: 'प्रशासक', en: 'Admin' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEntryContext(item.id);
                    if (item.id === 'admin' && mode === 'register') {
                      setMode('login');
                    }
                  }}
                  className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                    entryContext === item.id
                      ? 'bg-[#FFD966] text-[#252832] border-[#FFD966]'
                      : 'bg-[#1B2D6B] text-[#FFFDF7] border-white/15 hover:border-[#FFD966]/60'
                  }`}
                >
                  {lang === 'mr' ? item.mr : item.en}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-[#FFFDF7]/75 pt-1">
              {entryContext === 'reader' &&
                (lang === 'mr'
                  ? 'वाचक खाते: ऑर्डर ट्रॅकिंग, पत्ते, विशलिस्ट आणि पुस्तक अभिप्राय.'
                  : 'Reader Account: Order history, saved addresses, wishlist, and book reviews.')}
              {entryContext === 'author' &&
                (lang === 'mr'
                  ? 'लेखक प्रवाह: वाचक नोंदणी → लेखक अर्ज → संपादकीय मंजुरी → पुस्तक मसुदा पोर्टल.'
                  : 'Author Lifecycle: Reader Account → Author Application → Admin Approval → Author Portal.')}
              {entryContext === 'admin' &&
                (lang === 'mr'
                  ? 'प्रशासक कक्ष: सार्वजनिक नोंदणीमधून प्रशासक होता येत नाही. केवळ सर्व्हर-प्रमाणित खात्यांनाच प्रवेश मिळतो.'
                  : 'Admin Console: Cannot be self-selected via public signup. Server-verified credentials required.')}
            </p>
          </div>

          {/* Interactive Preview Sandbox Quick-Switch (Development Only) */}
          <div className="pt-4 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#FFD966]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'mr'
                  ? 'झटपट डेमो भूमिका चाचणी (Preview Sandbox):'
                  : 'Instant Role Preview (Dev Sandbox):'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                data-testid="sandbox-login-reader"
                onClick={() => handleSandboxSwitch('reader')}
                className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-[#FFD966] hover:text-[#252832] text-[12px] font-semibold transition-colors"
              >
                {lang === 'mr' ? 'वाचक डेमो' : 'Reader Demo'}
              </button>
              <button
                type="button"
                data-testid="sandbox-login-author"
                onClick={() => handleSandboxSwitch('author')}
                className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-[#FFD966] hover:text-[#252832] text-[12px] font-semibold transition-colors"
              >
                {lang === 'mr' ? 'लेखक डेमो' : 'Author Demo'}
              </button>
              <button
                type="button"
                data-testid="sandbox-login-admin"
                onClick={() => handleSandboxSwitch('admin')}
                className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-[#FFD966] hover:text-[#252832] text-[12px] font-semibold transition-colors"
              >
                {lang === 'mr' ? 'अॅडमिन डेमो' : 'Admin Demo'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-9 space-y-6 shadow-[0_12px_34px_-16px_rgba(37,40,50,0.07)]">
          {/* Mode Switch Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E6DFCE] pb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                onNavigate('/login');
              }}
              className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-[#243B8A] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] text-[#252832] border border-[#E6DFCE]'
              }`}
            >
              {lang === 'mr' ? 'लॉगिन (Sign In)' : 'Sign In'}
            </button>

            {entryContext !== 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  onNavigate('/register');
                }}
                className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors ${
                  mode === 'register'
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'bg-[#FFFDF7] text-[#252832] border border-[#E6DFCE]'
                }`}
              >
                {entryContext === 'author'
                  ? lang === 'mr'
                    ? 'नवीन लेखक खाते नोंदणी'
                    : 'Register & Apply as Author'
                  : lang === 'mr'
                  ? 'नवीन वाचक नोंदणी'
                  : 'Create Reader Account'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode('forgot-password')}
              className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                mode === 'forgot-password' || mode === 'reset-password'
                  ? 'bg-[#FFD966] text-[#252832] font-semibold'
                  : 'text-[#5A5F72] hover:text-[#243B8A]'
              }`}
            >
              {lang === 'mr' ? 'पासवर्ड विसरलात?' : 'Reset Password'}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              data-testid="auth-error-banner"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-[14px] flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              data-testid="auth-success-banner"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {devTokenNotice && (
            <div className="p-3.5 rounded-xl bg-[#FFD966]/30 border border-[#FFD966] text-[13px] text-[#252832] space-y-1">
              <p className="font-bold">
                {lang === 'mr'
                  ? 'स्थानिक चाचणी टोकन (Single-Use Security Token):'
                  : 'Local Verification / Reset Token:'}
              </p>
              <code className="block font-mono text-[12px] bg-white px-2.5 py-1.5 rounded border border-[#E6DFCE] break-all">
                {devTokenNotice}
              </code>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block ui-label mb-1.5">
                  {lang === 'mr' ? 'ईमेल पत्ता' : 'Email Address'} *
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  placeholder="reader@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block ui-label mb-1.5"
                >
                  {lang === 'mr' ? 'पासवर्ड' : 'Password'} *
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5F72] hover:text-[#243B8A] p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="auth-login-submit"
                className="w-full py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors disabled:opacity-60"
              >
                {submitting
                  ? lang === 'mr'
                    ? 'पडताळणी सुरू आहे...'
                    : 'Signing in...'
                  : lang === 'mr'
                  ? 'लॉगिन करा'
                  : 'Sign In'}
              </button>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-name" className="block ui-label mb-1">
                    {lang === 'mr' ? 'पूर्ण नाव' : 'Full Name'} *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block ui-label mb-1">
                    {lang === 'mr' ? 'ईमेल पत्ता' : 'Email Address'} *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-phone" className="block ui-label mb-1">
                    {lang === 'mr'
                      ? 'मोबाईल क्रमांक (ऐच्छिक)'
                      : 'Mobile Number (Optional)'}
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-city" className="block ui-label mb-1">
                    {lang === 'mr' ? 'शहर / गाव' : 'City / Town'}
                  </label>
                  <input
                    id="reg-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={lang === 'mr' ? 'नांदेड / पुणे' : 'Pune'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-password" className="block ui-label mb-1">
                    {lang === 'mr' ? 'पासवर्ड' : 'Password'} *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A5F72] p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="block ui-label mb-1">
                    {lang === 'mr' ? 'पासवर्डची पुष्टी करा' : 'Confirm Password'} *
                  </label>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                  />
                </div>
              </div>

              {/* Password Strength Meter */}
              <div className="p-3.5 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#252832]">
                    {lang === 'mr' ? 'पासवर्ड सुरक्षितता:' : 'Password Strength:'}
                  </span>
                  <span className="font-bold text-[#243B8A]">
                    {pwdStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full ${
                        pwdStrength.score >= step
                          ? pwdStrength.score >= 4
                            ? 'bg-[#15803D]'
                            : 'bg-[#FFD966]'
                          : 'bg-[#E6DFCE]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11.5px] text-[#5A5F72]">
                  {lang === 'mr'
                    ? 'किमान ८ अक्षरे, मोठे अक्षर (A-Z), लहान अक्षर (a-z), अंक (0-9) व विशेष चिन्ह (@#$!) आवश्यक.'
                    : 'Requires 8+ chars, uppercase, lowercase, number, and special symbol.'}
                </p>
              </div>

              <label className="flex items-start gap-2.5 text-[13.5px] text-[#252832] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#243B8A]"
                />
                <span>
                  {lang === 'mr'
                    ? 'मी अकथ प्रकाशनच्या सेवा अटी आणि गोपनीयता धोरणास संमती देतो/देते.'
                    : 'I agree to Akath Prakashan’s Terms of Use and Privacy Policy.'}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                data-testid="auth-register-submit"
                className="w-full py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors disabled:opacity-60"
              >
                {submitting
                  ? lang === 'mr'
                    ? 'खाते तयार होत आहे...'
                    : 'Creating Account...'
                  : entryContext === 'author'
                  ? lang === 'mr'
                    ? 'खाते तयार करा व लेखक अर्जाकडे जा'
                    : 'Create Account & Continue to Author Application'
                  : lang === 'mr'
                  ? 'वाचक खाते तयार करा'
                  : 'Create Reader Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-[14px] text-[#5A5F72]">
                {lang === 'mr'
                  ? 'तुमचा नोंदणीकृत ईमेल पत्ता टाका. पासवर्ड बदलण्यासाठी एकदाच वापरता येणारे (Single-Use) टोकन तयार केले जाईल.'
                  : 'Enter your registered email address to request a single-use password reset token.'}
              </p>
              <div>
                <label htmlFor="fp-email" className="block ui-label mb-1">
                  {lang === 'mr' ? 'ईमेल पत्ता' : 'Email Address'} *
                </label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'रीसेट टोकन मिळवा'
                    : 'Send Password Reset Token'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('reset-password')}
                  className="px-5 py-3 rounded-xl bg-[#FFFDF7] border border-[#E6DFCE] text-[#243B8A] text-[14px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'माझ्याकडे रीसेट टोकन आहे'
                    : 'I Have a Reset Token'}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="rp-token" className="block ui-label mb-1">
                  {lang === 'mr' ? 'रीसेट टोकन' : 'Password Reset Token'} *
                </label>
                <input
                  id="rp-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFCE] font-mono text-[13px] bg-[#FFFDF7]"
                />
              </div>
              <div>
                <label htmlFor="rp-newpwd" className="block ui-label mb-1">
                  {lang === 'mr' ? 'नवीन पासवर्ड' : 'New Password'} *
                </label>
                <input
                  id="rp-newpwd"
                  type={showPassword ? 'text' : 'password'}
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-[#FFFDF7]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {lang === 'mr'
                  ? 'नवीन पासवर्ड जतन करा'
                  : 'Confirm Password Reset'}
              </button>
            </form>
          )}

          {/* VERIFY EMAIL FORM */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerifyEmailToken} className="space-y-4">
              <div>
                <label htmlFor="ve-token" className="block ui-label mb-1">
                  {lang === 'mr'
                    ? 'ईमेल पडताळणी टोकन'
                    : 'Email Verification Token'}{' '}
                  *
                </label>
                <input
                  id="ve-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFCE] font-mono text-[13px] bg-[#FFFDF7]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {lang === 'mr' ? 'ईमेल प्रमाणित करा' : 'Verify Email Address'}
              </button>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. READER ACCOUNT WORKSPACE (/account, /account/orders, /account/wishlist)
// ============================================================================

export const ReaderAccountView: React.FC<{
  user: PublicUserProfile;
  csrfToken: string | null;
  activeSubTab?: 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security';
  books: BookRecord[];
  authors: AuthorRecord[];
  onUserUpdated: (user: PublicUserProfile) => void;
  onLogout: () => Promise<void>;
  onAddToCart: (bookId: string, qty?: number) => void;
  onNavigate: (path: string) => void;
}> = ({
  user,
  csrfToken,
  activeSubTab = 'profile',
  books,
  authors,
  onUserUpdated,
  onLogout,
  onAddToCart,
  onNavigate,
}) => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState(activeSubTab);

  // Profile state
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || '');
  const [bio, setBio] = useState(user.bio || '');
  const [prefs, setPrefs] = useState(user.notificationPreferences);
  const [verifyTokenInput, setVerifyTokenInput] = useState('');

  // Orders & guest linking state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [linkOrderNumber, setLinkOrderNumber] = useState('');
  const [linkGuestToken, setLinkGuestToken] = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addrLabel, setAddrLabel] = useState('घर');
  const [addrPhone, setAddrPhone] = useState(user.phone || '');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState(user.city || '');
  const [addrPin, setAddrPin] = useState('');

  // Security & sessions state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setTab(activeSubTab);
  }, [activeSubTab]);

  useEffect(() => {
    const loadAccountData = async () => {
      const [ordRes, addrRes, sesRes] = await Promise.all([
        authFetch('/api/account/orders', {}, csrfToken),
        authFetch('/api/account/addresses', {}, csrfToken),
        authFetch('/api/account/sessions', {}, csrfToken),
      ]);
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
      if (addrRes.ok) {
        const d = await addrRes.json();
        setAddresses(d.addresses || []);
      }
      if (sesRes.ok) {
        const d = await sesRes.json();
        setSessions(d.sessions || []);
      }
    };
    loadAccountData();
  }, [csrfToken]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const res = await authFetch(
      '/api/account/profile',
      {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          phone,
          city,
          bio,
          notificationPreferences: prefs,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({ type: 'error', text: data.error || 'Update failed.' });
      return;
    }
    onUserUpdated(data.user);
    setStatusBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? 'तुमची प्रोफाईल माहिती जतन झाली आहे.'
          : 'Your profile has been updated.',
    });
  };

  const handleResendVerification = async () => {
    const res = await authFetch(
      '/api/auth/resend-verification',
      { method: 'POST', body: JSON.stringify({ lang }) },
      csrfToken
    );
    const data = await res.json();
    if (res.ok && data.verificationTokenPreview) {
      setVerifyTokenInput(data.verificationTokenPreview);
      setStatusBanner({
        type: 'success',
        text: `Verification token generated: ${data.verificationTokenPreview}`,
      });
    }
  };

  const handleConfirmVerifyEmail = async () => {
    const res = await authFetch(
      '/api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ token: verifyTokenInput, lang }),
      },
      csrfToken
    );
    const data = await res.json();
    if (res.ok && data.user) {
      onUserUpdated(data.user);
      setStatusBanner({ type: 'success', text: data.message });
    } else {
      setStatusBanner({
        type: 'error',
        text: data.error || 'Verification failed.',
      });
    }
  };

  const handleLinkGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const res = await authFetch(
      '/api/account/orders/link',
      {
        method: 'POST',
        body: JSON.stringify({
          orderNumber: linkOrderNumber,
          guestAccessToken: linkGuestToken,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({
        type: 'error',
        text: data.error || 'Could not link order.',
      });
      return;
    }
    setOrders((prev) => [
      data.order,
      ...prev.filter((o) => o.id !== data.order.id),
    ]);
    setLinkOrderNumber('');
    setLinkGuestToken('');
    setStatusBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? `ऑर्डर ${data.order.orderNumber} तुमच्या खात्याशी जोडली गेली आहे.`
          : `Order ${data.order.orderNumber} linked to your account.`,
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const res = await authFetch(
      '/api/account/addresses',
      {
        method: 'POST',
        body: JSON.stringify({
          label: addrLabel,
          fullName: user.name,
          phone: addrPhone,
          addressLine1: addrLine1,
          city: addrCity,
          postalCode: addrPin,
          isDefault: addresses.length === 0,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({
        type: 'error',
        text: data.error || 'Could not save address.',
      });
      return;
    }
    setAddresses((prev) => [data.address, ...prev]);
    setAddrLine1('');
    setAddrPin('');
    setStatusBanner({
      type: 'success',
      text: lang === 'mr' ? 'नवीन पत्ता जोडला गेला.' : 'Saved address added.',
    });
  };

  const handleDeleteAddress = async (id: string) => {
    const res = await authFetch(
      `/api/account/addresses/${id}`,
      { method: 'DELETE' },
      csrfToken
    );
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleToggleWishlist = async (bookId: string) => {
    const res = await authFetch(
      '/api/account/wishlist/toggle',
      { method: 'POST', body: JSON.stringify({ bookId }) },
      csrfToken
    );
    const data = await res.json();
    if (res.ok && data.user) {
      onUserUpdated(data.user);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const res = await authFetch(
      '/api/account/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, lang }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({
        type: 'error',
        text: data.error || 'Password change failed.',
      });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setStatusBanner({ type: 'success', text: data.message });
  };

  const handleRevokeSession = async (sessionId: string) => {
    const res = await authFetch(
      `/api/account/sessions/${sessionId}`,
      { method: 'DELETE' },
      csrfToken
    );
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const res = await authFetch(
      '/api/account/delete-request',
      {
        method: 'POST',
        body: JSON.stringify({ password: deletePassword, lang }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({
        type: 'error',
        text: data.error || 'Account deactivation failed.',
      });
      return;
    }
    await onLogout();
    onNavigate('/');
  };

  const wishlistBooks = books.filter((b) =>
    user.wishlistBookIds.includes(b.id)
  );

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Account Masthead */}
        <div className="bg-[#243B8A] text-[#FFFDF7] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFD966] text-[#252832] text-[11px] font-bold uppercase">
                {user.role}
              </span>
              <span className="text-[12px] text-[#FFFDF7]/80">{user.email}</span>
              {user.emailVerified ? (
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  ✓ Verified
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-400/20 text-[#FFD966] border border-[#FFD966]/40">
                  Unverified Email
                </span>
              )}
            </div>
            <h1 className="type-section-heading text-[#FFFDF7]">{user.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user.role === 'reader' && (
              <button
                type="button"
                onClick={() => onNavigate('/author/apply')}
                className="px-4 py-2 rounded-xl bg-[#FFD966] text-[#252832] text-[13px] font-semibold inline-flex items-center gap-1.5"
              >
                <Feather className="w-4 h-4" />
                <span>
                  {lang === 'mr' ? 'लेखक अर्ज करा' : 'Apply as Author'}
                </span>
              </button>
            )}
            {(user.role === 'author' || user.role === 'admin') && (
              <button
                type="button"
                onClick={() => onNavigate('/author/dashboard')}
                className="px-4 py-2 rounded-xl bg-[#FFD966] text-[#252832] text-[13px] font-semibold inline-flex items-center gap-1.5"
              >
                <Feather className="w-4 h-4" />
                <span>
                  {lang === 'mr' ? 'लेखक दालन' : 'Author Dashboard'}
                </span>
              </button>
            )}
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-[#FFFDF7] text-[13px] font-semibold"
              >
                {lang === 'mr' ? 'प्रशासक कक्ष' : 'Admin Console'}
              </button>
            )}
            <button
              type="button"
              data-testid="account-logout-btn"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'mr' ? 'लॉगआउट' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E6DFCE] pb-3">
          {[
            {
              id: 'profile',
              label: lang === 'mr' ? 'प्रोफाईल' : 'Profile',
              path: '/account',
              icon: User,
            },
            {
              id: 'orders',
              label:
                lang === 'mr'
                  ? `माझ्या ऑर्डर्स (${orders.length})`
                  : `My Orders (${orders.length})`,
              path: '/account/orders',
              icon: Package,
            },
            {
              id: 'wishlist',
              label:
                lang === 'mr'
                  ? `विशलिस्ट (${wishlistBooks.length})`
                  : `Wishlist (${wishlistBooks.length})`,
              path: '/account/wishlist',
              icon: Heart,
            },
            {
              id: 'addresses',
              label:
                lang === 'mr'
                  ? `जतन पत्ते (${addresses.length})`
                  : `Saved Addresses (${addresses.length})`,
              path: '/account/addresses',
              icon: MapPin,
            },
            {
              id: 'security',
              label: lang === 'mr' ? 'सुरक्षा व सत्रे' : 'Security & Sessions',
              path: '/account/security',
              icon: Lock,
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id as typeof tab);
                  onNavigate(item.path);
                }}
                className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold inline-flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'bg-white border border-[#E6DFCE] text-[#252832] hover:bg-[#FFD966]/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {statusBanner && (
          <div
            role="status"
            className={`p-4 rounded-xl border text-[14px] ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-[#B42318]'
            }`}
          >
            {statusBanner.text}
          </div>
        )}

        {/* TAB 1: PROFILE & EMAIL VERIFICATION */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveProfile}
              className="lg:col-span-8 bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-5"
            >
              <h2 className="type-section-heading text-[#252832]">
                {lang === 'mr'
                  ? 'वैयक्तिक माहिती व वाचन प्राधान्ये'
                  : 'Personal Profile & Notification Preferences'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="acc-name" className="block ui-label mb-1">
                    {lang === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
                  </label>
                  <input
                    id="acc-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
                <div>
                  <label htmlFor="acc-phone" className="block ui-label mb-1">
                    {lang === 'mr' ? 'मोबाईल क्रमांक' : 'Mobile Phone'}
                  </label>
                  <input
                    id="acc-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="acc-city" className="block ui-label mb-1">
                  {lang === 'mr' ? 'शहर' : 'City'}
                </label>
                <input
                  id="acc-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>

              <div>
                <label htmlFor="acc-bio" className="block ui-label mb-1">
                  {lang === 'mr' ? 'वाचन परिचय' : 'Reader Bio'}
                </label>
                <textarea
                  id="acc-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>

              <div className="pt-2 space-y-2">
                <p className="font-semibold text-[14px]">
                  {lang === 'mr'
                    ? 'ईमेल सूचना प्राधान्ये:'
                    : 'Notification Preferences:'}
                </p>
                <label className="flex items-center gap-2 text-[14px]">
                  <input
                    type="checkbox"
                    checked={prefs.newReleases}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, newReleases: e.target.checked }))
                    }
                    className="accent-[#243B8A]"
                  />
                  <span>
                    {lang === 'mr'
                      ? 'नवीन प्रकाशित पुस्तकांची माहिती'
                      : 'New book release announcements'}
                  </span>
                </label>
                <label className="flex items-center gap-2 text-[14px]">
                  <input
                    type="checkbox"
                    checked={prefs.vachankattaDigest}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        vachankattaDigest: e.target.checked,
                      }))
                    }
                    className="accent-[#243B8A]"
                  />
                  <span>
                    {lang === 'mr'
                      ? 'वाचनकट्टा पाक्षिक संपादकीय निवड'
                      : 'Fortnightly Vachankatta literary digest'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {lang === 'mr' ? 'बदल जतन करा' : 'Save Profile Changes'}
              </button>
            </form>

            {/* Email Verification Side Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6DFCE] p-6 space-y-4">
              <h3 className="font-serif text-[19px] font-bold text-[#252832]">
                {lang === 'mr' ? 'ईमेल पडताळणी स्थिती' : 'Email Verification'}
              </h3>
              {user.emailVerified ? (
                <p className="text-[14px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  {lang === 'mr'
                    ? 'तुमचा ईमेल पत्ता प्रमाणित आहे.'
                    : 'Your email address is verified.'}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13.5px] text-[#5A5F72]">
                    {lang === 'mr'
                      ? 'गेस्ट ऑर्डर्स आपोआप खात्याशी जोडण्यासाठी कृपया तुमचा ईमेल प्रमाणित करा.'
                      : 'Verify your email address to automatically link eligible guest orders.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="w-full py-2.5 rounded-xl bg-[#FFD966] text-[#252832] text-[13px] font-semibold"
                  >
                    {lang === 'mr'
                      ? 'पडताळणी टोकन मिळवा'
                      : 'Generate Verification Token'}
                  </button>
                  <input
                    type="text"
                    value={verifyTokenInput}
                    onChange={(e) => setVerifyTokenInput(e.target.value)}
                    placeholder="Paste verification token"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DFCE] font-mono text-[12px]"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmVerifyEmail}
                    className="w-full py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13px] font-semibold"
                  >
                    {lang === 'mr' ? 'टोकन तपासा' : 'Verify Token'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS & GUEST ORDER LINKING */}
        {tab === 'orders' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
              <h2 className="type-section-heading text-[#252832]">
                {lang === 'mr'
                  ? 'तुमचा ऑर्डर इतिहास'
                  : 'Your Order History'}
              </h2>
              {orders.length === 0 ? (
                <p className="text-[15px] text-[#5A5F72] py-4">
                  {lang === 'mr'
                    ? 'तुमच्या खात्यावर अद्याप कोणतीही ऑर्डर नाही.'
                    : 'No orders found for your account yet.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-[#243B8A]">
                            {ord.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#FFD966]/60 text-[#252832] text-[12px] font-semibold">
                            {ord.orderStatus}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#252832]">
                          {ord.items
                            .map((i) => `${i.title} (×${i.approvedQuantity})`)
                            .join(', ')}
                        </p>
                        <p className="text-[12.5px] text-[#5A5F72]">
                          {ord.createdAt.slice(0, 10)} · एकूण: ₹{ord.grandTotal}
                        </p>
                      </div>
                      {ord.fulfilment.trackingNumber && (
                        <div className="text-[13px] text-[#243B8A] font-mono">
                          Tracking: {ord.fulfilment.trackingNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Link Guest Order Card */}
            <form
              onSubmit={handleLinkGuestOrder}
              className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4"
            >
              <h3 className="font-serif text-[20px] font-bold text-[#252832]">
                {lang === 'mr'
                  ? 'पूर्वीची गेस्ट ऑर्डर खात्याशी जोडा'
                  : 'Link a Previous Guest Order to Your Account'}
              </h3>
              <p className="text-[14px] text-[#5A5F72]">
                {lang === 'mr'
                  ? 'लॉगिन न करता केलेल्या ऑर्डरचा क्रमांक आणि गेस्ट टोकन टाकून ती ऑर्डर तुमच्या खात्यात समाविष्ट करा.'
                  : 'Enter your order number and guest access token (or use a verified matching email) to link a guest order.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={linkOrderNumber}
                  onChange={(e) => setLinkOrderNumber(e.target.value)}
                  placeholder="AK-2026-1043"
                  className="px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[14px]"
                />
                <input
                  type="text"
                  value={linkGuestToken}
                  onChange={(e) => setLinkGuestToken(e.target.value)}
                  placeholder="Guest Access Token (gtok-...)"
                  className="px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] font-mono text-[13px]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
                >
                  {lang === 'mr' ? 'ऑर्डर जोडा' : 'Link Order'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {tab === 'wishlist' && (
          <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-6">
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr' ? 'माझी विशलिस्ट' : 'My Saved Wishlist'}
            </h2>
            {wishlistBooks.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-[15px] text-[#5A5F72]">
                  {lang === 'mr'
                    ? 'तुमच्या विशलिस्टमध्ये अद्याप कोणतीही पुस्तके नाहीत.'
                    : 'Your wishlist is currently empty.'}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="px-5 py-2.5 rounded-xl bg-[#EF6855] text-[#FFFDF7] text-[14px] font-semibold"
                >
                  {lang === 'mr' ? 'पुस्तके पाहा' : 'Explore Books'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {wishlistBooks.map((b) => {
                  const author = authors.find((a) => a.id === b.authorId);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 shrink-0">
                          <BookCoverArt
                            book={b}
                            author={author}
                            size="sm"
                            onClick={() => onNavigate(`/books/${b.slug}`)}
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${b.slug}`)}
                            className="font-serif text-[18px] font-bold text-[#252832] hover:text-[#243B8A] text-left"
                          >
                            {b.title}
                          </button>
                          <p className="text-[13px] text-[#5A5F72]">
                            {author?.name} · ₹{b.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAddToCart(b.id, 1)}
                          className="px-3.5 py-2 rounded-xl bg-[#EF6855] text-[#FFFDF7] text-[13px] font-semibold"
                        >
                          + पिशवीत
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(b.id)}
                          aria-label="Remove from wishlist"
                          className="p-2 rounded-xl border border-[#E6DFCE] text-[#5A5F72] hover:text-[#B42318]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED ADDRESSES */}
        {tab === 'addresses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
              <h2 className="type-section-heading text-[#252832]">
                {lang === 'mr' ? 'जतन केलेले वितरण पत्ते' : 'Saved Addresses'}
              </h2>
              {addresses.length === 0 ? (
                <p className="text-[14px] text-[#5A5F72]">
                  {lang === 'mr'
                    ? 'अद्याप कोणताही पत्ता जतन केलेला नाही.'
                    : 'No saved addresses yet.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 text-[14px]">
                        <span className="px-2 py-0.5 rounded bg-[#FFD966] text-[#252832] text-[11px] font-bold">
                          {addr.label}
                        </span>
                        <p className="font-bold text-[#252832]">
                          {addr.fullName} · {addr.phone}
                        </p>
                        <p className="text-[#5A5F72]">
                          {addr.addressLine1}, {addr.city} - {addr.postalCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-[#5A5F72] hover:text-[#B42318]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleAddAddress}
              className="lg:col-span-5 bg-white rounded-3xl border border-[#E6DFCE] p-6 space-y-4"
            >
              <h3 className="font-serif text-[19px] font-bold">
                {lang === 'mr' ? 'नवीन पत्ता जोडा' : 'Add New Address'}
              </h3>
              <input
                type="text"
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Label (घर / कार्यालय)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
              />
              <input
                type="tel"
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                placeholder="Mobile (9876543210)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
              />
              <input
                type="text"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                placeholder="Street & Locality Address"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
                />
                <input
                  type="text"
                  value={addrPin}
                  onChange={(e) => setAddrPin(e.target.value)}
                  placeholder="PIN (411004)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {lang === 'mr' ? 'पत्ता जतन करा' : 'Save Address'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: SECURITY, ACTIVE SESSIONS & ACCOUNT DEACTIVATION */}
        {tab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <form
                onSubmit={handleChangePassword}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-6 space-y-4"
              >
                <h3 className="font-serif text-[20px] font-bold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#243B8A]" />
                  <span>
                    {lang === 'mr' ? 'पासवर्ड बदला' : 'Change Password'}
                  </span>
                </h3>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={
                    lang === 'mr' ? 'सध्याचा पासवर्ड' : 'Current Password'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'नवीन सुरक्षित पासवर्ड'
                      : 'New Strong Password'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
                >
                  {lang === 'mr' ? 'पासवर्ड अद्ययावत करा' : 'Update Password'}
                </button>
              </form>

              <form
                onSubmit={handleDeactivateAccount}
                className="bg-white rounded-3xl border border-red-200 p-6 space-y-3"
              >
                <h3 className="font-serif text-[18px] font-bold text-[#B42318]">
                  {lang === 'mr'
                    ? 'खाते निष्क्रिय करा (Account Deletion)'
                    : 'Request Account Deactivation'}
                </h3>
                <p className="text-[13px] text-[#5A5F72]">
                  {lang === 'mr'
                    ? 'खाते निष्क्रिय केल्यास तुमची सर्व सत्रे बंद होतील, परंतु कायदेशीर ऑर्डर नोंदी जतन राहतील.'
                    : 'Deactivating your account revokes all active sessions while preserving historical order records.'}
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'पुष्टीकरणासाठी पासवर्ड टाका'
                      : 'Confirm password to deactivate'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[14px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#B42318] text-white text-[13px] font-semibold"
                >
                  {lang === 'mr'
                    ? 'खाते कायमस्वरूपी निष्क्रिय करा'
                    : 'Deactivate My Account'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E6DFCE] p-6 space-y-4">
              <h3 className="font-serif text-[20px] font-bold">
                {lang === 'mr'
                  ? `सक्रिय लॉगिन सत्रे (${sessions.length})`
                  : `Active Sessions (${sessions.length})`}
              </h3>
              <div className="space-y-3">
                {sessions.map((ses) => (
                  <div
                    key={ses.id}
                    className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-center justify-between gap-3 text-[13px]"
                  >
                    <div>
                      <p className="font-semibold text-[#252832]">
                        {ses.userAgent.slice(0, 50)}{' '}
                        {ses.isCurrent && (
                          <span className="ml-1.5 px-2 py-0.5 rounded bg-[#FFD966] text-[#252832] text-[11px] font-bold">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-[#5A5F72] text-[12px]">
                        IP: {ses.ipAddress} · Expires:{' '}
                        {ses.expiresAt.slice(0, 10)}
                      </p>
                    </div>
                    {!ses.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(ses.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-[#B42318] text-[12px] font-semibold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. AUTHOR ONBOARDING & PUBLISHING PORTAL VIEW (/author/*)
// ============================================================================

export const AuthorPortalView: React.FC<{
  user: PublicUserProfile;
  csrfToken: string | null;
  subRoute: 'apply' | 'dashboard' | 'books';
  onNavigate: (path: string) => void;
  onRefreshCatalog: () => void;
}> = ({ user, csrfToken, subRoute, onNavigate, onRefreshCatalog }) => {
  const { lang } = useLanguage();

  // Author application state (for Reader -> Author onboarding)
  const [myApplications, setMyApplications] = useState<
    AuthorApplicationRecord[]
  >([]);
  const [penName, setPenName] = useState(user.name);
  const [region, setRegion] = useState(user.city || 'नांदेड / पुणे');
  const [literaryRole, setLiteraryRole] = useState('कादंबरीकार व निबंधकार');
  const [phone, setPhone] = useState(user.phone || '9823011223');
  const [biography, setBiography] = useState(user.bio || '');
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [sampleExcerpt, setSampleExcerpt] = useState('');

  // Approved Author Dashboard state
  const [authorProfile, setAuthorProfile] = useState<AuthorRecord | null>(null);
  const [myBooks, setMyBooks] = useState<BookRecord[]>([]);
  const [royalties, setRoyalties] = useState<{
    totalCopiesSold: number;
    grossBookRevenue: number;
    royaltyRatePercent: number;
    estimatedRoyaltyInr: number;
  } | null>(null);

  // New Book Draft state
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubtitle, setDraftSubtitle] = useState('');
  const [draftCategory, setDraftCategory] = useState('कादंबरी');
  const [draftPrice, setDraftPrice] = useState('320');
  const [draftPages, setDraftPages] = useState('192');
  const [draftDescription, setDraftDescription] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isApprovedAuthor = user.role === 'author' || user.role === 'admin';

  const loadAuthorData = async () => {
    const appRes = await authFetch('/api/author-applications/mine', {}, csrfToken);
    if (appRes.ok) {
      const d = await appRes.json();
      setMyApplications(d.applications || []);
    }

    if (isApprovedAuthor) {
      const dashRes = await authFetch('/api/author/dashboard', {}, csrfToken);
      if (dashRes.ok) {
        const d = await dashRes.json();
        setAuthorProfile(d.authorProfile);
        setMyBooks(d.books || []);
        setRoyalties(d.royalties || null);
      }
    }
  };

  useEffect(() => {
    loadAuthorData();
  }, [user.role, csrfToken]);

  // If unapproved reader tries to access /author/dashboard or /author/books directly, enforce RBAC
  if (!isApprovedAuthor && subRoute !== 'apply') {
    return (
      <AccessDeniedView
        user={user}
        requiredRoleLabel="Approved Author (मान्यताप्राप्त लेखक)"
        reasonMessage={
          lang === 'mr'
            ? 'लेखक प्रकाशन डॅशबोर्ड आणि पुस्तक मसुदा निर्मितीसाठी प्रथम तुमचा लेखक अर्ज संपादकीय मंडळाकडून मंजूर होणे आवश्यक आहे.'
            : 'Author publishing tools require an approved Author role. Submit an author application below for editorial approval.'
        }
        intendedPath={`/author/${subRoute}`}
        onNavigate={onNavigate}
      />
    );
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackBanner(null);
    const res = await authFetch(
      '/api/author-applications',
      {
        method: 'POST',
        body: JSON.stringify({
          penName,
          region,
          literaryRole,
          phone,
          biography,
          portfolioSummary,
          sampleWritingExcerpt: sampleExcerpt,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: 'error',
        text: data.error || 'Could not submit application.',
      });
      return;
    }
    setMyApplications((prev) => [data.application, ...prev]);
    setFeedbackBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? 'तुमचा लेखक अर्ज संपादकीय मंडळाकडे पाठवला गेला आहे!'
          : 'Your author application has been submitted for editorial approval!',
    });
  };

  const handleCreateOrUpdateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackBanner(null);

    const url = editingBookId
      ? `/api/author/books/${editingBookId}`
      : '/api/author/books';
    const method = editingBookId ? 'PATCH' : 'POST';

    const res = await authFetch(
      url,
      {
        method,
        body: JSON.stringify({
          title: draftTitle,
          subtitle: draftSubtitle,
          category: draftCategory,
          price: Number(draftPrice) || 320,
          pageCount: Number(draftPages) || 180,
          description: draftDescription,
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: 'error',
        text: data.error || 'Failed to save draft.',
      });
      return;
    }

    setDraftTitle('');
    setDraftSubtitle('');
    setDraftDescription('');
    setEditingBookId(null);
    await loadAuthorData();
    onRefreshCatalog();
    setFeedbackBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? 'पुस्तक मसुदा यशस्वीरित्या जतन झाला आहे.'
          : 'Book draft saved successfully.',
    });
  };

  const handleSubmitBookForReview = async (bookId: string) => {
    setFeedbackBanner(null);
    const res = await authFetch(
      `/api/author/books/${bookId}/submit-review`,
      { method: 'POST' },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: 'error',
        text: data.error || 'Could not submit for review.',
      });
      return;
    }
    await loadAuthorData();
    setFeedbackBanner({
      type: 'success',
      text:
        lang === 'mr'
          ? 'पुस्तक संपादकीय परीक्षणासाठी पाठवले गेले आहे!'
          : 'Book submitted to the editorial board for moderation!',
    });
  };

  const handleCoverUpload = async (bookId: string, file: File) => {
    setFeedbackBanner(null);
    const res = await authFetch(
      `/api/author/books/${bookId}/cover`,
      {
        method: 'POST',
        body: JSON.stringify({
          fileMeta: {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          },
          lang,
        }),
      },
      csrfToken
    );
    const data = await res.json();
    if (!res.ok) {
      setFeedbackBanner({
        type: 'error',
        text: data.error || 'Cover upload rejected.',
      });
      return;
    }
    await loadAuthorData();
    setFeedbackBanner({
      type: 'success',
      text: `Cover image '${file.name}' verified and attached.`,
    });
  };

  // Render Author Application Onboarding if not yet an author or if on /author/apply
  if (!isApprovedAuthor || subRoute === 'apply') {
    return (
      <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto space-y-8">
          <div className="bg-[#243B8A] text-[#FFFDF7] rounded-3xl p-7 sm:p-9 space-y-3">
            <span className="px-3 py-1 rounded-lg bg-[#FFD966] text-[#252832] text-[12px] font-bold">
              Guest → Reader → Author Application → Admin Approval
            </span>
            <h1 className="type-page-heading text-[#FFFDF7]">
              {lang === 'mr'
                ? 'अकथ प्रकाशन लेखक नोंदणी व संपादकीय अर्ज'
                : 'Akath Author Onboarding Application'}
            </h1>
            <p className="text-[14.5px] text-[#FFFDF7]/85">
              {lang === 'mr'
                ? 'नवीन लेखकांना थेट पुस्तक प्रकाशित करण्याचे अधिकार दिले जात नाहीत. संपादकीय समितीच्या मंजुरीनंतर लेखक डॅशबोर्ड सुरू होतो.'
                : 'New accounts do not automatically receive publishing privileges. Submit your literary profile below for administrative approval.'}
            </p>
          </div>

          {feedbackBanner && (
            <div
              role="status"
              className={`p-4 rounded-xl border text-[14px] ${
                feedbackBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-[#B42318]'
              }`}
            >
              {feedbackBanner.text}
            </div>
          )}

          {myApplications.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 space-y-4">
              <h2 className="font-serif text-[20px] font-bold">
                {lang === 'mr'
                  ? 'तुमच्या अर्जाची स्थिती'
                  : 'Your Author Application Status'}
              </h2>
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#243B8A]">
                      {app.penName} · {app.literaryRole}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-[12px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-[#B42318]'
                          : 'bg-[#FFD966] text-[#252832]'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.moderationNote && (
                    <p className="text-[13.5px] text-[#5A5F72]">
                      संपादकीय टीप: {app.moderationNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmitApplication}
            className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-9 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="app-pen" className="block ui-label mb-1">
                  {lang === 'mr' ? 'लेखकीय नाव (Pen Name)' : 'Author / Pen Name'}
                </label>
                <input
                  id="app-pen"
                  type="text"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
              <div>
                <label htmlFor="app-phone" className="block ui-label mb-1">
                  {lang === 'mr' ? 'मोबाईल क्रमांक' : 'Mobile Number'} *
                </label>
                <input
                  id="app-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="app-role" className="block ui-label mb-1">
                  {lang === 'mr' ? 'साहित्य प्रकार / भूमिका' : 'Literary Role'}
                </label>
                <input
                  id="app-role"
                  type="text"
                  value={literaryRole}
                  onChange={(e) => setLiteraryRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
              <div>
                <label htmlFor="app-region" className="block ui-label mb-1">
                  {lang === 'mr' ? 'प्रदेश / शहर' : 'Region / City'}
                </label>
                <input
                  id="app-region"
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="app-bio" className="block ui-label mb-1">
                {lang === 'mr'
                  ? 'साहित्यिक परिचय (किमान ३० अक्षरे)'
                  : 'Literary Biography (min 30 chars)'}{' '}
                *
              </label>
              <textarea
                id="app-bio"
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
              />
            </div>

            <div>
              <label htmlFor="app-sample" className="block ui-label mb-1">
                {lang === 'mr'
                  ? 'लेखनाचा नमुना उतारा (किमान ५० अक्षरे)'
                  : 'Sample Writing Excerpt (min 50 chars)'}{' '}
                *
              </label>
              <textarea
                id="app-sample"
                rows={4}
                value={sampleExcerpt}
                onChange={(e) => setSampleExcerpt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-author-application-btn"
              className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold"
            >
              {lang === 'mr'
                ? 'संपादकीय मंजुरीसाठी अर्ज पाठवा'
                : 'Submit Author Application'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Approved Author Dashboard & Book Drafts Workspace
  return (
    <div
      data-testid="author-dashboard-view"
      className="bg-[#FFFDF7] text-[#252832] min-h-screen py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="bg-[#243B8A] text-[#FFFDF7] rounded-3xl p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-[#FFD966] text-[#252832] text-[11px] font-bold uppercase">
              Author Publishing Workspace
            </span>
            <h1 className="type-section-heading text-[#FFFDF7] mt-1">
              {authorProfile?.name || user.name}
            </h1>
            <p className="text-[13.5px] text-[#FFFDF7]/80">
              {authorProfile?.literaryRole} · {authorProfile?.region}
            </p>
          </div>

          {royalties && (
            <div className="grid grid-cols-3 gap-3 bg-[#1B2D6B] p-3.5 rounded-2xl border border-white/15 text-center">
              <div>
                <p className="text-[11px] text-[#FFD966]">विक्री प्रती</p>
                <p className="text-[18px] font-bold tabular-nums">
                  {royalties.totalCopiesSold}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#FFD966]">एकूण उलाढाल</p>
                <p className="text-[18px] font-bold tabular-nums">
                  ₹{royalties.grossBookRevenue}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#FFD966]">
                  मानधन ({royalties.royaltyRatePercent}%)
                </p>
                <p className="text-[18px] font-bold tabular-nums">
                  ₹{royalties.estimatedRoyaltyInr}
                </p>
              </div>
            </div>
          )}
        </div>

        {feedbackBanner && (
          <div
            role="status"
            className={`p-4 rounded-xl border text-[14px] ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-[#B42318]'
            }`}
          >
            {feedbackBanner.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Author's Owned Books & Drafts */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-5">
            <h2 className="type-section-heading text-[#252832] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#243B8A]" />
              <span>
                {lang === 'mr'
                  ? `माझी पुस्तके आणि मसुदे (${myBooks.length})`
                  : `My Books & Drafts (${myBooks.length})`}
              </span>
            </h2>

            <div className="space-y-4">
              {myBooks.map((book) => {
                const status = book.publicationStatus || 'published';
                const canEdit =
                  status === 'draft' || status === 'revision_requested';
                return (
                  <div
                    key={book.id}
                    className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[12px] font-semibold text-[#243B8A]">
                          {book.category} · ₹{book.price}
                        </span>
                        <h3 className="font-serif text-[20px] font-bold text-[#252832]">
                          {book.title}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-[12px] font-bold uppercase ${
                          status === 'published'
                            ? 'bg-emerald-100 text-emerald-900'
                            : status === 'submitted_for_review'
                            ? 'bg-[#FFD966] text-[#252832]'
                            : 'bg-[#243B8A]/10 text-[#243B8A]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-[14px] text-[#5A5F72] line-clamp-2">
                      {book.description}
                    </p>

                    {book.moderationFeedback && (
                      <p className="text-[12.5px] bg-[#FFD966]/25 border border-[#FFD966] rounded-xl px-3 py-2 text-[#252832]">
                        <strong>संपादकीय अभिप्राय:</strong>{' '}
                        {book.moderationFeedback}
                      </p>
                    )}

                    {canEdit && (
                      <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-[#E6DFCE]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBookId(book.id);
                            setDraftTitle(book.title);
                            setDraftSubtitle(book.subtitle || '');
                            setDraftCategory(book.category);
                            setDraftPrice(String(book.price));
                            setDraftDescription(book.description);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6DFCE] text-[13px] font-semibold"
                        >
                          {lang === 'mr' ? 'मसुदा संपादित करा' : 'Edit Draft'}
                        </button>

                        <label className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6DFCE] text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-[#243B8A]" />
                          <span>
                            {book.coverUploadMeta
                              ? book.coverUploadMeta.fileName
                              : lang === 'mr'
                              ? 'कव्हर अपलोड'
                              : 'Upload Cover'}
                          </span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.svg"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleCoverUpload(book.id, f);
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleSubmitBookForReview(book.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#EF6855] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'mr'
                              ? 'परीक्षणासाठी पाठवा'
                              : 'Submit for Review'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Create or Edit Book Draft Form */}
          <form
            onSubmit={handleCreateOrUpdateDraft}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4 h-fit"
          >
            <h2 className="font-serif text-[21px] font-bold text-[#252832] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EF6855]" />
              <span>
                {editingBookId
                  ? lang === 'mr'
                    ? 'पुस्तक मसुदा संपादित करा'
                    : 'Edit Book Draft'
                  : lang === 'mr'
                  ? 'नवीन पुस्तक मसुदा तयार करा'
                  : 'Create New Book Draft'}
              </span>
            </h2>

            <div>
              <label htmlFor="dr-title" className="block ui-label mb-1">
                {lang === 'mr' ? 'पुस्तकाचे शीर्षक' : 'Book Title'} *
              </label>
              <input
                id="dr-title"
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
              />
            </div>

            <div>
              <label htmlFor="dr-sub" className="block ui-label mb-1">
                {lang === 'mr' ? 'उपशीर्षक' : 'Subtitle'}
              </label>
              <input
                id="dr-sub"
                type="text"
                value={draftSubtitle}
                onChange={(e) => setDraftSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="dr-cat" className="block ui-label mb-1">
                  {lang === 'mr' ? 'प्रकार' : 'Category'}
                </label>
                <select
                  id="dr-cat"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7] text-[13.5px]"
                >
                  <option value="कादंबरी">कादंबरी</option>
                  <option value="कथासंग्रह">कथासंग्रह</option>
                  <option value="कवितासंग्रह">कवितासंग्रह</option>
                  <option value="समीक्षा व निबंध">समीक्षा व निबंध</option>
                </select>
              </div>
              <div>
                <label htmlFor="dr-price" className="block ui-label mb-1">
                  किंमत (₹)
                </label>
                <input
                  id="dr-price"
                  type="number"
                  value={draftPrice}
                  onChange={(e) => setDraftPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
              <div>
                <label htmlFor="dr-pages" className="block ui-label mb-1">
                  पृष्ठे
                </label>
                <input
                  id="dr-pages"
                  type="number"
                  value={draftPages}
                  onChange={(e) => setDraftPages(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dr-desc" className="block ui-label mb-1">
                {lang === 'mr'
                  ? 'पुस्तक परिचय व सारांश (किमान २० अक्षरे)'
                  : 'Description & Synopsis (min 20 chars)'}{' '}
                *
              </label>
              <textarea
                id="dr-desc"
                rows={4}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] bg-[#FFFDF7]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                data-testid="save-book-draft-btn"
                className="flex-1 py-3 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {editingBookId
                  ? lang === 'mr'
                    ? 'मसुदा अद्ययावत करा'
                    : 'Update Draft'
                  : lang === 'mr'
                  ? 'मसुदा म्हणून जतन करा'
                  : 'Save as Draft'}
              </button>
              {editingBookId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBookId(null);
                    setDraftTitle('');
                    setDraftSubtitle('');
                    setDraftDescription('');
                  }}
                  className="px-4 py-3 rounded-xl border border-[#E6DFCE] text-[13px]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
