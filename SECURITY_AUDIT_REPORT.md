# Akath Prakashan — Comprehensive Application Security Audit Report

**Project**: Akath Prakashan (अकथ प्रकाशन) — Marathi Literary Publishing & E-Commerce Platform  
**Audit Date**: November 4, 2026  
**Audit Mode**: Read-Only Static & Architectural Security Assessment (Zero Code Modifications Performed)  
**Methodology**: OWASP Top 10 (2021/2025), OWASP ASVS v4.0.3 (L2), CWE Software Weakness Analysis

---

## 1. Executive Summary

A read-only, full-stack application security audit was conducted across the entire **Akath Prakashan** codebase (`server.ts`, `src/server/*`, `src/auth/*`, `src/views/*`, `src/components/*`, `src/data/*`, build configurations, and client-side storage flows).

### Overall Security Posture

The application implements a strong foundational security architecture, including:
- **`scrypt` + `timingSafeEqual` Password Hashing**: Passwords use random 16-byte salts and 64-byte `scrypt` key derivation (`src/server/authStore.ts:22-43`).
- **Hashed Server-Side Session Storage**: Raw session tokens are never stored in memory; only SHA-256 digests (`tokenHash`) are persisted in `sessionsStore` (`src/server/authStore.ts:45-51`).
- **Centralized RBAC & Ownership Enforcement**: A well-defined 4-role permission matrix (`guest`, `reader`, `author`, `admin`) in `src/auth/rbac.ts:16-89` enforces horizontal and vertical ownership checks across author studios, manuscripts, articles, and orders.
- **Server-Authoritative Cart & Pricing Engine**: `calculateServerCartQuote` (`server.ts:568-703`) and `POST /api/orders` (`server.ts:2903-3073`) strictly ignore client-supplied unit prices (`price`, `amount`, `total`) and recompute all totals from the canonical `booksStore`.
- **Zero Production Source Map Exposure**: Production builds (`dist/assets/`) emit minified bundles without `.map` files.

However, the audit identified **12 concrete security findings** (**2 Critical, 4 High, 4 Medium, 2 Low**) that require remediation prior to production deployment:

| ID | Severity | Title | Primary Location |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Unauthenticated Payment Status Manipulation, Inventory Depletion & Order PII Leak | `server.ts:3075-3159` |
| **SEC-02** | **CRITICAL** | Unauthenticated One-Click Admin Privilege Escalation When `NODE_ENV !== 'production'` | `server.ts:1475-1556`, `package.json:9` |
| **SEC-03** | **HIGH** | Raw Password Reset & Verification Token Leakage in Non-Production API Responses | `server.ts:931-932, 1054-1055, 1301-1304` |
| **SEC-04** | **HIGH** | Raw Session Token Stored in `sessionStorage` + CSRF Check Bypassed by Bearer Header | `src/views/AuthAndRoleViews.tsx:48-109`, `server.ts:481, 509` |
| **SEC-05** | **HIGH** | Hardcoded Fallback Payment Webhook HMAC Secret & Unconnected Webhook Verifier | `src/server/cmsStore.ts:14-41`, `server.ts:89` |
| **SEC-06** | **HIGH** | Unthrottled Admin Bootstrap Endpoint, Non-Constant-Time Comparison & Unignored `.aistudio/` Directory | `server.ts:1386-1407`, `.gitignore:1-9` |
| **SEC-07** | **MEDIUM** | Missing Express `trust proxy` Configuration Causes Shared-IP Rate-Limit DoS Behind Proxies | `server.ts:94-140, 382-385, 1061-1068` |
| **SEC-08** | **MEDIUM** | Unbounded Percentage Discounts in Admin Promo API & Public Promo Usage Exposure | `server.ts:1584, 4599-4638` |
| **SEC-09** | **MEDIUM** | SVG Upload Allowed in Book Cover Validator & Unsanitized `siteConfig` Spread (`ctaLink`) | `src/auth/rbac.ts:297-303`, `server.ts:4549-4568` |
| **SEC-10** | **MEDIUM** | Missing `Content-Security-Policy` / `HSTS` Headers & Logout Cookie Attribute Mismatch | `server.ts:102-107, 397-402` |
| **SEC-11** | **LOW** | Unbounded In-Memory Store Growth & Unthrottled Reaction/Analytics Endpoints | `server.ts:113, 1657, 4640` |
| **SEC-12** | **LOW** | Missing `package-lock.json` Lockfile Prevents Deterministic Builds & `npm audit` | `/package.json` |

---

## 2. Phase 1 — Discovered Technology Stack & Architecture

### 2.1 Frontend, Backend & Build Pipeline
- **Frontend Framework**: React `19.0.1` SPA (`src/App.tsx`, `src/views/*`, `src/components/*`), TypeScript `7.0.2`, Vite `8.3.0`, Tailwind CSS `4.3.3` (`@tailwindcss/vite`), Motion `12.23.24`, Lucide React `0.546.0` (`package.json:12-30`).
- **Backend Runtime & Server**: Node.js (ES Modules) running Express `4.21.2` in a unified entry point (`server.ts`, 4,670 lines) listening on port `3000`.
- **Execution Scripts**:
  - Development: `"dev": "tsx server.ts"` (`package.json:6`) — mounts Vite dev middleware (`server.ts:4654-4659`).
  - Production Build: `"build": "vite build"` (`package.json:7`) — outputs static client bundle to `dist/`.
  - Production Start: `"start": "node --import tsx server.ts"` (`package.json:9`) — serves `dist/` only when `process.env.NODE_ENV === 'production'` (`server.ts:4652-4664`).
- **Database & Persistence Layer**:
  - No external SQL or NoSQL database is connected (`better-sqlite3` is listed in `package.json:15` and `googleapis` in `package.json:17`, but neither is imported or used in application code).
  - Application state resides in in-memory TypeScript collections (`booksStore`, `authorsStore`, `excerptsStore`, `articlesStore`, `readingListsStore`, `ordersStore`, `usersStore`, `sessionsStore`, `tokensStore`, `reviewsStore`, `inventoryMovementsStore`, `promotionsStore`, `siteConfigStore`, `securityAuditStore`).
  - Disk persistence is implemented via JSON snapshots written to `.aistudio/cms-state.json` (`src/server/cmsStore.ts:439-505`) and a local bootstrap secret written to `.aistudio/server-bootstrap-token.txt` (`src/server/authStore.ts:134-165`).

