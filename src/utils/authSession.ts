// ============================================================================
// HELPER FOR AUTHENTICATED API REQUESTS WITH BEARER + CSRF HEADERS
// Extracted into a lightweight zero-dependency module so homepage and store
// routes do not eagerly bundle Firebase Auth / Firestore SDKs.
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