### 2.2 Complete API Endpoint Inventory (`server.ts`)
- **Public Bootstrap, Search & Content**:
  - `GET /api/bootstrap` (`server.ts:1563`) — Public catalog, authors, published articles, reading lists, featured edition, public reviews, active promotions, and site config.
  - `GET /api/search` (`server.ts:1589`), `GET /api/books` (`server.ts:1636`), `GET /api/books/:id` (`server.ts:1645`), `POST /api/excerpts/:id/react` (`server.ts:1657`), `GET /api/books/:id/reviews` (`server.ts:1671`), `POST /api/analytics/event` (`server.ts:4640`).
- **Authentication & Account Lifecycle**:
  - `POST /api/auth/register` (`server.ts:819`), `POST /api/auth/verify-email` (`server.ts:936`), `POST /api/auth/resend-verification` (`server.ts:1007`), `POST /api/auth/login` (`server.ts:1060`), `POST /api/auth/logout` (`server.ts:1197`), `POST /api/auth/logout-all` (`server.ts:1215`), `POST /api/auth/forgot-password` (`server.ts:1234`), `POST /api/auth/reset-password` (`server.ts:1308`), `POST /api/auth/provision-admin` (`server.ts:1386`), `GET /api/auth/me` (`server.ts:1443`), `POST /api/auth/sandbox-persona` (`server.ts:1475`).
- **Reader Profile & Reviews**:
  - `POST /api/books/:id/reviews` (`server.ts:1686`), `PATCH /api/profile` (`server.ts:1766`), `POST /api/profile/change-password` (`server.ts:1810`), `POST /api/profile/addresses` (`server.ts:1872`), `DELETE /api/profile/addresses/:id` (`server.ts:1927`), `POST /api/profile/wishlist/:bookId` (`server.ts:1945`), `POST /api/profile/author-application` (`server.ts:1968`), `GET /api/profile/author-application` (`server.ts:2038`), `GET /api/my-orders` (`server.ts:2049`), `GET /api/my-manuscripts` (`server.ts:2063`).
- **Author Studio**:
  - `GET /api/author/studio` (`server.ts:2077`), `PATCH /api/author/profile` (`server.ts:2125`), `POST /api/author/articles` (`server.ts:2182`), `PATCH /api/author/articles/:id` (`server.ts:2257`), `POST /api/author/manuscripts/:id/resubmit` (`server.ts:2335`).
- **E-Commerce Cart, Orders & Submissions**:
  - `POST /api/cart/quote` (`server.ts:2890`), `POST /api/orders` (`server.ts:2903`), `POST /api/orders/:id/verify-payment` (`server.ts:3075`), `POST /api/orders/lookup` (`server.ts:3162`), `GET /api/orders/:id` (`server.ts:3212`), `POST /api/manuscripts` (`server.ts:3256`), `POST /api/contact` (`server.ts:3360`).
- **Admin Console & Editorial CMS**:
  - `GET /api/admin/overview` (`server.ts:2422`), `GET /api/admin/users` (`server.ts:2461`), `PATCH /api/admin/users/:id/status` (`server.ts:2471`), `PATCH /api/admin/users/:id/role` (`server.ts:2538`), `POST /api/admin/author-applications/:id/review` (`server.ts:2612`), `POST /api/admin/articles/:id/moderate` (`server.ts:2699`), `POST /api/admin/books` (`server.ts:2768`), `PATCH /api/admin/books/:id/stock` (`server.ts:2853`), `PATCH /api/admin/orders/:id/status` (`server.ts:3421`), `PATCH /api/admin/manuscripts/:id/status` (`server.ts:3525`), `PATCH /api/admin/inquiries/:id/status` (`server.ts:3594`), `GET /api/admin/cms/snapshot` (`server.ts:3637`), `PATCH /api/admin/books/:id` (`server.ts:3675`), `DELETE /api/admin/books/:id` (`server.ts:3805`), `POST /api/admin/books/:id/feature` (`server.ts:3862`), `POST /api/admin/authors` (`server.ts:3908`), `PATCH /api/admin/authors/:id` (`server.ts:3999`), `DELETE /api/admin/authors/:id` (`server.ts:4091`), `POST /api/admin/excerpts` (`server.ts:4135`), `PATCH /api/admin/excerpts/:id` (`server.ts:4210`), `DELETE /api/admin/excerpts/:id` (`server.ts:4266`), `POST /api/admin/articles` (`server.ts:4289`), `PATCH /api/admin/articles/:id` (`server.ts:4362`), `DELETE /api/admin/articles/:id` (`server.ts:4435`), `POST /api/admin/reading-lists` (`server.ts:4456`), `PATCH /api/admin/reading-lists/:id` (`server.ts:4499`), `DELETE /api/admin/reading-lists/:id` (`server.ts:4530`), `PATCH /api/admin/site-config` (`server.ts:4549`), `POST /api/admin/reviews/:id/moderate` (`server.ts:4575`), `POST /api/admin/promotions` (`server.ts:4599`), `PATCH /api/admin/promotions/:id` (`server.ts:4626`).

---

## 3. Detailed Security Findings (Phases 2–7)

### [SEC-01] Unauthenticated Payment Status Manipulation, Arbitrary Stock Depletion & Customer PII Disclosure
- **Severity**: **CRITICAL** (CVSS v3.1: 9.8)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A01:2021 Broken Access Control / A04:2021 Insecure Design / A08:2021 Software and Data Integrity Failures
- **Affected Component**:
  - `server.ts:3075-3159` (`POST /api/orders/:id/verify-payment`)
  - `server.ts:89` & `src/server/cmsStore.ts:25-41` (`verifyPaymentWebhookSignature` imported but never invoked)
  - `server.ts:3022` (`const orderSeq = 1043 + ordersStore.length;` — sequential predictable order numbers)
- **Evidence**:
  1. `POST /api/orders/:id/verify-payment` (`server.ts:3075`) has **no authentication check**, **no `guestAccessToken` ownership check**, **no rate limit**, and **no payment gateway HMAC signature verification**:
     ```ts
     // server.ts:3075-3081
     app.post('/api/orders/:id/verify-payment', (req, res) => {
       const orderId = req.params.id;
       const outcome = req.body?.outcome === 'failed' ? 'failed' : 'success';
       const paymentReference = sanitizeText(req.body?.paymentReference || '', 80);

       const order = ordersStore.find(
         (o) => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
       );
     ```
  2. Although `verifyPaymentWebhookSignature` is defined in `src/server/cmsStore.ts:25-41` and imported at `server.ts:89`, it is **never called anywhere in `server.ts`**.
  3. Order numbers follow a predictable sequence starting at `AK-2026-1043` (`server.ts:3022`).
  4. When called with `{"outcome": "success"}`, `server.ts:3114-3133` marks `order.paymentStatus = 'verified'`, `order.orderStatus = 'payment_verified'`, and decrements `book.stock` for every item in the order.
  5. At `server.ts:3158`, the endpoint returns `res.json({ order })` — exposing the full `OrderRecord` (including `customer.fullName`, `customer.phone`, `customer.email`, `customer.addressLine1`, `customer.postalCode`, and `guestAccessToken`) to any unauthenticated caller who guesses a sequential `orderNumber` (`AK-2026-1043`, `AK-2026-1044`, etc.).
- **Safe Verification Steps**:
  1. Inspect `server.ts:3075-3159` and confirm that neither `requireAuth`, `guestAccessToken`, nor `verifyPaymentWebhookSignature` is checked before mutating `order.paymentStatus` and returning `{ order }`.
- **Business Impact**:
  - **Free Merchandise / Payment Bypass**: Any buyer can mark their unpaid order as `verified` without paying.
  - **Inventory Denial of Service**: An attacker can place unpaid orders for all stock and immediately call `/verify-payment` to deplete `book.stock` to `0`.
  - **Mass Customer PII Leak (IDOR)**: Enumerating `AK-2026-1043` upward leaks every customer's full name, phone number, email, home address, and `guestAccessToken`.
- **Recommended Fix**:
  1. Separate webhook verification from client payment status polling: require a valid `X-Signature` HMAC verified via `verifyPaymentWebhookSignature(rawBody, signature, timestamp)` for gateway callbacks, **or** require admin authentication (`requirePermission('order:update_status')`) to manually verify offline/UPI payments.
  2. Never return the unredacted `order` object or `guestAccessToken` from a public endpoint without first validating ownership (`req.user.id === order.userId` or a matching `guestAccessToken`).
- **Retest / Verification Criteria**:
  - Calling `POST /api/orders/:id/verify-payment` without valid cryptographic webhook headers or admin credentials must return `401 Unauthorized` / `403 Forbidden`, leave `paymentStatus` unchanged, and return zero customer PII.

---

### [SEC-02] Unauthenticated One-Click Admin Privilege Escalation When `NODE_ENV` Is Not `'production'`
- **Severity**: **CRITICAL** (CVSS v3.1: 9.8 if deployed without `NODE_ENV=production`)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A01:2021 Broken Access Control / A05:2021 Security Misconfiguration / A07:2021 Identification and Authentication Failures
- **Affected Component**:
  - `server.ts:1475-1556` (`POST /api/auth/sandbox-persona`)
  - `package.json:9` (`"start": "node --import tsx server.ts"`)
  - `.env.example:6` (`NODE_ENV=development`)
- **Evidence**:
  1. `POST /api/auth/sandbox-persona` (`server.ts:1475-1556`) mints a live authenticated session for `'admin'`, `'author'`, or `'reader'` without requiring any password or token whenever `process.env.NODE_ENV !== 'production'`:
     ```ts
     // server.ts:1475-1482
     app.post('/api/auth/sandbox-persona', (req, res) => {
       if (process.env.NODE_ENV === 'production') {
         res.status(403).json({
           error: 'Production सँडबॉक्स मोड बंद आहे. कृपया अधिकृत लॉगिन वापरा.',
         });
         return;
       }
     ```
  2. In `package.json:9`, the production start script is `"start": "node --import tsx server.ts"` (which does **not** set `NODE_ENV=production`), and `.env.example:6` specifies `NODE_ENV=development`.
  3. Furthermore, at `server.ts:1529`, calling this endpoint forcibly resets `targetUser.accountStatus = 'active'`, bypassing any administrative suspension on the target persona account.
- **Safe Verification Steps**:
  1. Check `server.ts:1475-1556` and `package.json:9`.
  2. Observe that unless the hosting environment explicitly injects `NODE_ENV=production`, `POST /api/auth/sandbox-persona` with `{"persona": "admin"}` returns a full `admin` session (`usr-admin-seed`) with `sessionToken` and `Set-Cookie: akath_sid=<REDACTED>`.
- **Business Impact**:
  - Complete administrative takeover of the entire platform (CMS, orders, user roles, site config) by any anonymous user if deployed with default `.env.example` or `npm start` without explicit `NODE_ENV=production`.
- **Recommended Fix**:
  1. Gate `/api/auth/sandbox-persona` behind an explicit opt-in flag (`process.env.ENABLE_SANDBOX_PERSONA === 'true' && process.env.NODE_ENV !== 'production'`) that defaults to `false`.
  2. Set `NODE_ENV=production` explicitly in `package.json` `"start": "NODE_ENV=production node --import tsx server.ts"`.
- **Retest / Verification Criteria**:
  - By default, `POST /api/auth/sandbox-persona` must return `403 Forbidden` unless `ENABLE_SANDBOX_PERSONA=true` is explicitly enabled in a local test environment.

---

### [SEC-03] Raw Password Reset & Email Verification Token Leakage in Non-Production API Responses
- **Severity**: **HIGH** (CVSS v3.1: 8.6)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A07:2021 Identification and Authentication Failures / A04:2021 Insecure Design
- **Affected Component**:
  - `server.ts:1301-1304` (`POST /api/auth/forgot-password`)
  - `server.ts:931-932` (`POST /api/auth/register`)
  - `server.ts:1054-1055` (`POST /api/auth/resend-verification`)
- **Evidence**:
  1. In `POST /api/auth/forgot-password` (`server.ts:1301-1304`), any unauthenticated caller can pass the HTTP header `x-test-mode: true` when `process.env.NODE_ENV !== 'production'` and receive the raw password reset token (`resetTokenPreview`) directly in the JSON response for **any active user account** (including `admin.console@akath.in` and `gk.ainapure@akath.in`):
     ```ts
     // server.ts:1300-1305
     res.json({
       message: genericResponseMessage,
       ...(process.env.NODE_ENV !== 'production' && req.headers['x-test-mode'] === 'true' && devResetToken
         ? { resetTokenPreview: devResetToken }
         : {}),
     });
     ```
  2. In `POST /api/auth/register` (`server.ts:931-932`) and `POST /api/auth/resend-verification` (`server.ts:1054-1055`), `verificationTokenPreview` is returned unconditionally in the HTTP JSON body whenever `process.env.NODE_ENV !== 'production'`.
- **Safe Verification Steps**:
  1. Inspect `server.ts:1301-1304`.
  2. Note that `x-test-mode: true` is an unauthenticated client-controlled header; supplying it for an existing email leaks `resetTokenPreview` (and its presence/absence also acts as an account enumeration oracle for active accounts).
- **Business Impact**:
  - Instant account takeover of any admin, author, or reader account in staging/development or misconfigured production environments via `x-test-mode: true` followed by `POST /api/auth/reset-password`.
- **Recommended Fix**:
  1. Never return raw password reset or email verification tokens in HTTP responses, even in non-production environments or when `x-test-mode: true` is passed.
  2. If automated local test scripts require token inspection, authenticate the test harness with a secret server-side test token or read tokens from a local-only outbox file outside the web root.
- **Retest / Verification Criteria**:
  - `POST /api/auth/forgot-password` with `x-test-mode: true` must return the exact same JSON shape (`{ message }`) for existing and non-existing accounts and never include `resetTokenPreview`.

---

### [SEC-04] Raw Session Token Stored in `sessionStorage` + CSRF Protection Bypassed via Bearer Header
- **Severity**: **HIGH** (CVSS v3.1: 7.5)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A07:2021 Identification and Authentication Failures / A02:2021 Cryptographic & Session Management Failures
- **Affected Component**:
  - `src/views/AuthAndRoleViews.tsx:42-109` (`setAuthSessionTokens`, `getAuthSessionTokens`, `authFetch`)
  - `server.ts:927, 1192, 1550` (returning raw `sessionToken` in JSON responses)
  - `server.ts:440-483` (`extractSessionToken` and `req.authViaCookie`)
  - `server.ts:507-532` (`enforceCsrfProtection`)
- **Evidence**:
  1. Although `server.ts:391-394` sets an `HttpOnly` cookie (`akath_sid`), the backend also returns the raw `sessionToken` in the JSON payload on registration (`server.ts:927`), login (`server.ts:1192`), and persona switch (`server.ts:1550`).
  2. The frontend writes this raw `sessionToken` into `window.sessionStorage` under key `akath_session_token_v1` (`src/views/AuthAndRoleViews.tsx:56`):
     ```ts
     // src/views/AuthAndRoleViews.tsx:55-56
     if (sessionToken) {
       sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, sessionToken);
     }
     ```
     Storing the raw session token in `sessionStorage` defeats the primary security guarantee of `HttpOnly` cookies: any JavaScript execution in the origin can read `sessionStorage.getItem('akath_session_token_v1')` and exfiltrate the active session token.
  3. Furthermore, in `server.ts:481`, `req.authViaCookie` is set to:
     ```ts
     req.authViaCookie = Boolean(cookieToken && !bearerToken);
     ```
     And in `server.ts:509`:
     ```ts
     if (req.authViaCookie && mutatingMethods.includes(req.method)) {
     ```
     Because `authFetch` (`src/views/AuthAndRoleViews.tsx:102-104`) always attaches `Authorization: Bearer <sessionToken>`, `bearerToken` is truthy on every frontend request, causing `req.authViaCookie` to be `false` and **skipping CSRF validation** whenever Bearer auth is present.
- **Safe Verification Steps**:
  1. Inspect `src/views/AuthAndRoleViews.tsx:48-109` and `server.ts:481, 509`.
- **Business Impact**:
  - Exposes raw session tokens to DOM/Web Storage inspection (`DevTools -> Application -> Session Storage`) and any potential XSS vector.
- **Recommended Fix**:
  1. Rely on the `HttpOnly` cookie (`akath_sid`) for browser session persistence and only keep `csrfToken` in memory/state; or if an iframe fallback token is strictly needed when third-party cookies are blocked, keep it in closure memory only (`memorySessionToken`) rather than writing it to `sessionStorage`.
  2. Enforce CSRF validation whenever a valid session cookie is present on the request (`Boolean(cookieToken)`), or require `X-CSRF-Token` across all state-changing authenticated endpoints regardless of transport.
- **Retest / Verification Criteria**:
  - Inspecting `window.sessionStorage` and `window.localStorage` in browser DevTools after login must show **zero** raw session tokens.

---

### [SEC-05] Hardcoded Fallback Payment Webhook HMAC Secret & Unused Signature Verifier
- **Severity**: **HIGH** (CVSS v3.1: 7.5)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A02:2021 Cryptographic Failures / A05:2021 Security Misconfiguration
- **Affected Component**:
  - `src/server/cmsStore.ts:14-41` (`PAYMENT_WEBHOOK_SECRET`, `verifyPaymentWebhookSignature`)
  - `.env.example:15`
- **Evidence**:
  1. `src/server/cmsStore.ts:14-16` defines a hardcoded fallback HMAC secret in source code:
     ```ts
     export const PAYMENT_WEBHOOK_SECRET =
       process.env.PAYMENT_WEBHOOK_SECRET?.trim() || 'whsec_akath_[REDACTED_DEFAULT]';
     ```
  2. If `PAYMENT_WEBHOOK_SECRET` is not set in the production environment, the server silently uses the publicly known fallback string from the repository.
- **Safe Verification Steps**:
  1. View `src/server/cmsStore.ts:14-41` and `.env.example:15`.
- **Business Impact**:
  - Once webhook signature verification is wired up (remediating `SEC-01`), an attacker could forge valid `HMAC-SHA256` signatures using the hardcoded fallback secret if the environment variable is unset.
- **Recommended Fix**:
  1. Remove the hardcoded fallback string in production (`if (process.env.NODE_ENV === 'production' && !process.env.PAYMENT_WEBHOOK_SECRET) throw new Error(...)`) and generate an ephemeral `crypto.randomBytes(32).toString('hex')` fallback for local dev only.
- **Retest / Verification Criteria**:
  - No static fallback webhook secret exists in `src/server/cmsStore.ts` or `.env.example`.

---

### [SEC-06] Missing Rate Limiting & Non-Constant-Time Comparison on `/api/auth/provision-admin` + Unignored `.aistudio/` Directory
- **Severity**: **HIGH** (CVSS v3.1: 7.4)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A07:2021 Identification and Authentication Failures / A05:2021 Security Misconfiguration
- **Affected Component**:
  - `server.ts:1386-1407` (`POST /api/auth/provision-admin`)
  - `src/server/authStore.ts:134-165` (`.aistudio/server-bootstrap-token.txt`)
  - `src/server/cmsStore.ts:439-505` (`.aistudio/cms-state.json`)
  - `/.gitignore:1-9`
- **Evidence**:
  1. `POST /api/auth/provision-admin` (`server.ts:1386`) has **no `checkRateLimit` guard**, allowing unlimited brute-force attempts against `x-admin-bootstrap-token`.
  2. At `server.ts:1393`, the bootstrap token is compared using standard string inequality (`!==`) rather than `crypto.timingSafeEqual`:
     ```ts
     if (!providedToken || providedToken !== SERVER_ADMIN_BOOTSTRAP_TOKEN) {
     ```
  3. `src/server/authStore.ts:136` writes the raw bootstrap token to `.aistudio/server-bootstrap-token.txt` and `src/server/cmsStore.ts:441` writes CMS state to `.aistudio/cms-state.json`, but `/.gitignore` (`lines 1-9`) does **not** include `.aistudio/`!
- **Safe Verification Steps**:
  1. Inspect `server.ts:1386-1407`, `src/server/authStore.ts:134-165`, and `/.gitignore`.
- **Business Impact**:
  - Risk of accidentally committing `.aistudio/server-bootstrap-token.txt` or `.aistudio/cms-state.json` to Git version control, which would expose the admin bootstrap secret and allow anyone to create a new `admin` account via `POST /api/auth/provision-admin`.
- **Recommended Fix**:
  1. Add `.aistudio/` to `/.gitignore` immediately.
  2. Add strict rate limiting (`checkRateLimit(ip, 'provision-admin', 3, 60 * 60 * 1000)`) to `POST /api/auth/provision-admin`.
  3. Compare `providedToken` and `SERVER_ADMIN_BOOTSTRAP_TOKEN` using `crypto.timingSafeEqual` over SHA-256 digests of both strings.
- **Retest / Verification Criteria**:
  - `.aistudio/` is listed in `/.gitignore`, `POST /api/auth/provision-admin` enforces rate limiting (HTTP 429 on 4th attempt), and uses `crypto.timingSafeEqual`.

---

### [SEC-07] Missing Express `trust proxy` Configuration Causes Shared-IP Rate-Limit DoS Behind Reverse Proxies
- **Severity**: **MEDIUM** (CVSS v3.1: 6.5)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A05:2021 Security Misconfiguration
- **Affected Component**:
  - `server.ts:94-140` (`checkRateLimit`)
  - `server.ts:382-385` (`req.secure || req.headers['x-forwarded-proto'] === 'https'`)
  - `server.ts:1061-1068` (`POST /api/auth/login` IP rate limit)
- **Evidence**:
  1. `server.ts` never configures `app.set('trust proxy', 1)`.
  2. When deployed behind Cloud Run, Nginx, or a load balancer, `req.ip` resolves to the internal reverse proxy IP address rather than the client IP.
  3. Consequently, IP-keyed rate limits (`checkRateLimit(ip, 'login', 15, ...)` at `server.ts:1063`, `checkRateLimit(ip, 'register', 5, ...)` at `server.ts:822`, `checkRateLimit(ip, 'orders', 5, ...)` at `server.ts:2905`, `checkRateLimit(ip, 'order-lookup', 8, ...)` at `server.ts:3164`) put **all users into a single shared IP bucket**.
- **Safe Verification Steps**:
  1. Search `server.ts` for `trust proxy` (0 matches).
- **Business Impact**:
  - Any single user or bot making 5 order requests or 15 failed login requests within 15 minutes will lock out **all** legitimate visitors across the entire site with `429 Too Many Requests`.
- **Recommended Fix**:
  1. Configure `app.set('trust proxy', 1)` in `server.ts` so Express accurately resolves `req.ip` and `req.secure` from the trusted reverse proxy hop.
- **Retest / Verification Criteria**:
  - `app.set('trust proxy', 1)` is configured before middleware registration in `server.ts`.

---

### [SEC-08] Unbounded Percentage Discounts in Admin Promotion API & Public Coupon Usage Exposure
- **Severity**: **MEDIUM** (CVSS v3.1: 5.5)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A04:2021 Insecure Design / Business Logic Vulnerability
- **Affected Component**:
  - `server.ts:4599-4638` (`POST /api/admin/promotions`)
  - `server.ts:1584` (`GET /api/bootstrap`)
  - `server.ts:568-703` (`calculateServerCartQuote`)
- **Evidence**:
  1. In `POST /api/admin/promotions` (`server.ts:4606-4608`), `discountValue` has a lower bound of `1` but **no upper bound**:
     ```ts
     const discountType = req.body?.discountType === 'flat' ? 'flat' : 'percentage';
     const discountValue = Math.max(1, Math.floor(Number(req.body?.discountValue) || 10));
     ```
     An admin can accidentally or maliciously create a `percentage` promotion with `discountValue: 500` (500% off).
  2. `GET /api/bootstrap` (`server.ts:1584`) returns all active `PromotionRecord` objects (including secret coupon codes, `usedCount`, and `usageLimit`) to all unauthenticated visitors.
  3. Neither `calculateServerCartQuote` (`server.ts:568`) nor `POST /api/orders` (`server.ts:2903`) enforces `promo.expiresAt` or `promo.usageLimit`.
- **Safe Verification Steps**:
  1. Inspect `server.ts:4599-4624` and `server.ts:1584`.
- **Business Impact**:
  - Private promotional codes created by admins become immediately visible to anyone inspecting `GET /api/bootstrap` in the Network tab, and percentage discounts are not capped at `<= 100%`.
- **Recommended Fix**:
  1. Cap `percentage` discount values to `Math.min(90, Math.max(1, ...))` in `POST /api/admin/promotions`.
  2. Only expose public banner promotions in `GET /api/bootstrap` (strip internal `usedCount` / `usageLimit`), and validate promo codes server-side via `/api/cart/quote` and `/api/orders` against `active`, `expiresAt`, `minOrderSubtotal`, and `usageLimit`.
- **Retest / Verification Criteria**:
  - `POST /api/admin/promotions` rejects percentage discounts `> 90%` with `400 Bad Request`.

---

### [SEC-09] Stored XSS Risk via SVG Cover Upload Allowance & Unsanitized `siteConfig` Spread (`ctaLink`)
- **Severity**: **MEDIUM** (CVSS v3.1: 5.4)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A03:2021 Injection (Cross-Site Scripting) / A08:2021 Software and Data Integrity Failures
- **Affected Component**:
  - `src/auth/rbac.ts:297-303` (`ALLOWED_COVER_EXTENSIONS`, `ALLOWED_COVER_MIMES`)
  - `server.ts:4549-4568` (`PATCH /api/admin/site-config`)
- **Evidence**:
  1. `src/auth/rbac.ts:297-303` explicitly permits `.svg` (`image/svg+xml`) in `validateCoverUpload`:
     ```ts
     const ALLOWED_COVER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
     const ALLOWED_COVER_MIMES = [
       'image/jpeg',
       'image/png',
       'image/webp',
       'image/svg+xml',
     ];
     ```
     SVG files are XML documents capable of containing executable `<script>` and `onload` handlers if rendered directly or opened in a new browser tab.
  2. In `PATCH /api/admin/site-config` (`server.ts:4552-4557`), `req.body.hero` and `req.body.promoBanner` are merged directly into `siteConfig` via object spread without calling `sanitizeText()` or validating `ctaLink`:
     ```ts
     if (req.body?.hero && typeof req.body.hero === 'object') {
       current.hero = { ...current.hero, ...req.body.hero };
     }
     if (req.body?.promoBanner && typeof req.body.promoBanner === 'object') {
       current.promoBanner = { ...current.promoBanner, ...req.body.promoBanner };
     }
     ```
- **Safe Verification Steps**:
  1. Inspect `src/auth/rbac.ts:297-303` and `server.ts:4549-4568`.
- **Business Impact**:
  - Allows arbitrary unvalidated keys or `javascript:` URLs in `siteConfig.promoBanner.ctaLink` and raw SVG uploads.
- **Recommended Fix**:
  1. Remove `.svg` and `image/svg+xml` from `ALLOWED_COVER_EXTENSIONS` and `ALLOWED_COVER_MIMES` in `src/auth/rbac.ts` (restrict user/admin cover uploads to raster formats: `.jpg`, `.jpeg`, `.png`, `.webp`).
  2. Explicitly whitelist and sanitize every field of `hero` and `promoBanner` in `PATCH /api/admin/site-config` using `sanitizeText()` and `sanitizeRedirectPath()`.
- **Retest / Verification Criteria**:
  - Uploading a `.svg` cover returns `400 Bad Request`, and `PATCH /api/admin/site-config` strips HTML tags and non-relative URLs from `hero` and `promoBanner`.

---

### [SEC-10] Missing `Content-Security-Policy` / `HSTS` Security Headers & Logout Cookie Flag Mismatch
- **Severity**: **MEDIUM** (CVSS v3.1: 5.0)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A05:2021 Security Misconfiguration
- **Affected Component**:
  - `server.ts:102-107` (HTTP security headers middleware)
  - `server.ts:380-402` (`setSessionCookie` vs `clearSessionCookie`)
- **Evidence**:
  1. `server.ts:102-107` only sets `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`:
     ```ts
     app.use((_req, res, next) => {
       res.setHeader('X-Content-Type-Options', 'nosniff');
       res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
       next();
     });
     ```
     `Content-Security-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` (in production HTTPS) are missing.
  2. In `setSessionCookie` (`server.ts:380-395`), when running over HTTPS (`isSecureContext`), the cookie is set with `SameSite=None; Secure`. However, in `clearSessionCookie` (`server.ts:397-402`), the server hardcodes `SameSite=Lax; Max-Age=0` without `SameSite=None; Secure`:
     ```ts
     function clearSessionCookie(res: express.Response): void {
       res.setHeader(
         'Set-Cookie',
         `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
       );
     }
     ```
     Modern browsers require `SameSite=None; Secure` on a cookie-clearing `Set-Cookie` header if the cookie was originally set with `SameSite=None; Secure` in a third-party iframe context.
- **Safe Verification Steps**:
  1. Compare `setSessionCookie` (`server.ts:380-395`) and `clearSessionCookie` (`server.ts:397-402`).
- **Business Impact**:
  - Lack of defense-in-depth CSP header against script injection, and potential failure to clear the `akath_sid` cookie in cross-origin iframe contexts upon logout.
- **Recommended Fix**:
  1. Add `Content-Security-Policy`, `Permissions-Policy`, and conditional `Strict-Transport-Security` headers in `server.ts:102-107`.
  2. Pass `req` to `clearSessionCookie(req, res)` so it matches the exact `SameSite` and `Secure` attributes used in `setSessionCookie(req, res, ...)`.
- **Retest / Verification Criteria**:
  - Response headers on `GET /api/bootstrap` include `Content-Security-Policy` and `Permissions-Policy`, and `POST /api/auth/logout` over HTTPS sets `Max-Age=0` with matching `SameSite` and `Secure` flags.

---

### [SEC-11] Unbounded In-Memory Store Growth & Unthrottled Reaction/Analytics Endpoints
- **Severity**: **LOW** (CVSS v3.1: 3.7)
- **Confidence**: High (Confirmed in source code)
- **OWASP Category**: A04:2021 Insecure Design (Resource Consumption)
- **Affected Component**:
  - `server.ts:113-132` (`rateLimitStore`)
  - `server.ts:1657-1669` (`POST /api/excerpts/:id/react`)
  - `server.ts:4640-4650` (`POST /api/analytics/event`)
- **Evidence**:
  1. `POST /api/excerpts/:id/react` (`server.ts:1657`) and `POST /api/analytics/event` (`server.ts:4640`) have no rate limiting, allowing automated requests to inflate excerpt reaction counts indefinitely or flood `analyticsStore`.
  2. In `POST /api/analytics/event` (`server.ts:4644`), `req.body?.metadata` is stored directly without size/field sanitization.
  3. `rateLimitStore` (`server.ts:113`) never prunes expired keys unless the same IP+bucket key is accessed again.
- **Recommended Fix**:
  1. Add `checkRateLimit` to `/api/excerpts/:id/react` and `/api/analytics/event`, sanitize `metadata`, and periodically evict expired entries from `rateLimitStore`, `sessionsStore`, and `tokensStore`.

---

### [SEC-12] Missing `package-lock.json` Prevents Deterministic Dependency Resolution & `npm audit`
- **Severity**: **LOW** (CVSS v3.1: 3.1)
- **Confidence**: High (Confirmed via `npm audit --json`)
- **OWASP Category**: A06:2021 Vulnerable and Outdated Components / A08:2021 Software and Data Integrity Failures
- **Affected Component**:
  - `/package.json`
- **Evidence**:
  - Running `npm audit --json` reports `ENOLOCK: This command requires an existing lockfile`.
  - Unused packages (`better-sqlite3`, `googleapis`, `dotenv`) are declared in `package.json:15-17` without being used in the application.
- **Recommended Fix**:
  - Generate and commit `package-lock.json` (`npm i --package-lock-only`) and remove unused dependencies to minimize supply-chain attack surface.

---

## 4. Phase 2 — Browser Inspection & Sensitive Data Exposure Matrix

| Inspection Vector | Status | Evidence & Details |
| :--- | :--- | :--- |
| **Inspect Element / View Page Source (`index.html`)** | **PASS** | `index.html:1-31` contains only standard metadata, Google Fonts (`Noto Serif Devanagari`, `Tiro Devanagari Marathi`, `Plus Jakarta Sans`), and `/src/main.tsx`. Zero inline secrets or comments. |
| **JavaScript Bundles (`dist/assets/index-*.js`)** | **PASS** | Verified production bundle in `dist/assets/`. Contains only public UI code and public seed book/author catalog (`src/data/seedData.ts`). Zero private API keys, SMTP secrets, or user password hashes are bundled into client code. |
| **Source Maps (`.map`)** | **PASS** | Verified `dist/assets/` directory: `vite build` emits **no** `.js.map` or `.css.map` files in production. |
| **Network Requests & API Responses** | **WARN (`SEC-01`, `SEC-03`, `SEC-08`)** | `toPublicUser` (`src/server/authStore.ts:360-387`) properly strips `passwordHash`, `failedLoginAttempts`, and `lockoutUntil` from all user profiles; `GET /api/bootstrap` (`server.ts:1564-1567`) strips private author emails and phone numbers (`email: undefined, phone: undefined`). However, `POST /api/orders/:id/verify-payment` (`SEC-01`) leaks full order PII without auth, `POST /api/auth/forgot-password` (`SEC-03`) leaks `resetTokenPreview` with `x-test-mode: true` in non-prod, and `GET /api/bootstrap` (`SEC-08`) exposes active promotion records. |
| **Browser Console Logs** | **PASS** | No credentials, tokens, or PII are logged via `console.log` in client components. Server bootstrap notice in `server.ts:141-147` logs only the path `.aistudio/server-bootstrap-token.txt` without printing the secret value. |
| **Local Storage (`localStorage`)** | **PASS** | `localStorage` stores only non-sensitive preferences: `akath_cart_v1` (book IDs & quantities), `akath_bookmarks_v1`, `akath_theme_v1`, `akath_reader_prefs_v1`, `akath_lang` (`src/App.tsx:246-288`), and `akath_guest_order_tokens_v1` (guest order lookup tokens for orders placed on that browser, `src/App.tsx:290-303`). |
| **Session Storage (`sessionStorage`)** | **FAIL (`SEC-04`)** | `src/views/AuthAndRoleViews.tsx:56` stores the raw `sessionToken` (`akath_session_token_v1`) and `csrfToken` (`akath_csrf_token_v1`) in `window.sessionStorage`. |
| **Cookies (`document.cookie`)** | **PASS (with Logout caveat `SEC-10`)** | Session cookie `akath_sid` is set with `HttpOnly; Path=/` (`server.ts:391-394`), making it inaccessible to `document.cookie`. |
| **Git & Workspace Files** | **WARN (`SEC-06`)** | `.env*` and `dist/` are in `/.gitignore`, and no `.env` file is committed. However, `.aistudio/` (which contains `.aistudio/server-bootstrap-token.txt` and `.aistudio/cms-state.json`) is **not** in `/.gitignore`. |
| **Error Messages & Stack Traces** | **PASS** | Express routes return structured Marathi/English JSON error messages (`{ error: '...' }`) without exposing Node.js stack traces or file paths. |

---

## 5. Phase 4 — Role & Permission Matrix Audit (Direct API Level)

All 4 roles (`guest`, `reader`, `author`, `admin`) were audited at the direct HTTP endpoint layer (`server.ts` + `src/auth/rbac.ts`):

| Security Control / Test Case | Status | Code Evidence |
| :--- | :--- | :--- |
| **Reader cannot access `/api/admin/*` routes** | **PASS** | Every `/api/admin/*` route enforces `requirePermission('admin:access_dashboard' \| 'user:manage' \| 'book:create' \| ...)` (`server.ts:2422-4638`), returning `403 Forbidden` for `reader` and `author` roles. |
| **Reader cannot view or modify another user's orders** | **PASS (on `GET /api/orders/:id`) / FAIL (on `POST /api/orders/:id/verify-payment` — `SEC-01`)** | `GET /api/orders/:id` (`server.ts:3212-3252`) strictly verifies `order.userId === req.user.id` or `timingSafeEqual` on `guestAccessToken`, and strips `guestAccessToken` before returning. However, `POST /api/orders/:id/verify-payment` (`server.ts:3075`) lacks this check (`SEC-01`). |
| **Reader cannot access Author Studio (`/api/author/*`)** | **PASS** | `GET /api/author/studio`, `PATCH /api/author/profile`, `POST /api/author/articles`, `PATCH /api/author/articles/:id`, and `POST /api/author/manuscripts/:id/resubmit` (`server.ts:2077-2340`) all enforce `author:*` permissions and return `403 Forbidden` for `reader`. |
| **Author cannot edit another author's profile, articles, or manuscripts** | **PASS** | `PATCH /api/author/profile` (`server.ts:2129-2142`) binds strictly to `req.user.linkedAuthorId`. `PATCH /api/author/articles/:id` (`server.ts:2268-2279`) and `POST /api/author/manuscripts/:id/resubmit` (`server.ts:2349-2361`) call `canModifyAuthorOwnedResource`, blocking cross-author horizontal privilege escalation with `403 Forbidden` and logging a security audit event. |
| **Author cannot directly publish articles without Admin moderation** | **PASS** | In `POST /api/author/articles` (`server.ts:2195-2197`) and `PATCH /api/author/articles/:id` (`server.ts:2292-2299`), authors can only set status to `'draft'` or `'pending_review'`. Only admins via `POST /api/admin/articles/:id/moderate` (`server.ts:2699`) can set status to `'published'`. |
| **Admin cannot demote or suspend the last active Admin** | **PASS** | `PATCH /api/admin/users/:id/status` (`server.ts:2489-2505`) and `PATCH /api/admin/users/:id/role` (`server.ts:2559-2575`) prevent self-lockout and enforce a minimum of 1 active admin account. |
| **Role/Status changes immediately invalidate or update active sessions** | **PASS** | Suspending a user (`server.ts:2513`) calls `revokeAllUserSessions(targetUser.id)`. Changing a user's role (`server.ts:471-476`) dynamically syncs `session.role = user.role` on every request and revokes sessions if `accountStatus !== 'active'`. |

---

## 6. Phase 5 — E-Commerce Security Audit

| E-Commerce Test Vector | Status | Code Evidence |
| :--- | :--- | :--- |
| **Client-Side Price / Subtotal / Shipping Manipulation** | **PASS** | `calculateServerCartQuote` (`server.ts:568-703`) rejects any payload containing `price`, `unitPrice`, `subtotal`, `shipping`, `total`, `discount`, or `amount` (`hasPriceTamperAttempt`, logging `ORDER_PRICE_TAMPER_BLOCKED` at `server.ts:2923-2937`) and recalculates all prices exclusively from `booksStore`. |
| **Negative, Zero, Fractional, or Excessive Quantities** | **PASS** | `server.ts:593-610` rejects `!Number.isInteger(rawQty) || rawQty <= 0` and caps per-item quantity at `MAX_QUANTITY_PER_ITEM = 20` and `MAX_DISTINCT_CART_ITEMS = 25`. |
| **Out-of-Stock / Hidden Book Ordering** | **PASS** | `server.ts:619-646` blocks archived/draft books (`publishStatus !== 'published'`) and enforces `requestedQty <= book.stock`. |
| **Payment Verification & Webhook Integrity** | **FAIL (`SEC-01`, `SEC-05`)** | `POST /api/orders/:id/verify-payment` (`server.ts:3075`) is unauthenticated and does not call `verifyPaymentWebhookSignature`. |
| **Coupon / Promotion Validation** | **WARN (`SEC-08`)** | Admin promo creation allows `> 100%` percentage discounts (`server.ts:4607`), and `GET /api/bootstrap` exposes active promo records publicly (`server.ts:1584`). |
| **Guest Order Lookup Protection** | **PASS** | `POST /api/orders/lookup` (`server.ts:3162-3209`) is rate-limited (`8 req / 15 min`), normalizes and compares the 10-digit Indian phone number against the order's customer phone, and returns a redacted order summary (`server.ts:3192-3208`) without leaking `addressLine1` or `guestAccessToken`. |

---

## 7. Phase 6 — CMS, File Upload & Input Handling Security Audit

| CMS & File Security Vector | Status | Code Evidence |
| :--- | :--- | :--- |
| **Path Traversal in File Names & Slugs** | **PASS** | `validateManuscriptUpload` and `validateCoverUpload` (`src/auth/rbac.ts:251-330`) reject `..`, `/`, `\`, null bytes (`\0`), and multi-extension tricks (`.pdf.exe`). Slugs are sanitized via `normalizeSlug`. |
| **Manuscript File Type & Size Validation** | **PASS** | Restricted to `.pdf`, `.doc`, `.docx` and matching MIME types (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`) up to `25 MB` (`src/auth/rbac.ts:238-295`). Only metadata is stored in memory (`manuscriptsStore`), preventing remote code execution. |
| **Book Cover Upload Validation** | **WARN (`SEC-09`)** | `validateCoverUpload` (`src/auth/rbac.ts:297-303`) currently allows `.svg` / `image/svg+xml`. Should be restricted to raster images (`.jpg`, `.jpeg`, `.png`, `.webp`). |
| **XSS Prevention in Reviews, Articles, Books, Inquiries** | **PASS (with `siteConfig` caveat `SEC-09`)** | React escapes JSX text nodes by default, zero `dangerouslySetInnerHTML` calls exist across `src/`, and server endpoints strip `<...>` tags and `javascript:`/`data:` schemes via `sanitizeText` (`server.ts:149-160`). Only `PATCH /api/admin/site-config` (`server.ts:4549-4568`) bypasses `sanitizeText` via raw object spread. |

---

## 8. Prioritized Remediation Plan (Awaiting Approval)

Per the audit rules, **no existing application files have been modified**. Once you review and approve this plan, the fixes can be implemented and verified in the following priority order:

### Priority 1 — Immediate Critical Fixes (Blockers)
1. **Fix `SEC-01` (`server.ts:3075-3159`)**:
   - Require valid authentication/ownership (`req.user?.id === order.userId`, admin `order:update_status` permission, or valid `guestAccessToken` + cryptographic webhook signature via `verifyPaymentWebhookSignature`) on `POST /api/orders/:id/verify-payment`.
   - Rate-limit `/api/orders/:id/verify-payment` and never return unredacted customer PII or `guestAccessToken` to unverified callers.
2. **Fix `SEC-02` (`server.ts:1475-1556`, `package.json:9`)**:
   - Gate `POST /api/auth/sandbox-persona` behind an explicit opt-in environment variable (`process.env.ENABLE_SANDBOX_PERSONA === 'true' && process.env.NODE_ENV !== 'production'`), and do not forcibly re-activate suspended accounts.

### Priority 2 — High-Severity Authentication & Secret Hardening
3. **Fix `SEC-03` (`server.ts:931-932, 1054-1055, 1301-1304`)**:
   - Remove `resetTokenPreview` and `verificationTokenPreview` from public HTTP responses, or require a server-only internal test secret (`x-internal-test-secret` matching `SERVER_ADMIN_BOOTSTRAP_TOKEN`) so unauthenticated callers cannot extract reset tokens via `x-test-mode: true`.
4. **Fix `SEC-04` (`src/views/AuthAndRoleViews.tsx:48-109`, `server.ts:481, 509`)**:
   - Stop persisting raw `sessionToken` in `window.sessionStorage` (keep any iframe fallback token in module memory only), and enforce `X-CSRF-Token` validation on all mutating authenticated requests whenever a session cookie or CSRF token is present.
5. **Fix `SEC-05` & `SEC-06` (`src/server/cmsStore.ts:14-16`, `server.ts:1386-1407`, `/.gitignore`)**:
   - Replace the static fallback `PAYMENT_WEBHOOK_SECRET` with a runtime-generated secret when unset.
   - Add `.aistudio/` to `/.gitignore`.
   - Add rate limiting and `crypto.timingSafeEqual` to `POST /api/auth/provision-admin`.

### Priority 3 — Medium & Low Defense-in-Depth Hardening
6. **Fix `SEC-07` (`server.ts`)**: Add `app.set('trust proxy', 1)` so rate limiting uses accurate client IPs behind reverse proxies.
7. **Fix `SEC-08` (`server.ts:1584, 4599-4638`)**: Cap percentage discounts at `<= 90%`, enforce promo expiration/usage limits in `calculateServerCartQuote`, and redact internal promo usage counters from `GET /api/bootstrap`.
8. **Fix `SEC-09` (`src/auth/rbac.ts:297-303`, `server.ts:4549-4568`)**: Remove `.svg` / `image/svg+xml` from `validateCoverUpload` and sanitize all fields in `PATCH /api/admin/site-config`.
9. **Fix `SEC-10` & `SEC-11` (`server.ts:102-107, 397-402, 1657, 4640`)**: Add `Content-Security-Policy` and `Permissions-Policy` headers, align `clearSessionCookie` attributes with `setSessionCookie`, and add rate limiting + metadata sanitization to `/api/excerpts/:id/react` and `/api/analytics/event`.
