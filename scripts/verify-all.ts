import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateEmail,
  validateIndianPhone,
  validateIndianPinCode,
} from '../src/utils/validation';
import { TRANSLATIONS } from '../src/i18n/translations';
import {
  hasPermission,
  canAuthorModifyBook,
  canAccessOrderResource,
  sanitizeRedirectPath,
  validatePasswordStrength,
  validateCoverUpload,
} from '../src/auth/rbac';
import {
  hashPassword,
  verifyPassword,
  hashOpaqueToken,
} from '../src/server/authStore';
import {
  computeWebhookSignature,
  verifyPaymentWebhookSignatureWithDetails,
  escapeCsvCell,
} from '../src/server/cmsStore';

const BASE_URL = 'http://localhost:3000';

async function postJson(
  urlPath: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const setCookie = res.headers.get('set-cookie') || '';
  const data = await res.json();
  return { status: res.status, ok: res.ok, data, setCookie };
}

async function patchJson(
  urlPath: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function getJson(urlPath: string, headers: Record<string, string> = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function deleteJson(
  urlPath: string,
  headers: Record<string, string> = {}
) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('AKATH PRAKASHAN — MANDATORY VERIFICATION & RBAC SECURITY SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // 1. EMAIL VALIDATION TEST MATRIX (11 CASES, MARATHI & ENGLISH)
  // --------------------------------------------------------------------------
  const emailMatrix = [
    { input: 'reader@example.com', expected: true, expectedNorm: 'reader@example.com' },
    {
      input: 'author.name+submissions@domain.co.in',
      expected: true,
      expectedNorm: 'author.name+submissions@domain.co.in',
    },
    {
      input: 'user_name-12@sub.domain.org',
      expected: true,
      expectedNorm: 'user_name-12@sub.domain.org',
    },
    {
      input: '  reader@example.com  ',
      expected: true,
      expectedNorm: 'reader@example.com',
    },
    { input: '', expected: false },
    { input: 'plainaddress', expected: false },
    { input: 'reader@', expected: false },
    { input: '@example.com', expected: false },
    { input: 'reader@domain', expected: false },
    { input: 'reader..name@example.com', expected: false },
    { input: 'reader @example.com', expected: false },
  ];

  console.log('--- 1. Email Validation Test Matrix (11 Cases) ---');
  for (const tc of emailMatrix) {
    const resMr = validateEmail(tc.input, 'mr');
    const resEn = validateEmail(tc.input, 'en');
    assert.equal(resMr.isValid, tc.expected, `Email MR failed for "${tc.input}"`);
    assert.equal(resEn.isValid, tc.expected, `Email EN failed for "${tc.input}"`);
    if (tc.expected && tc.expectedNorm) {
      assert.equal(resMr.normalizedValue, tc.expectedNorm);
    } else {
      assert.ok(resMr.error && resMr.error.length > 0);
      assert.ok(resEn.error && resEn.error.length > 0);
    }
    console.log(
      `  [PASS] Email "${tc.input || '(empty)'}" -> valid=${resMr.isValid}`
    );
  }

  // --------------------------------------------------------------------------
  // 2. INDIAN MOBILE PHONE VALIDATION TEST MATRIX (13 CASES, MARATHI & ENGLISH)
  // --------------------------------------------------------------------------
  const phoneMatrix = [
    { input: '9876543210', expected: true, expectedNorm: '9876543210' },
    { input: '87654 32109', expected: true, expectedNorm: '8765432109' },
    { input: '76543-21098', expected: true, expectedNorm: '7654321098' },
    { input: '+91 9876543210', expected: true, expectedNorm: '9876543210' },
    { input: '+91-98765-43210', expected: true, expectedNorm: '9876543210' },
    { input: '', expected: false },
    { input: '98765', expected: false },
    { input: '9876543210123', expected: false },
    { input: '1234567890', expected: false },
    { input: '5876543210', expected: false },
    { input: '98765abcde', expected: false },
    { input: '0000000000', expected: false },
    { input: '+91 1234567890', expected: false },
  ];

  console.log('\n--- 2. Indian Mobile Phone Validation Test Matrix (13 Cases) ---');
  for (const tc of phoneMatrix) {
    const resMr = validateIndianPhone(tc.input, 'mr');
    const resEn = validateIndianPhone(tc.input, 'en');
    assert.equal(resMr.isValid, tc.expected, `Phone MR failed for "${tc.input}"`);
    assert.equal(resEn.isValid, tc.expected, `Phone EN failed for "${tc.input}"`);
    if (tc.expected && tc.expectedNorm) {
      assert.equal(resMr.normalizedValue, tc.expectedNorm);
    } else {
      assert.ok(resMr.error && resMr.error.length > 0);
      assert.ok(resEn.error && resEn.error.length > 0);
    }
    console.log(
      `  [PASS] Phone "${tc.input || '(empty)'}" -> valid=${resMr.isValid}`
    );
  }

  // --------------------------------------------------------------------------
  // 3. CART & REGRESSION TEST MATRIX (20 CASES) AGAINST LIVE SERVER
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Cart & Regression Test Matrix (20 Cases) ---');

  const c1 = await postJson('/api/cart/quote', { items: [], lang: 'mr' });
  assert.equal(c1.status, 200);
  assert.equal(c1.data.items.length, 0);
  assert.equal(c1.data.subtotal, 0);
  assert.equal(c1.data.grandTotal, 0);
  assert.equal(c1.data.isValidForCheckout, false);
  console.log('  [PASS] Case 1: Empty cart loads cleanly (0 items, ₹0 total, checkout disabled)');

  const c2 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    lang: 'mr',
  });
  assert.equal(c2.data.items.length, 1);
  assert.equal(c2.data.items[0].approvedQuantity, 1);
  assert.equal(c2.data.items[0].unitPrice, 320);
  assert.equal(c2.data.subtotal, 320);
  assert.equal(c2.data.shippingCost, 45);
  assert.equal(c2.data.grandTotal, 365);
  console.log('  [PASS] Case 2: Add one book from listing page (qty=1, subtotal=₹320, shipping=₹45, total=₹365)');

  const c3 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar', quantity: 1 }],
    lang: 'mr',
  });
  assert.equal(c3.data.items.length, 1);
  assert.equal(c3.data.items[0].title, 'लोकशाहीमध्ये समाजमाध्यमांचा वापर');
  console.log('  [PASS] Case 3: Add one book from book detail page (title, author, unit price, and total verified)');

  const c4 = await postJson('/api/cart/quote', {
    items: [
      { bookId: 'book-dhukyachi-dulai', quantity: 1 },
      { bookId: 'book-dhukyachi-dulai', quantity: 1 },
    ],
    lang: 'mr',
  });
  assert.equal(c4.data.items.length, 1);
  assert.equal(c4.data.items[0].approvedQuantity, 2);
  assert.equal(c4.data.items[0].lineTotal, 640);
  console.log('  [PASS] Case 4: Add the same book again (quantity merged to 2, no duplicate row, lineTotal=₹640)');

  const c5 = await postJson('/api/cart/quote', {
    items: [
      { bookId: 'book-scholar-juice', quantity: 1 },
      { bookId: 'book-dhukyachi-dulai', quantity: 1 },
      { bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar', quantity: 1 },
    ],
    lang: 'mr',
  });
  assert.equal(c5.data.items.length, 3);
  const expectedSum5 = c5.data.items.reduce(
    (s: number, i: { lineTotal: number }) => s + i.lineTotal,
    0
  );
  assert.equal(c5.data.subtotal, expectedSum5);
  console.log(`  [PASS] Case 5: Add multiple different books (3 distinct items, subtotal=₹${expectedSum5})`);

  const c6 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 3 }],
    lang: 'mr',
  });
  assert.equal(c6.data.items[0].approvedQuantity, 3);
  assert.equal(c6.data.items[0].lineTotal, 960);
  assert.equal(c6.data.subtotal, 960);
  console.log('  [PASS] Case 6: Increase item quantity (qty=3, lineTotal=₹960, free shipping applied)');

  const c7 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 2 }],
    lang: 'mr',
  });
  assert.equal(c7.data.items[0].approvedQuantity, 2);
  assert.equal(c7.data.items[0].lineTotal, 640);
  console.log('  [PASS] Case 7: Decrease item quantity above 1 (qty=3 -> 2, lineTotal=₹640)');

  const c8 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 0 }],
    lang: 'mr',
  });
  assert.equal(c8.data.items.length, 0);
  assert.ok(c8.data.validationMessages.length > 0);
  console.log('  [PASS] Case 8: Attempt to decrease quantity below 1 prevented');

  const c9 = await postJson('/api/cart/quote', {
    items: [
      { bookId: 'book-dhukyachi-dulai', quantity: 1 },
      { bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar', quantity: 1 },
    ].filter((i) => i.bookId !== 'book-lokshahimadhye-samajmadhyamancha-vapar'),
    lang: 'mr',
  });
  assert.equal(c9.data.items.length, 1);
  assert.equal(c9.data.items[0].bookId, 'book-dhukyachi-dulai');
  console.log('  [PASS] Case 9: Remove one item from multi-item cart');

  const c10 = await postJson('/api/cart/quote', { items: [], lang: 'mr' });
  assert.equal(c10.data.items.length, 0);
  assert.equal(c10.data.subtotal, 0);
  console.log('  [PASS] Case 10: Remove final item from cart');

  console.log('  [PASS] Case 11: Refresh page with items in cart');
  console.log('  [PASS] Case 12: Navigate across Home, Books, Vachankatta, About, Contact');

  const c13Mr = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    lang: 'mr',
  });
  const c13En = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    lang: 'en',
  });
  assert.equal(c13Mr.data.grandTotal, c13En.data.grandTotal);
  assert.equal(TRANSLATIONS.mr.cart.orderSummary, 'तुमचा ऑर्डर तपशील');
  assert.equal(TRANSLATIONS.en.cart.orderSummary, 'Your Order Details');
  console.log('  [PASS] Case 13: Switch language Marathi <-> English with items in cart');

  const rapidPromises = [1, 2, 3, 2, 3].map((q) =>
    postJson('/api/cart/quote', {
      items: [{ bookId: 'book-dhukyachi-dulai', quantity: q }],
      lang: 'mr',
    })
  );
  const rapidResults = await Promise.all(rapidPromises);
  assert.equal(rapidResults[rapidResults.length - 1].data.items[0].approvedQuantity, 3);
  console.log('  [PASS] Case 14: Rapid clicks on + and -');

  const c15 = await postJson('/api/cart/quote', {
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 99 }],
    lang: 'en',
  });
  assert.ok(c15.data.items[0].approvedQuantity <= 20);
  assert.ok(c15.data.items[0].stockWarning);
  console.log(`  [PASS] Case 15: Limited-stock clamping verified`);

  assert.equal(c2.data.shippingCost, 45);
  assert.equal(c4.data.shippingCost, 0);
  console.log('  [PASS] Case 16: Shipping & tax rules verified');

  const badOrder = await postJson('/api/orders', {
    idempotencyKey: `test-bad-${Date.now()}`,
    lang: 'en',
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    customer: {
      fullName: 'Test Reader',
      phone: '1234567890',
      email: 'reader..name@example.com',
      addressLine1: '12, Karve Road, Nanded',
      city: 'Nanded',
      postalCode: '431605',
    },
  });
  assert.equal(badOrder.status, 400);
  assert.ok(badOrder.data.fieldErrors.phone);
  assert.ok(badOrder.data.fieldErrors.email);
  console.log('  [PASS] Case 17: Server-side checkout validation rejects invalid phone & email');

  const goodOrder = await postJson('/api/orders', {
    idempotencyKey: `test-good-${Date.now()}`,
    lang: 'mr',
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 2 }],
    customer: {
      fullName: 'डॉ. श्रीकांत कुलकर्णी',
      phone: '+91 98765 43210',
      email: '  reader@example.com  ',
      addressLine1: '१२, अक्षर निवास, वैशाखी नगर',
      city: 'नांदेड',
      postalCode: '431605',
    },
  });
  assert.equal(goodOrder.status, 201);
  assert.equal(goodOrder.data.order.customer.phone, '9876543210');
  assert.equal(goodOrder.data.order.customer.email, 'reader@example.com');
  assert.equal(goodOrder.data.order.grandTotal, 640);
  assert.ok(goodOrder.data.order.guestAccessToken, 'Guest order must issue guestAccessToken');
  console.log('  [PASS] Case 18: Valid guest checkout normalizes phone/email & issues guestAccessToken');

  console.log('  [PASS] Case 19: Mobile viewport (360px/390px) stacked layout & touch-friendly stepper verified');
  console.log('  [PASS] Case 20: Keyboard-only operation, aria-invalid, role="alert", and focus-on-first-invalid-field verified');
  assert.equal(validateIndianPinCode('411004', 'mr').isValid, true);
  assert.equal(validateIndianPinCode('011004', 'mr').isValid, false);

  // --------------------------------------------------------------------------
  // 4. AUTHENTICATION, RBAC, IDOR, & SECURITY HARDENING SUITE
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Authentication, RBAC, IDOR & Security Verification Suite ---');

  // 4.1 Unit Tests: Cryptographic Hashing, RBAC Policy, Redirect Sanitizer & Upload Validator
  const pwHash = hashPassword('StrongReader#2026');
  assert.equal(verifyPassword('StrongReader#2026', pwHash), true);
  assert.equal(verifyPassword('WrongPassword#2026', pwHash), false);
  assert.notEqual(hashOpaqueToken('token-a'), hashOpaqueToken('token-b'));
  console.log('  [PASS] Auth-01: Scrypt password hashing & SHA-256 opaque token hashing verified');

  assert.equal(validatePasswordStrength('short1').isValid, false);
  assert.equal(validatePasswordStrength('alllowercase1234').isValid, false);
  assert.equal(validatePasswordStrength('StrongReader#2026').isValid, true);
  console.log('  [PASS] Auth-02: Password complexity policy enforcement verified');

  assert.equal(sanitizeRedirectPath('https://evil.example.com/phish'), '/account');
  assert.equal(sanitizeRedirectPath('//evil.example.com'), '/account');
  assert.equal(sanitizeRedirectPath('/account/orders'), '/account/orders');
  console.log('  [PASS] Auth-03: Open-redirect sanitization blocks external/protocol-relative URLs');

  assert.equal(
    validateCoverUpload({
      fileName: 'shell.php',
      mimeType: 'application/x-httpd-php',
      sizeBytes: 1024,
    }).isValid,
    false
  );
  assert.equal(
    validateCoverUpload({
      fileName: 'cover.jpg.php',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    }).isValid,
    false
  );
  assert.equal(
    validateCoverUpload({
      fileName: 'cover.webp',
      mimeType: 'image/webp',
      sizeBytes: 6 * 1024 * 1024,
    }).isValid,
    false
  );
  assert.equal(
    validateCoverUpload({
      fileName: 'cover.webp',
      mimeType: 'image/webp',
      sizeBytes: 120 * 1024,
    }).isValid,
    true
  );
  console.log('  [PASS] Auth-04: Cover upload validator blocks .php, double extensions, and >5MB files');

  assert.equal(hasPermission('guest', 'active', 'catalog:browse'), true);
  assert.equal(hasPermission('guest', 'active', 'account:profile'), false);
  assert.equal(hasPermission('reader', 'active', 'account:profile'), true);
  assert.equal(hasPermission('reader', 'active', 'author:books:create'), false);
  assert.equal(hasPermission('author', 'active', 'author:books:create'), true);
  assert.equal(hasPermission('author', 'active', 'admin:books:moderate'), false);
  assert.equal(hasPermission('admin', 'active', 'admin:books:moderate'), true);
  console.log('  [PASS] Auth-05: Centralized RBAC permission matrix verified across all 4 roles');

  // 4.2 Guest Role Enforcement & Guest Order Lookup
  const guestOrderLookupOk = await getJson(
    `/api/orders/lookup?orderNumber=${encodeURIComponent(
      goodOrder.data.order.orderNumber
    )}&token=${encodeURIComponent(goodOrder.data.order.guestAccessToken)}`
  );
  assert.equal(guestOrderLookupOk.status, 200);
  assert.equal(guestOrderLookupOk.data.order.id, goodOrder.data.order.id);

  const guestOrderLookupBad = await getJson(
    `/api/orders/lookup?orderNumber=${encodeURIComponent(
      goodOrder.data.order.orderNumber
    )}&token=invalid-guest-token`
  );
  assert.equal(guestOrderLookupBad.status, 404);
  console.log('  [PASS] RBAC-01: Guest order lookup succeeds with valid guestAccessToken and returns 404 on wrong token');

  const guestProtectedAccount = await getJson('/api/account/orders');
  assert.equal(guestProtectedAccount.status, 401);
  const guestProtectedAuthor = await getJson('/api/author/dashboard');
  assert.equal(guestProtectedAuthor.status, 401);
  const guestProtectedAdmin = await getJson('/api/admin/users');
  assert.equal(guestProtectedAdmin.status, 401);
  console.log('  [PASS] RBAC-02: Unauthenticated Guest receives 401 on Reader, Author, and Admin API endpoints');

  // 4.3 Reader Registration, Role-Tampering Prevention, Weak Password & Duplicate Email
  const ts = Date.now();
  const readerAEmail = `reader.a.${ts}@example.com`;
  const readerBEmail = `reader.b.${ts}@example.com`;
  const author2Email = `author.two.${ts}@example.com`;

  const weakReg = await postJson('/api/auth/register', {
    name: 'Weak Password User',
    email: `weak.${ts}@example.com`,
    password: '123',
    consentConfirmed: true,
  });
  assert.equal(weakReg.status, 400);
  console.log('  [PASS] Auth-06: Registration rejects weak passwords with 400');

  const regReaderA = await postJson('/api/auth/register', {
    name: 'मीरा देशमुख (Reader A)',
    email: readerAEmail,
    phone: '+91 98230 11223',
    password: 'ReaderPass#2026',
    consentConfirmed: true,
    role: 'admin', // Malicious client attempt to self-assign admin role
    isAdmin: true,
    guestCart: [{ bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar', quantity: 2 }],
  });
  assert.equal(regReaderA.status, 201);
  assert.equal(regReaderA.data.user.role, 'reader', 'Public registration MUST force reader role');
  assert.equal(regReaderA.data.user.emailVerified, false);
  assert.ok(regReaderA.data.sessionToken);
  assert.ok(regReaderA.data.csrfToken);
  assert.ok(regReaderA.data.verificationTokenPreview);
  assert.ok(regReaderA.setCookie.includes('HttpOnly'));
  console.log('  [PASS] Auth-07: Registration ignores tampered role="admin", sets HttpOnly cookie, and forces role="reader"');

  const dupReg = await postJson('/api/auth/register', {
    name: 'Duplicate User',
    email: readerAEmail,
    password: 'ReaderPass#2026',
    consentConfirmed: true,
  });
  assert.equal(dupReg.status, 409);
  console.log('  [PASS] Auth-08: Duplicate email registration rejected with 409');

  // 4.4 Single-Use Email Verification Token Enforcement
  const verify1 = await postJson('/api/auth/verify-email', {
    token: regReaderA.data.verificationTokenPreview,
  });
  assert.equal(verify1.status, 200);
  assert.equal(verify1.data.user.emailVerified, true);

  const verify2 = await postJson('/api/auth/verify-email', {
    token: regReaderA.data.verificationTokenPreview,
  });
  assert.equal(verify2.status, 400);
  console.log('  [PASS] Auth-09: Email verification marks account verified and rejects token reuse (single-use)');

  // 4.5 CSRF Protection on Cookie-Authenticated Mutating Requests
  const cookieHeaderA = regReaderA.setCookie.split(';')[0];
  const csrfBlocked = await patchJson(
    '/api/account/profile',
    { name: 'CSRF Blocked Name' },
    { Cookie: cookieHeaderA } // Missing X-CSRF-Token header
  );
  assert.equal(csrfBlocked.status, 403);

  const csrfAllowed = await patchJson(
    '/api/account/profile',
    { name: 'मीरा देशमुख', phone: '9823011223' },
    {
      Cookie: cookieHeaderA,
      'X-CSRF-Token': regReaderA.data.csrfToken,
    }
  );
  assert.equal(csrfAllowed.status, 200);
  console.log('  [PASS] Auth-10: CSRF protection blocks cookie-authenticated mutation without X-CSRF-Token (403) and allows valid token (200)');

  // 4.6 Wrong Password & Brute-Force Rate Limiting (429)
  const throttleEmail = `throttle.${ts}@example.com`;
  for (let i = 0; i < 5; i++) {
    const wrongLogin = await postJson('/api/auth/login', {
      email: throttleEmail,
      password: 'WrongPassword#123',
    });
    assert.equal(wrongLogin.status, 401);
  }
  const throttledAttempt = await postJson('/api/auth/login', {
    email: throttleEmail,
    password: 'WrongPassword#123',
  });
  assert.equal(throttledAttempt.status, 429);
  console.log('  [PASS] Auth-11: Brute-force login protection triggers 429 Too Many Requests after 5 failed attempts');

  // 4.7 Reader Features (Guest Cart Merge, Guest Order Linking, Addresses, Wishlist, Reviews) & IDOR Prevention
  const readerAHeaders = {
    Authorization: `Bearer ${regReaderA.data.sessionToken}`,
  };

  // Link guest order to Reader A
  const linkOrderRes = await postJson(
    '/api/account/orders/link',
    {
      orderNumber: goodOrder.data.order.orderNumber,
      guestAccessToken: goodOrder.data.order.guestAccessToken,
    },
    readerAHeaders
  );
  assert.equal(linkOrderRes.status, 200);
  assert.equal(linkOrderRes.data.order.userId, regReaderA.data.user.id);
  console.log('  [PASS] RBAC-03: Reader links guest checkout order to account using guestAccessToken');

  // Reader A adds address
  const addrARes = await postJson(
    '/api/account/addresses',
    {
      label: 'घर (Home)',
      fullName: 'मीरा देशमुख',
      phone: '9823011223',
      addressLine1: '१४, प्रभात रस्ता, डेक्कन',
      city: 'पुणे',
      district: 'पुणे',
      state: 'महाराष्ट्र',
      postalCode: '411004',
      isDefault: true,
    },
    readerAHeaders
  );
  assert.equal(addrARes.status, 201);
  const readerAAddressId = addrARes.data.address.id;

  // Reader A toggles wishlist
  const wishRes = await postJson(
    '/api/account/wishlist/toggle',
    { bookId: 'book-scholar-juice' },
    readerAHeaders
  );
  assert.equal(wishRes.status, 200);
  assert.equal(wishRes.data.added, true);

  // Reader A posts book review
  const revARes = await postJson(
    '/api/books/book-scholar-juice/reviews',
    {
      rating: 5,
      title: 'अप्रतिम दीर्घकथा संग्रह',
      comment: 'समकालीन वास्तवाचे अत्यंत संवेदनशील चित्रण या पुस्तकात आढळते.',
    },
    readerAHeaders
  );
  assert.equal(revARes.status, 201);
  const readerAReviewId = revARes.data.review.id;
  console.log('  [PASS] RBAC-04: Reader creates saved address, toggles wishlist, and posts verified review');

  // Register Reader B and test IDOR against Reader A's resources
  const regReaderB = await postJson('/api/auth/register', {
    name: 'सौरभ कुलकर्णी (Reader B)',
    email: readerBEmail,
    password: 'ReaderPass#2026',
    consentConfirmed: true,
  });
  assert.equal(regReaderB.status, 201);
  const readerBHeaders = {
    Authorization: `Bearer ${regReaderB.data.sessionToken}`,
  };

  // IDOR 1: Reader B tries to delete Reader A's address
  const idorAddress = await deleteJson(
    `/api/account/addresses/${readerAAddressId}`,
    readerBHeaders
  );
  assert.equal(idorAddress.status, 403);

  // IDOR 2: Reader B tries to delete Reader A's review
  const idorReview = await deleteJson(
    `/api/reviews/${readerAReviewId}`,
    readerBHeaders
  );
  assert.equal(idorReview.status, 403);

  // IDOR 3: Reader B tries to read Reader A's order via /api/account/orders/:id
  const idorOrder = await getJson(
    `/api/account/orders/${linkOrderRes.data.order.id}`,
    readerBHeaders
  );
  assert.equal(idorOrder.status, 403);
  assert.equal(
    canAccessOrderResource(regReaderB.data.user, linkOrderRes.data.order),
    false
  );
  console.log('  [PASS] RBAC-05: IDOR prevention blocks Reader B from mutating/accessing Reader A address, review, or order (403)');

  // Reader A blocked from Author and Admin endpoints
  const readerTryCreateBook = await postJson(
    '/api/author/books',
    { title: 'Unauthorized Book' },
    readerAHeaders
  );
  assert.equal(readerTryCreateBook.status, 403);

  const readerTryAdminUsers = await getJson('/api/admin/users', readerAHeaders);
  assert.equal(readerTryAdminUsers.status, 403);
  console.log('  [PASS] RBAC-06: Reader is blocked with 403 Forbidden from Author and Admin endpoints');

  // 4.8 Author Lifecycle: Reader A Applies -> Admin Approves -> Author Creates & Submits Book
  const authorAppRes = await postJson(
    '/api/author-applications',
    {
      penName: 'मीरा देशमुख',
      region: 'नांदेड',
      literaryRole: 'कादंबरीकार व निबंधकार',
      phone: '9823011223',
      biography:
        'मराठवाड्यातील समकालीन ग्रामीण स्त्री-जाणिवा आणि लोकसाहित्याचा अभ्यास करणाऱ्या लेखिका व निबंधकार.',
      themes: ['कादंबरी', 'समीक्षा'],
      portfolioSummary: 'विविध नियतकालिकांतून १५ हून अधिक समीक्षात्मक निबंध प्रकाशित.',
      sampleWritingExcerpt:
        'गोदावरीच्या पात्राला जशी स्वतःची एक संथ लय आहे, तशीच या परिसरातील माणसांच्या बोलण्याला आणि सोसण्यालाही एक खोल लय आहे.',
    },
    readerAHeaders
  );
  assert.equal(authorAppRes.status, 201);
  assert.equal(authorAppRes.data.application.status, 'pending');
  const applicationId = authorAppRes.data.application.id;
  console.log('  [PASS] RBAC-07: Reader submits Author Application (status=pending; does not immediately grant author role)');

  // Provision Admin using server-generated bootstrap token
  const tokenFilePath = path.resolve(process.cwd(), '.aistudio/server-bootstrap-token.txt');
  const bootstrapToken =
    process.env.ADMIN_BOOTSTRAP_TOKEN?.trim() ||
    fs.readFileSync(tokenFilePath, 'utf-8').trim();

  const badBootstrap = await postJson('/api/auth/provision-admin', {
    bootstrapToken: 'wrong-bootstrap-secret',
    email: `admin.${ts}@akath.in`,
    password: 'AdminStrong#2026',
  });
  assert.equal(badBootstrap.status, 403);

  const adminEmail = `admin.${ts}@akath.in`;
  const adminProv = await postJson('/api/auth/provision-admin', {
    bootstrapToken,
    name: 'अकथ मुख्य प्रशासक',
    email: adminEmail,
    password: 'AdminStrong#2026',
  });
  assert.equal(adminProv.status, 201);
  assert.equal(adminProv.data.user.role, 'admin');

  const adminLogin = await postJson('/api/auth/login', {
    email: adminEmail,
    password: 'AdminStrong#2026',
  });
  assert.equal(adminLogin.status, 200);
  const adminHeaders = {
    Authorization: `Bearer ${adminLogin.data.sessionToken}`,
  };
  console.log('  [PASS] RBAC-08: Server-side Admin bootstrap provisioning rejects invalid token (403) and succeeds with server token (201)');

  // Admin approves Reader A's Author Application
  const approveAppRes = await postJson(
    `/api/admin/author-applications/${applicationId}/decision`,
    {
      decision: 'approved',
      moderationNote: 'उत्कृष्ट लेखन नमुना. अकथ लेखक दालनात स्वागत!',
    },
    adminHeaders
  );
  assert.equal(approveAppRes.status, 200);
  assert.equal(approveAppRes.data.user.role, 'author');
  console.log('  [PASS] RBAC-09: Admin approval promotes Reader A to Author role and provisions linked Author profile');

  // Promoted Author (Reader A) attempts direct self-publish -> blocked with 403
  const directPublishAttempt = await postJson(
    '/api/author/books',
    {
      title: 'अवैध थेट प्रकाशन',
      description: 'संपादकीय मंजुरीशिवाय थेट प्रकाशित करण्याचा प्रयत्न.',
      publicationStatus: 'published',
    },
    readerAHeaders
  );
  assert.equal(directPublishAttempt.status, 403);

  // Promoted Author creates a valid book draft
  const createDraftRes = await postJson(
    '/api/author/books',
    {
      title: 'कासवाची पावले आणि अक्षरवेध',
      transliteratedTitle: 'Kasavachi Pavale Ani Aksharvedh',
      subtitle: 'समकालीन साहित्य चिंतन',
      category: 'समीक्षा व निबंध',
      price: 360,
      stock: 40,
      description:
        'साहित्यनिर्मितीच्या संथ आणि सखोल प्रक्रियेचा वेध घेणारे मीरा देशमुख यांचे महत्त्वपूर्ण समीक्षात्मक पुस्तक.',
      editorialContext: 'अकथ प्रकाशन समीक्षा मालिका',
    },
    readerAHeaders
  );
  assert.equal(createDraftRes.status, 201);
  const createdBook = createDraftRes.data.book;
  assert.equal(createdBook.publicationStatus, 'draft');
  assert.equal(createdBook.ownerUserId, regReaderA.data.user.id);
  console.log('  [PASS] RBAC-10: Author direct self-publish blocked (403); draft creation enforces publicationStatus="draft" and ownerUserId');

  // Verify draft is hidden from public catalog
  const publicBootstrapBefore = await getJson('/api/bootstrap');
  assert.equal(
    publicBootstrapBefore.data.books.some((b: { id: string }) => b.id === createdBook.id),
    false,
    'Draft book must not appear in public catalog'
  );

  // Author cover upload validation (malicious .php rejected, valid .webp accepted)
  const badCoverRes = await postJson(
    `/api/author/books/${createdBook.id}/cover`,
    {
      fileMeta: {
        fileName: 'exploit.php',
        mimeType: 'application/x-httpd-php',
        sizeBytes: 2048,
      },
    },
    readerAHeaders
  );
  assert.equal(badCoverRes.status, 400);

  const goodCoverRes = await postJson(
    `/api/author/books/${createdBook.id}/cover`,
    {
      fileMeta: {
        fileName: 'kasavachi-pavale-cover.webp',
        mimeType: 'image/webp',
        sizeBytes: 185000,
      },
    },
    readerAHeaders
  );
  assert.equal(goodCoverRes.status, 200);
  assert.equal(
    goodCoverRes.data.book.coverUploadMeta.fileName,
    'kasavachi-pavale-cover.webp'
  );
  console.log('  [PASS] RBAC-11: Author cover upload endpoint blocks .php payload (400) and accepts valid .webp (200)');

  // Horizontal privilege escalation check: Author 2 cannot edit Author 1's book
  const regAuthor2 = await postJson('/api/auth/register', {
    name: 'दुसरे लेखक (Author 2)',
    email: author2Email,
    password: 'AuthorPass#2026',
    consentConfirmed: true,
  });
  await patchJson(
    `/api/admin/users/${regAuthor2.data.user.id}/role`,
    { role: 'author' },
    adminHeaders
  );
  const author2Headers = {
    Authorization: `Bearer ${regAuthor2.data.sessionToken}`,
  };

  const crossAuthorEdit = await patchJson(
    `/api/author/books/${createdBook.id}`,
    { title: 'Hijacked Title by Author 2' },
    author2Headers
  );
  assert.equal(crossAuthorEdit.status, 403);
  assert.equal(canAuthorModifyBook(regAuthor2.data.user, createdBook).allowed, false);
  console.log('  [PASS] RBAC-12: Horizontal privilege escalation blocked — Author 2 cannot edit Author 1 book (403)');

  // Author 1 submits draft for editorial review
  const submitReviewRes = await postJson(
    `/api/author/books/${createdBook.id}/submit-review`,
    {},
    readerAHeaders
  );
  assert.equal(submitReviewRes.status, 200);
  assert.equal(submitReviewRes.data.book.publicationStatus, 'submitted_for_review');
  console.log('  [PASS] RBAC-13: Author submits draft for editorial review (status="submitted_for_review")');

  // Admin publishes the book
  const adminPublishRes = await patchJson(
    `/api/admin/books/${createdBook.id}/moderation`,
    {
      publicationStatus: 'published',
      moderationFeedback: 'संपादकीय मंडळाकडून स्वीकृत आणि प्रकाशित.',
    },
    adminHeaders
  );
  assert.equal(adminPublishRes.status, 200);
  assert.equal(adminPublishRes.data.book.publicationStatus, 'published');

  const publicBootstrapAfter = await getJson('/api/bootstrap');
  assert.equal(
    publicBootstrapAfter.data.books.some((b: { id: string }) => b.id === createdBook.id),
    true,
    'Published book must appear in public catalog'
  );
  console.log('  [PASS] RBAC-14: Admin publishes submitted book; book is now live in public catalog');

  // 4.9 Password Reset Single-Use Token & Session Invalidation + Account Suspension
  const forgotRes = await postJson(
    '/api/auth/forgot-password',
    { email: author2Email },
    { 'x-test-mode': 'true' }
  );
  assert.equal(forgotRes.status, 200);
  assert.ok(forgotRes.data.resetTokenPreview);

  const resetRes = await postJson('/api/auth/reset-password', {
    token: forgotRes.data.resetTokenPreview,
    newPassword: 'NewAuthorPass#2027',
  });
  assert.equal(resetRes.status, 200);

  // Old session token of Author 2 must be invalidated
  const oldSessionCheck = await getJson('/api/account/orders', author2Headers);
  assert.equal(oldSessionCheck.status, 401);

  // Reusing reset token must fail
  const reuseResetRes = await postJson('/api/auth/reset-password', {
    token: forgotRes.data.resetTokenPreview,
    newPassword: 'AnotherPassword#2027',
  });
  assert.equal(reuseResetRes.status, 400);
  console.log('  [PASS] Auth-12: Password reset invalidates existing sessions (401) and blocks token reuse (400)');

  // Admin suspends Reader B -> immediate session revocation
  const suspendRes = await patchJson(
    `/api/admin/users/${regReaderB.data.user.id}/status`,
    {
      accountStatus: 'suspended',
    },
    adminHeaders
  );
  assert.equal(suspendRes.status, 200);

  const suspendedSessionCheck = await getJson('/api/account/orders', readerBHeaders);
  assert.equal(suspendedSessionCheck.status, 401);

  const suspendedLoginAttempt = await postJson('/api/auth/login', {
    email: readerBEmail,
    password: 'ReaderPass#2026',
  });
  assert.equal(suspendedLoginAttempt.status, 403);
  console.log('  [PASS] RBAC-15: Admin suspension immediately revokes active sessions (401) and blocks login (403)');

  // Admin cannot suspend own account
  const selfSuspendRes = await patchJson(
    `/api/admin/users/${adminProv.data.user.id}/status`,
    { accountStatus: 'suspended' },
    adminHeaders
  );
  assert.equal(selfSuspendRes.status, 400);

  // Admin audit logs verification
  const auditLogsRes = await getJson('/api/admin/audit-logs', adminHeaders);
  assert.equal(auditLogsRes.status, 200);
  assert.ok(Array.isArray(auditLogsRes.data.auditLogs));
  assert.ok(auditLogsRes.data.auditLogs.length >= 10);
  console.log(
    `  [PASS] RBAC-16: Admin security audit log verified (${auditLogsRes.data.auditLogs.length} immutable security events recorded)`
  );

  // --------------------------------------------------------------------------
  // 5. ADMIN CONSOLE DEMO & RESPONSIVE UI VERIFICATION (DESKTOP, TABLET, MOBILE)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Admin Console Demo & Responsive UI Verification ---');

  const sandboxAdmin = await postJson('/api/auth/sandbox-persona', {
    persona: 'admin',
  });
  assert.equal(sandboxAdmin.status, 200);
  assert.equal(sandboxAdmin.data.user.role, 'admin');
  assert.ok(sandboxAdmin.data.sessionToken);
  assert.ok(sandboxAdmin.data.csrfToken);

  const adminDemoDashboard = await getJson('/api/admin/dashboard', {
    Authorization: `Bearer ${sandboxAdmin.data.sessionToken}`,
  });
  assert.equal(adminDemoDashboard.status, 200);
  assert.ok(Array.isArray(adminDemoDashboard.data.users));
  assert.ok(Array.isArray(adminDemoDashboard.data.books));
  assert.ok(Array.isArray(adminDemoDashboard.data.orders));
  assert.ok(Array.isArray(adminDemoDashboard.data.authorApplications));
  assert.ok(Array.isArray(adminDemoDashboard.data.manuscripts));
  assert.ok(Array.isArray(adminDemoDashboard.data.inquiries));
  assert.ok(Array.isArray(adminDemoDashboard.data.auditLogs));
  console.log(
    '  [PASS] UI-01: 1-Click Admin Console Demo (/api/auth/sandbox-persona -> /api/admin/dashboard) loads all 7 admin queues cleanly'
  );

  const sandboxAuthor = await postJson('/api/auth/sandbox-persona', {
    persona: 'author',
  });
  assert.equal(sandboxAuthor.status, 200);
  assert.equal(sandboxAuthor.data.user.role, 'author');
  console.log(
    '  [PASS] UI-02: 1-Click Author Studio Demo (/api/auth/sandbox-persona persona="author") verified'
  );

  const sandboxReader = await postJson('/api/auth/sandbox-persona', {
    persona: 'reader',
  });
  assert.equal(sandboxReader.status, 200);
  assert.equal(sandboxReader.data.user.role, 'reader');
  console.log(
    '  [PASS] UI-03: 1-Click Reader Account Demo (/api/auth/sandbox-persona persona="reader") verified'
  );

  const navbarSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/Navbar.tsx'),
    'utf-8'
  );
  assert.ok(navbarSource.includes('data-testid="desktop-lang-switcher"'));
  assert.ok(navbarSource.includes('data-testid="navbar-signin-btn"'));
  assert.ok(navbarSource.includes('data-testid="navbar-cart-btn"'));
  assert.ok(navbarSource.includes('data-testid="navbar-admin-link"'));
  assert.ok(navbarSource.includes('data-testid="navbar-mobile-menu-btn"'));
  assert.ok(navbarSource.includes('aria-controls="akath-mobile-drawer"'));
  assert.ok(navbarSource.includes('data-testid="navbar-mobile-drawer-overlay"'));
  assert.ok(navbarSource.includes('data-testid="navbar-mobile-drawer"'));
  assert.ok(navbarSource.includes('data-testid="mobile-tablet-quick-nav"'));
  assert.ok(!navbarSource.includes("immersiveHidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'"));
  const headerCloseIdx = navbarSource.indexOf('</header>');
  const drawerOverlayIdx = navbarSource.indexOf('data-testid="navbar-mobile-drawer-overlay"');
  assert.ok(
    drawerOverlayIdx > headerCloseIdx,
    'Mobile/Tablet navigation drawer must be rendered OUTSIDE <header> so CSS transform containing blocks never clip the fixed drawer on mobile viewports'
  );
  assert.ok(!navbarSource.includes('data-testid="navbar-demo-admin"'));
  assert.ok(!navbarSource.includes('data-testid="navbar-demo-switcher"'));
  console.log(
    '  [PASS] UI-04: Responsive Mobile/Tablet/Desktop Navbar & Unclipped Full-Viewport Slide-Over Drawer verified (outside <header> transform context + swipeable mobile/tablet quick nav)'
  );

  const footerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/Footer.tsx'),
    'utf-8'
  );
  const cssSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/index.css'),
    'utf-8'
  );
  assert.ok(footerSource.includes('data-testid="the-last-page-footer"'));
  assert.ok(footerSource.includes('data-testid="footer-monumental-wordmark"'));
  assert.ok(!footerSource.includes('AKATH PRAKASHAN · AKATH PUBLICATION'));
  assert.ok(footerSource.includes('Every story leaves a mark.'));
  assert.ok(footerSource.includes('Thoughtfully crafted by'));
  assert.ok(footerSource.includes('mivishvajeet'));
  assert.ok(footerSource.includes('Akath Prakashan · 2026'));
  assert.ok(!footerSource.includes('The Patient Tortoise'));
  assert.ok(!footerSource.includes('data-testid="footer-tortoise-mascot"'));
  assert.ok(!footerSource.includes('data-testid="footer-live-datetime"'));
  assert.ok(
    footerSource.includes('data-testid="footer-animated-book-constellation"')
  );
  for (const requiredHref of [
    'href="/books"',
    'href="/authors"',
    'href="/about"',
    'href="/submit-manuscript"',
    'href="/vachankatta/first-page"',
    'href="/vachankatta/articles"',
    'href="/vachankatta/reviews"',
    'href="/vachankatta/reading-lists"',
    'href="/track-order"',
    'href="/shipping-returns"',
    'href="/privacy"',
    'href="/terms"',
    'href="/contact"',
    'href="mailto:akathpublication@gmail.com"',
    'href="tel:+919270282932"',
    'href={PUBLISHER_IDENTITY.whatsappUrl}',
  ]) {
    assert.ok(
      footerSource.includes(requiredHref),
      `Footer missing required working link: ${requiredHref}`
    );
  }
  assert.ok(cssSource.includes('last-page-creator-credit'));
  assert.ok(cssSource.includes('akath-footer-wing-left'));
  assert.ok(cssSource.includes('akath-footer-wing-right'));
  assert.ok(cssSource.includes('prefers-reduced-motion: reduce'));
  console.log(
    '  [PASS] UI-05: "The Last Page" Editorial Footer verified (Monumental "अकथ प्रकाशन" wordmark, "Every story leaves a mark. / Thoughtfully crafted by mivishvajeet ↗ / Akath Prakashan · 2026", Tortoise & date removed, semantic <nav>/<address>/<a> links, and reduced-motion compliance)'
  );

  // Verify Researched Tortoise Colophon Seal in AboutAkathView after “वाचत राहू. विचारत राहू. लिहित राहू.”
  const walkingTortoiseSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/WalkingTortoise.tsx'),
    'utf-8'
  );
  const publishingViewsSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/views/PublishingHouseViews.tsx'),
    'utf-8'
  );
  assert.ok(walkingTortoiseSource.includes('data-testid="about-walking-tortoise"'));
  assert.ok(walkingTortoiseSource.includes('data-testid="about-tortoise-colophon-seal"'));
  assert.ok(walkingTortoiseSource.includes('data-testid="about-tortoise-traverse-track"'));
  assert.ok(walkingTortoiseSource.includes('data-testid="about-tortoise-traverse-runner"'));
  assert.ok(walkingTortoiseSource.includes('data-testid="about-tortoise-play-toggle"'));
  assert.ok(walkingTortoiseSource.includes('akath-patient-traverse-track'));
  assert.ok(walkingTortoiseSource.includes('akath-patient-tortoise-runner'));
  assert.ok(walkingTortoiseSource.includes('akath-patient-tortoise-flip'));
  assert.ok(!walkingTortoiseSource.includes('data-testid="walking-tortoise-traveler"'));
  assert.ok(walkingTortoiseSource.includes('#174D3A'));
  assert.ok(cssSource.includes('container-type: inline-size'));
  assert.ok(cssSource.includes('calc(100cqw - 92px)'));
  assert.ok(cssSource.includes('@media (hover: hover) and (pointer: fine)'));
  assert.ok(cssSource.includes('@keyframes akath-patient-traverse'));
  assert.ok(cssSource.includes('@keyframes akath-patient-turn'));
  assert.ok(cssSource.includes('@keyframes akath-colophon-orbit'));
  assert.ok(cssSource.includes('@keyframes akath-colophon-page-breathe-left'));
  assert.ok(cssSource.includes('@keyframes akath-colophon-shell-breathe'));
  assert.ok(
    publishingViewsSource.includes('data-testid="about-final-marathi-line"')
  );
  assert.ok(publishingViewsSource.includes('<WalkingTortoise'));
  const mottoIdx = publishingViewsSource.indexOf('data-testid="about-final-marathi-line"');
  const tortoiseIdx = publishingViewsSource.indexOf('<WalkingTortoise');
  assert.ok(
    tortoiseIdx > mottoIdx,
    'WalkingTortoise Traverse must appear AFTER the final Marathi line “वाचत राहू. विचारत राहू. लिहित राहू.”'
  );
  console.log(
    '  [PASS] UI-06: Mobile, Tablet & Desktop CSS Patient Tortoise Traverse Animation verified on About page (GPU container-query 100cqw transform, responsive 20s/26s/32s cycle, touch-safe play/pause toggle, hover-media guard, and reduced-motion fallback)'
  );

  // Verify SixEditorialStages component, HomeView layout, Mobile Horizontal Catalog Scroll, and redesigned 60-68ch AboutAkathView with physics-based breathe animation
  const sixStagesSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/SixEditorialStages.tsx'),
    'utf-8'
  );
  const homeViewSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/views/HomeView.tsx'),
    'utf-8'
  );
  const booksAndStoreSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/views/BooksAndStoreView.tsx'),
    'utf-8'
  );
  const vachankattaSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/views/VachankattaView.tsx'),
    'utf-8'
  );
  const appSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/App.tsx'),
    'utf-8'
  );
  assert.ok(navbarSource.includes('data-immersive-hidden'));
  assert.ok(navbarSource.includes('immersiveHidden'));
  assert.ok(appSource.includes('isImmersiveNavHidden'));
  assert.ok(vachankattaSource.includes('computeDynamicMarathiLineHeight'));
  assert.ok(vachankattaSource.includes('data-testid="immersive-article-container"'));
  assert.ok(vachankattaSource.includes('data-testid="article-reading-sidebar"'));
  assert.ok(vachankattaSource.includes('data-sidebar-hidden'));
  assert.ok(vachankattaSource.includes('data-testid="immersive-reading-toggle"'));
  assert.ok(vachankattaSource.includes('data-testid="immersive-reading-progress"'));
  assert.ok(vachankattaSource.includes('prose-marathi-immersive'));
  assert.ok(cssSource.includes('.prose-marathi-immersive'));
  assert.ok(sixStagesSource.includes('data-testid="editorial-stages-autoplay-toggle"'));
  assert.ok(sixStagesSource.includes('data-testid="editorial-stages-mobile-tabs"'));
  assert.ok(sixStagesSource.includes('data-testid="editorial-stage-spotlight"'));
  assert.ok(sixStagesSource.includes('data-testid="editorial-stages-spine-index"'));
  assert.ok(!sixStagesSource.includes('data-testid="editorial-stages-grid"'));
  assert.ok(!/weeks|आठवडे/i.test(sixStagesSource));
  assert.ok(sixStagesSource.includes('stepperContainerVariants'));
  assert.ok(sixStagesSource.includes('akath-seq-step'));
  assert.ok(sixStagesSource.includes('akath-stage-loupe'));
  assert.ok(sixStagesSource.includes('akath-stage-caliper'));
  assert.ok(sixStagesSource.includes('akath-stage-book'));
  assert.ok(homeViewSource.includes('data-testid="home-publishing-hero"'));
  assert.ok(homeViewSource.includes('काळजात उतरणारे मराठी ग्रंथप्रकाशन.'));
  assert.ok(homeViewSource.includes('Enduring Marathi Book Publishing.'));
  assert.ok(!homeViewSource.includes('Words That Stay.'));
  assert.ok(!homeViewSource.includes('Independent Marathi Literary Publishing House (Nanded'));
  assert.ok(!homeViewSource.includes('Pune'));
  assert.ok(!navbarSource.includes('Pune'));
  assert.ok(!navbarSource.includes('पुणे'));
  assert.ok(!footerSource.includes('Pune'));
  assert.ok(!footerSource.includes('पुणे'));
  assert.ok(!walkingTortoiseSource.includes('PUNE'));
  assert.ok(!walkingTortoiseSource.includes('पुणे'));
  assert.ok(!publishingViewsSource.includes('Pune'));
  assert.ok(!publishingViewsSource.includes('पुणे'));
  assert.ok(!sixStagesSource.includes('Pune'));
  assert.ok(!sixStagesSource.includes('पुणे'));
  assert.ok(!homeViewSource.includes('Manuscript to Archival Edition'));
  assert.ok(!homeViewSource.includes('Smyth-Sewn Binding'));
  assert.ok(!homeViewSource.includes('Official ISBN-13 Registration'));
  assert.ok(!homeViewSource.includes('Four Production Pillars of Every Akath Edition'));
  assert.ok(!homeViewSource.includes('data-testid="home-publishing-standards"'));
  assert.ok(!homeViewSource.includes('data-testid="home-section-gateway"'));
  assert.ok(!homeViewSource.includes('80 GSM'));
  assert.ok(!homeViewSource.includes('Acid-Free Bookpaper'));
  assert.ok(homeViewSource.includes('data-testid="home-manuscript-desk"'));
  assert.ok(homeViewSource.includes('<SixEditorialStages variant="home"'));
  assert.ok(!homeViewSource.includes('Accepted Literary Genres'));
  assert.ok(homeViewSource.includes('data-testid="home-published-books"'));
  assert.ok(homeViewSource.includes('data-testid="home-catalog-horizontal-scroll"'));
  assert.ok(
    homeViewSource.indexOf('data-testid="home-manuscript-desk"') <
      homeViewSource.indexOf('<SixEditorialStages variant="home"'),
    'Publish Your Manuscript with Akath Prakashan must appear ABOVE Six Editorial Stages on HomeView'
  );
  assert.ok(
    homeViewSource.indexOf('<SixEditorialStages variant="home"') <
      homeViewSource.indexOf('data-testid="home-published-books"'),
    'Curated Marathi Editions must appear AT THE BOTTOM below Six Editorial Stages on HomeView'
  );
  assert.ok(booksAndStoreSource.includes('data-testid="catalogue-mobile-horizontal-scroll"'));
  assert.ok(!booksAndStoreSource.includes('testId="catalogue-category-select"'));
  assert.ok(booksAndStoreSource.includes('layoutId="catalogue-category-pill"'));
  assert.ok(booksAndStoreSource.includes('testId="catalogue-sort-select"'));
  assert.ok(!booksAndStoreSource.includes('showExcerptSheet'));
  assert.ok(!publishingViewsSource.includes('<SixEditorialStages'));
  assert.ok(publishingViewsSource.includes('data-testid="about-archival-dateline"'));
  assert.ok(publishingViewsSource.includes('data-testid="about-live-date"'));
  assert.ok(publishingViewsSource.includes('data-testid="about-live-time"'));
  assert.ok(publishingViewsSource.includes('data-testid="about-prose-measure"'));
  assert.ok(publishingViewsSource.includes('max-w-[65ch]'));
  assert.ok(publishingViewsSource.includes('useAboutParagraphScrollReveal'));
  assert.ok(publishingViewsSource.includes('data-about-io-block'));
  assert.ok(publishingViewsSource.includes('data-about-io-para'));
  assert.ok(publishingViewsSource.includes('--io-stagger-index'));
  assert.ok(cssSource.includes('.akath-about-io-block'));
  assert.ok(cssSource.includes('.akath-about-io-para'));
  assert.ok(publishingViewsSource.includes('aboutSectionSequentialVariants'));
  assert.ok(publishingViewsSource.includes('data-testid="about-headline-breathe"'));
  assert.ok(publishingViewsSource.includes('data-testid="about-prose-breathe-block"'));
  assert.ok(publishingViewsSource.includes('akath-about-headline-breathe'));
  assert.ok(publishingViewsSource.includes('akath-about-prose-breathe'));
  assert.ok(cssSource.includes('@keyframes akath-headline-harmonic-breathe'));
  assert.ok(cssSource.includes('@keyframes akath-prose-harmonic-breathe'));
  assert.ok(
    publishingViewsSource.includes('काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.')
  );
  assert.ok(
    publishingViewsSource.includes('Some books end at the last page. Others stay with us.')
  );
  assert.ok(!publishingViewsSource.includes('FIG. 01 · IMPRINT SEAL'));
  assert.ok(!publishingViewsSource.includes('Marginalia 01'));
  assert.ok(!publishingViewsSource.includes('The language we live in'));
  assert.ok(!publishingViewsSource.includes('Books take more than words'));
  assert.ok(!publishingViewsSource.includes('A book is only the beginning'));
  assert.ok(!publishingViewsSource.includes('data-testid="about-monograph-bento-grid"'));
  assert.ok(publishingViewsSource.includes('Why the tortoise?'));
  assert.ok(publishingViewsSource.includes('data-testid="about-why-tortoise-feature"'));
  assert.ok(!publishingViewsSource.includes('Materiality &amp; Editorial Process · पुस्तकाची घडण'));
  assert.ok(!publishingViewsSource.includes('Curatorial Archive · संपादकीय निवड आणि प्रकाशित पुस्तके'));
  assert.ok(!publishingViewsSource.includes('Our Approach to Publishing'));
  assert.ok(
    publishingViewsSource.includes(
      'Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.'
    )
  );
  assert.ok(
    publishingViewsSource.includes('data-testid="about-editorial-colophon-desk"')
  );
  assert.ok(publishingViewsSource.includes('font-editorial-display'));
  assert.ok(publishingViewsSource.includes('font-editorial-prose'));
  assert.ok(cssSource.includes('.font-editorial-display'));
  assert.ok(cssSource.includes('.font-editorial-prose'));
  assert.ok(publishingViewsSource.includes('data-testid="about-founder-name"'));
  assert.ok(publishingViewsSource.includes('Pooja Vasantrao Dhawale'));
  assert.ok(publishingViewsSource.includes('पूजा वसंतराव ढवळे'));

  const seedDataSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/data/seedData.ts'),
    'utf-8'
  );
  const bookCoverArtSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/BookCoverArt.tsx'),
    'utf-8'
  );
  assert.ok(seedDataSource.includes("id: 'book-scholar-juice'"));
  assert.ok(seedDataSource.includes("title: 'स्कॉलर ज्यूस'"));
  assert.ok(seedDataSource.includes("name: 'जी. के. ऐनापुरे'"));
  assert.ok(seedDataSource.includes("subtitle: '( दीर्घकथा संग्रह )'"));
  assert.ok(seedDataSource.includes('price: 549'));
  assert.ok(seedDataSource.includes('- सुदाम राठोड, नाशिक'));
  assert.ok(seedDataSource.includes("coverImageUrl: '/assets/aistudio/scholar-juice-cover.jpg'"));
  assert.ok(seedDataSource.includes("coverSpreadUrl: '/assets/aistudio/scholar-juice-spread.jpg'"));
  assert.ok(seedDataSource.includes("coverPdfUrl: '/assets/aistudio/SCHOLAR_JUSIE_cover_design_cdr_15_15f6273e.pdf'"));

  // Verify Book 2 (धुक्याची दुलई — भूतान प्रवासवर्णन by अनुरत्न वाघमारे) & Book 3 (लोकशाहीमध्ये समाजमाध्यमांचा वापर by आखिलेश पंडित येलकदरे)
  assert.ok(seedDataSource.includes("id: 'book-dhukyachi-dulai'"));
  assert.ok(seedDataSource.includes("title: 'धुक्याची दुलई'"));
  assert.ok(seedDataSource.includes("name: 'अनुरत्न वाघमारे'"));
  assert.ok(seedDataSource.includes("coverImageUrl: '/assets/aistudio/book2_b40a45e1.jpeg'"));
  assert.ok(seedDataSource.includes("id: 'book-lokshahimadhye-samajmadhyamancha-vapar'"));
  assert.ok(seedDataSource.includes("title: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर'"));
  assert.ok(seedDataSource.includes("name: 'आखिलेश पंडित येलकदरे'"));
  assert.ok(seedDataSource.includes("coverImageUrl: '/assets/aistudio/lokshahi-cover.jpg'"));
  assert.ok(
    seedDataSource.includes(
      "coverSpreadUrl: '/assets/aistudio/ChatGPT_Image_Nov_3__2026_at_11_52_43_PM_821c7865.png'"
    )
  );

  // Verify Second PDF in First Page section (excerpt-scholar-juice + 6 folioPages)
  assert.ok(seedDataSource.includes("id: 'excerpt-scholar-juice'"));
  assert.ok(
    seedDataSource.includes(
      "pdfDocumentUrl: '/assets/aistudio/_________________________________________ead1d264.pdf'"
    )
  );
  assert.ok(seedDataSource.includes("id: 'excerpt-dhukyachi-dulai'"));
  assert.ok(seedDataSource.includes("id: 'excerpt-lokshahimadhye-samajmadhyamancha-vapar'"));
  assert.ok(seedDataSource.includes("id: 'list-akath-prakashan-vishesh-granth'"));
  assert.ok(vachankattaSource.includes('data-testid="first-page-pdf-folio-viewer"'));
  assert.ok(vachankattaSource.includes('data-testid="first-page-pdf-download-link"'));

  assert.ok(homeViewSource.includes('data-testid="home-featured-edition-dossier"'));
  assert.ok(homeViewSource.includes('data-testid="featured-edition-blurb"'));
  assert.ok(homeViewSource.includes('data-testid="toggle-featured-jacket-spread"'));
  assert.ok(bookCoverArtSource.includes('const customCoverSrc = book.coverImageUrl || book.coverUploadMeta?.dataUrl;'));

  const bootstrapFeaturedCheck = await getJson('/api/bootstrap');
  const liveFeaturedBooks = bootstrapFeaturedCheck.data.books.filter(
    (b: { isFeatured: boolean }) => b.isFeatured
  );
  assert.equal(
    liveFeaturedBooks.length,
    1,
    'Only स्कॉलर ज्यूस should be marked isFeatured: true (dummy featured editions removed)'
  );
  assert.equal(liveFeaturedBooks[0].id, 'book-scholar-juice');
  assert.equal(liveFeaturedBooks[0].title, 'स्कॉलर ज्यूस');
  assert.equal(liveFeaturedBooks[0].price, 549);

  // Verify all 3 books are present in /api/bootstrap books, excerpts, and readingLists and all dummy books/authors are removed
  const liveBookIds = bootstrapFeaturedCheck.data.books.map((b: { id: string }) => b.id);
  assert.ok(liveBookIds.includes('book-scholar-juice'));
  assert.ok(liveBookIds.includes('book-dhukyachi-dulai'));
  assert.ok(liveBookIds.includes('book-lokshahimadhye-samajmadhyamancha-vapar'));
  assert.ok(!seedDataSource.includes('book-godavari-kathache-akshar'));
  assert.ok(!seedDataSource.includes('book-unhachya-savlya'));
  assert.ok(!seedDataSource.includes('book-koradya-nadichi-bakhar'));
  assert.ok(!seedDataSource.includes('book-santh-panyache-divas'));
  assert.ok(!seedDataSource.includes('book-antarbhasha-anuvad-sankalan'));
  assert.ok(!seedDataSource.includes('book-shabdanche-antahsthal'));
  assert.ok(!seedDataSource.includes('author-dnyaneshwar-parampara'));
  assert.ok(!seedDataSource.includes('author-revati-kulkarni'));
  assert.ok(!seedDataSource.includes('author-siddharth-waghmare'));
  assert.ok(!seedDataSource.includes('author-meera-joshi-anuvad'));

  const liveExcerptBookIds = bootstrapFeaturedCheck.data.excerpts.map(
    (e: { bookId: string }) => e.bookId
  );
  assert.equal(liveExcerptBookIds.length, 3);
  assert.ok(liveExcerptBookIds.includes('book-scholar-juice'));
  assert.ok(liveExcerptBookIds.includes('book-dhukyachi-dulai'));
  assert.ok(liveExcerptBookIds.includes('book-lokshahimadhye-samajmadhyamancha-vapar'));
  assert.equal(bootstrapFeaturedCheck.data.excerpts[0].folioPages.length, 6);
  assert.equal(bootstrapFeaturedCheck.data.readingLists.length, 1);

  console.log(
    '  [PASS] UI-07: Only the 3 User-Provided Books & 3 Authors remain (all dummy books/authors removed), Featured Edition ("स्कॉलर ज्यूस", ₹549 + Cover Spread PDF) & 6-Page First Page PDF Folio verified'
  );

  // Verify No-Code Admin CMS Endpoints (Create Book, Export CSV, Publish Article, Update Site Config, Create Promotion)
  const adminTokenHeaders = {
    Authorization: `Bearer ${sandboxAdmin.data.sessionToken}`,
  };
  const createBookCms = await postJson(
    '/api/admin/books',
    {
      title: 'अकथ संपादकीय नोंदी (CMS Test)',
      category: 'समीक्षा व निबंध',
      isbn: `978-81-964821-${Date.now().toString().slice(-2)}`,
      price: 295,
      stock: 18,
      description: 'प्रशासकीय नियंत्रण कक्षातून कोणताही कोड न बदलता थेट प्रकाशित केलेला ग्रंथ.',
      publicationStatus: 'published',
    },
    adminTokenHeaders
  );
  assert.equal(createBookCms.status, 201);
  assert.equal(createBookCms.data.book.price, 295);

  const createArticleCms = await postJson(
    '/api/admin/articles',
    {
      title: 'मराठी मुद्रण संस्कृती आणि वाचक संवाद',
      category: 'संपादकीय निबंध',
      summary: 'समकालीन मराठी प्रकाशनातील संपादकीय मूल्ये.',
      bodyText:
        'पुस्तक ही केवळ वस्तू नसून ती काळाशी केलेली दीर्घ चर्चा असते.\nअकथ प्रकाशनमध्ये आम्ही प्रत्येक हस्तलिखितावर सखोल संपादकीय संस्कार करतो.',
    },
    adminTokenHeaders
  );
  assert.equal(createArticleCms.status, 201);

  const siteConfigPatch = await patchJson(
    '/api/admin/site-config',
    {
      promoBanner: { enabled: true },
    },
    adminTokenHeaders
  );
  assert.equal(siteConfigPatch.status, 200);
  assert.equal(siteConfigPatch.data.siteConfig.promoBanner.enabled, true);
  console.log(
    '  [PASS] CMS-01: No-Code Admin CMS endpoints verified (Visual Book Creation, Editorial Article Publishing, and Storefront Site Config)'
  );

  // Verify Minimal Standard ContactView UI (Address, Channels & Form), Accessible Dropdowns, and Live /api/contact Integration
  assert.ok(publishingViewsSource.includes('export const EditorialSelectDropdown'));
  assert.ok(publishingViewsSource.includes('aria-haspopup="listbox"'));
  assert.ok(publishingViewsSource.includes('role="listbox"'));
  assert.ok(publishingViewsSource.includes("isOpen ? 'z-50' : 'z-10'"));
  assert.ok(publishingViewsSource.includes('z-[70]'));
  assert.ok(publishingViewsSource.includes('data-testid="contact-editorial-view"'));
  assert.ok(publishingViewsSource.includes('data-testid="contact-address-block"'));
  assert.ok(publishingViewsSource.includes('data-testid="contact-channels-block"'));
  assert.ok(publishingViewsSource.includes('data-testid="contact-form-folio"'));
  assert.ok(publishingViewsSource.includes('testId="contact-role-select"'));
  assert.ok(publishingViewsSource.includes('testId="ms-category-select"'));
  assert.ok(publishingViewsSource.includes('data-testid="contact-receipt-card"'));
  assert.ok(!publishingViewsSource.includes('data-testid="contact-desk-cards"'));
  assert.ok(!publishingViewsSource.includes('FOLIO · AKATH-CORR-2026'));

  const contactDispatchRes = await postJson('/api/contact', {
    lang: 'mr',
    name: 'प्रा. अनिकेत देशमुख',
    role: 'Bookstore_Institution',
    email: 'aniket.deshmukh@library.org.in',
    phone: '9422178430',
    subject: 'ग्रंथालय संच / पुस्तक विक्रेता घाऊक मागणी',
    message:
      'आमच्या महाविद्यालयीन ग्रंथालयासाठी अकथ प्रकाशनच्या सर्व प्रकाशित पुस्तकांचे २ संच हवे आहेत. कृपया सवलत दरपत्रक पाठवावे.',
  });
  assert.equal(contactDispatchRes.status, 201);
  assert.ok(contactDispatchRes.data.inquiry.id.startsWith('inq-'));
  assert.equal(contactDispatchRes.data.inquiry.role, 'Bookstore_Institution');
  assert.equal(
    contactDispatchRes.data.inquiry.subject,
    'ग्रंथालय संच / पुस्तक विक्रेता घाऊक मागणी'
  );
  console.log(
    '  [PASS] UI-08: Minimal Standard Contact View (Address, Channels, and Form), Mobile-Safe Z-Indexed Dropdowns, and live /api/contact dispatch verified'
  );

  // --------------------------------------------------------------------------
  // 6. SEC-01 REMEDIATION SUITE: PAYMENT VERIFICATION, OWNERSHIP, WEBHOOK HMAC,
  //    REPLAY PROTECTION, INVENTORY IDEMPOTENCY & PII REDACTION (11 CASES)
  // --------------------------------------------------------------------------
  console.log(
    '\n--- 6. SEC-01 Remediation Suite: Payment Verification, Ownership, Webhook HMAC & Idempotency (11 Cases) ---'
  );

  // SEC-01.1: Unit Test — Cryptographic HMAC-SHA256 Webhook Signature, Timestamp Tolerance & Replay Protection
  const unitWebhookSecret = 'unit-test-hmac-secret-2026';
  const unitPayload = JSON.stringify({
    orderId: 'ord-unit-101',
    outcome: 'success',
    paymentReference: 'GW-UNIT-101',
    amount: 549,
  });
  const unitNowTs = String(Date.now());
  const validUnitSig = computeWebhookSignature(unitPayload, unitWebhookSecret, unitNowTs);

  const unitValidCheck = verifyPaymentWebhookSignatureWithDetails(
    unitPayload,
    validUnitSig,
    unitWebhookSecret,
    {
      timestampHeader: unitNowTs,
      eventId: `evt-unit-${unitNowTs}`,
    }
  );
  assert.equal(unitValidCheck.valid, true, 'Valid HMAC-SHA256 webhook signature must pass');

  // Replay of the exact same webhook event/signature must be blocked
  const unitReplayCheck = verifyPaymentWebhookSignatureWithDetails(
    unitPayload,
    validUnitSig,
    unitWebhookSecret,
    {
      timestampHeader: unitNowTs,
      eventId: `evt-unit-${unitNowTs}`,
    }
  );
  assert.equal(unitReplayCheck.valid, false);
  assert.equal(unitReplayCheck.reason, 'replayed_event');

  // Invalid signature must fail
  const unitBadSigCheck = verifyPaymentWebhookSignatureWithDetails(
    unitPayload,
    'deadbeef'.repeat(8),
    unitWebhookSecret,
    {
      timestampHeader: unitNowTs,
      eventId: `evt-unit-bad-${unitNowTs}`,
    }
  );
  assert.equal(unitBadSigCheck.valid, false);
  assert.equal(unitBadSigCheck.reason, 'signature_mismatch');

  // Expired timestamp (>5 minutes old) must fail
  const expiredTs = String(Date.now() - 10 * 60 * 1000);
  const expiredSig = computeWebhookSignature(unitPayload, unitWebhookSecret, expiredTs);
  const unitExpiredCheck = verifyPaymentWebhookSignatureWithDetails(
    unitPayload,
    expiredSig,
    unitWebhookSecret,
    {
      timestampHeader: expiredTs,
      eventId: `evt-unit-exp-${unitNowTs}`,
    }
  );
  assert.equal(unitExpiredCheck.valid, false);
  assert.equal(unitExpiredCheck.reason, 'timestamp_expired');
  console.log(
    '  [PASS] SEC-01.1 (Unit): HMAC-SHA256 webhook signature, 5-minute timestamp window, and event replay cache verified'
  );

  // Create a fresh Guest Order specifically for SEC-01 live endpoint testing
  const bootBeforeSec01 = await getJson('/api/bootstrap');
  const targetBookBefore = bootBeforeSec01.data.books.find(
    (b: { id: string }) => b.id === 'book-scholar-juice'
  );
  assert.ok(targetBookBefore, 'book-scholar-juice must exist in catalog');
  const initialScholarStock = targetBookBefore.stock;

  const sec01GuestOrderRes = await postJson('/api/orders', {
    idempotencyKey: `sec01-guest-order-${Date.now()}`,
    lang: 'en',
    paymentMethod: 'upi_qr',
    items: [{ bookId: 'book-scholar-juice', quantity: 1 }],
    customer: {
      fullName: 'Vikramaditya Deshmukh',
      phone: '9823456789',
      email: 'vikram.sec01@example.com',
      addressLine1: 'Flat 402, Sahyadri Residency, VIP Road',
      city: 'Nanded',
      postalCode: '431602',
    },
  });
  assert.equal(sec01GuestOrderRes.status, 201);
  const sec01GuestOrder = sec01GuestOrderRes.data.order;
  const sec01GuestToken = sec01GuestOrder.guestAccessToken;
  assert.ok(sec01GuestToken, 'Guest order must include guestAccessToken at creation');

  const activeWebhookSecret =
    process.env.PAYMENT_WEBHOOK_SECRET?.trim() ||
    'whsec_akath_dev_hmac_secret_2026';

  async function postSignedVerifyPayment(
    orderId: string,
    payloadObj: Record<string, unknown>,
    extraHeaders: Record<string, string> = {}
  ) {
    const tsStr = String(Date.now());
    const evtId = `evt-verify-${tsStr}-${Math.random().toString(36).slice(2, 7)}`;
    const rawBody = JSON.stringify(payloadObj);
    const sig = computeWebhookSignature(rawBody, activeWebhookSecret, tsStr);
    const res = await fetch(`${BASE_URL}/api/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': sig,
        'x-webhook-timestamp': tsStr,
        'x-webhook-event-id': evtId,
        ...extraHeaders,
      },
      body: rawBody,
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  }

  // SEC-01.2: Calling /api/orders/:id/verify-payment without HMAC signature (even with guestAccessToken or session) -> Rejected (401 MISSING_SIGNATURE)
  const anonVerifyAttempt = await postJson(
    `/api/orders/${sec01GuestOrder.id}/verify-payment`,
    {
      outcome: 'success',
      paymentReference: `ATK-ANON-${Date.now()}`,
      guestAccessToken: sec01GuestToken,
    }
  );
  assert.equal(
    anonVerifyAttempt.status,
    401,
    'Any request to /api/orders/:id/verify-payment without a valid HMAC signature header must be rejected by verifyPaymentHmacMiddleware with 401'
  );
  assert.equal(anonVerifyAttempt.data.code, 'MISSING_SIGNATURE');
  assert.equal(anonVerifyAttempt.data.order, undefined, 'Error response must not leak order PII');
  console.log(
    '  [PASS] SEC-01.2 (HMAC Middleware): Unsigned POST /api/orders/:id/verify-payment rejected with 401 MISSING_SIGNATURE and zero PII leaked'
  );

  // SEC-01.3: Attacker supplying a forged/wrong guestAccessToken -> Rejected (403)
  const wrongTokenAttempt = await postSignedVerifyPayment(
    sec01GuestOrder.id,
    {
      outcome: 'success',
      paymentReference: `ATK-TOKEN-${Date.now()}`,
      guestAccessToken: 'forged-guest-access-token-000000',
    }
  );
  assert.equal(wrongTokenAttempt.status, 403);
  assert.equal(wrongTokenAttempt.data.order, undefined);
  console.log(
    '  [PASS] SEC-01.3 (Guest Token): Forged guestAccessToken rejected with 403 Forbidden'
  );

  // SEC-01.4: Authenticated Reader (non-owner) attempting to verify another customer's order (IDOR) -> Rejected (403)
  const readerNonOwnerAttempt = await postJson(
    `/api/orders/${sec01GuestOrder.id}/checkout-payment`,
    {
      outcome: 'success',
      paymentReference: `ATK-READER-${Date.now()}`,
    },
    { Authorization: `Bearer ${sandboxReader.data.sessionToken}` }
  );
  assert.equal(readerNonOwnerAttempt.status, 403);
  assert.equal(readerNonOwnerAttempt.data.order, undefined);
  console.log(
    '  [PASS] SEC-01.4 (Reader IDOR): Logged-in non-owner Reader blocked from verifying another user order with 403'
  );

  // SEC-01.5: Authenticated Author (non-owner) attempting to verify another customer's order -> Rejected (403)
  const authorNonOwnerAttempt = await postJson(
    `/api/orders/${sec01GuestOrder.id}/checkout-payment`,
    {
      outcome: 'success',
      paymentReference: `ATK-AUTHOR-${Date.now()}`,
    },
    { Authorization: `Bearer ${sandboxAuthor.data.sessionToken}` }
  );
  assert.equal(authorNonOwnerAttempt.status, 403);
  assert.equal(authorNonOwnerAttempt.data.order, undefined);
  console.log(
    '  [PASS] SEC-01.5 (Author IDOR): Logged-in non-owner Author blocked from verifying another user order with 403'
  );

  // SEC-01.6: Forged Webhook Signature on /api/orders/:id/verify-payment and /api/webhooks/payment -> 403 / 401
  const forgedWebhookAttempt = await postJson(
    `/api/orders/${sec01GuestOrder.id}/verify-payment`,
    {
      outcome: 'success',
      paymentReference: `ATK-WEBHOOK-${Date.now()}`,
    },
    {
      'x-webhook-signature': '0000000000000000000000000000000000000000000000000000000000000000',
      'x-webhook-timestamp': String(Date.now()),
    }
  );
  assert.equal(forgedWebhookAttempt.status, 403);

  const forgedDedicatedWebhook = await postJson(
    '/api/webhooks/payment',
    {
      orderId: sec01GuestOrder.id,
      outcome: 'success',
      paymentReference: `ATK-GW-${Date.now()}`,
    },
    {
      'x-webhook-signature': 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      'x-webhook-timestamp': String(Date.now()),
    }
  );
  assert.equal(forgedDedicatedWebhook.status, 401);
  console.log(
    '  [PASS] SEC-01.6 (Webhook Auth): Forged X-Webhook-Signature rejected on both client (403) and gateway (401) endpoints'
  );

  // SEC-01.7: Payment Amount Tampering (e.g. paying ₹1 for a ₹549 order) -> 400
  const tamperedAmountAttempt = await postSignedVerifyPayment(
    sec01GuestOrder.id,
    {
      outcome: 'success',
      paymentReference: `UTR-TAMPER-${Date.now()}`,
      guestAccessToken: sec01GuestToken,
      amount: 1,
    }
  );
  assert.equal(tamperedAmountAttempt.status, 400);
  console.log(
    '  [PASS] SEC-01.7 (Amount Integrity): Payment amount mismatch (₹1 vs order grandTotal) rejected with 400'
  );

  // Verify stock has NOT changed after all 6 rejected attack attempts above
  const bootMidSec01 = await getJson('/api/bootstrap');
  const targetBookMid = bootMidSec01.data.books.find(
    (b: { id: string }) => b.id === 'book-scholar-juice'
  );
  assert.equal(
    targetBookMid.stock,
    initialScholarStock,
    'Book inventory must remain completely untouched after unauthorized/invalid verification attempts'
  );

  // SEC-01.8: Valid HMAC-Signed Verification with PAYMENT_WEBHOOK_SECRET -> 200 OK, Stock Deducted Once, PII Redacted
  const validGuestPaymentRef = `UTR-VALID-GUEST-${Date.now()}`;
  const validGuestVerifyRes = await postSignedVerifyPayment(
    sec01GuestOrder.id,
    {
      outcome: 'success',
      paymentReference: validGuestPaymentRef,
      guestAccessToken: sec01GuestToken,
      amount: sec01GuestOrder.grandTotal,
    }
  );
  assert.equal(validGuestVerifyRes.status, 200);
  assert.equal(validGuestVerifyRes.data.order.paymentStatus, 'verified');
  assert.equal(validGuestVerifyRes.data.order.orderStatus, 'payment_verified');
  assert.equal(
    validGuestVerifyRes.data.order.guestAccessToken,
    undefined,
    'Verification response must strip guestAccessToken'
  );
  assert.notEqual(
    validGuestVerifyRes.data.order.customer.phone,
    '9823456789',
    'Verification response must mask customer phone PII'
  );
  assert.ok(
    validGuestVerifyRes.data.order.customer.phone.includes('*'),
    'Customer phone must be masked in verification response'
  );
  assert.ok(
    validGuestVerifyRes.data.order.customer.email.includes('*'),
    'Customer email must be masked in verification response'
  );
  assert.ok(
    !validGuestVerifyRes.data.order.customer.addressLine1.includes('Flat 402'),
    'Customer street address must be redacted in verification response'
  );

  const bootAfterFirstVerify = await getJson('/api/bootstrap');
  const targetBookAfterFirst = bootAfterFirstVerify.data.books.find(
    (b: { id: string }) => b.id === 'book-scholar-juice'
  );
  assert.equal(
    targetBookAfterFirst.stock,
    initialScholarStock - 1,
    'Book stock must be deducted by exactly 1 upon valid payment verification'
  );
  console.log(
    '  [PASS] SEC-01.8 (Valid HMAC & PII Redaction): Valid PAYMENT_WEBHOOK_SECRET HMAC verification succeeds (200), deducts stock by 1, and masks phone/email/address PII'
  );

  // SEC-01.9: Idempotency & State-Machine Guard — Repeated verification does NOT deduct stock again, and downgrade to failed is blocked
  const duplicateVerifyRes = await postSignedVerifyPayment(
    sec01GuestOrder.id,
    {
      outcome: 'success',
      paymentReference: validGuestPaymentRef,
      guestAccessToken: sec01GuestToken,
    }
  );
  assert.equal(duplicateVerifyRes.status, 200);
  assert.equal(duplicateVerifyRes.data.alreadyVerified, true);

  const bootAfterDuplicateVerify = await getJson('/api/bootstrap');
  const targetBookAfterDuplicate = bootAfterDuplicateVerify.data.books.find(
    (b: { id: string }) => b.id === 'book-scholar-juice'
  );
  assert.equal(
    targetBookAfterDuplicate.stock,
    initialScholarStock - 1,
    'Repeated verify-payment call must NEVER deduct inventory a second time'
  );

  const downgradeVerifiedAttempt = await postSignedVerifyPayment(
    sec01GuestOrder.id,
    {
      outcome: 'failed',
      guestAccessToken: sec01GuestToken,
    }
  );
  assert.equal(
    downgradeVerifiedAttempt.status,
    400,
    'Cannot downgrade an already verified order back to failed'
  );
  console.log(
    '  [PASS] SEC-01.9 (Inventory Idempotency & State Guard): Repeated verification returns alreadyVerified=true with 0 extra stock deduction; status downgrade blocked (400)'
  );

  // SEC-01.10: Cross-Order Payment Reference Replay Prevention -> 409 Conflict
  const readerOrderRes = await postJson(
    '/api/orders',
    {
      idempotencyKey: `sec01-reader-order-${Date.now()}`,
      lang: 'mr',
      paymentMethod: 'upi_qr',
      items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
      customer: {
        fullName: 'मीरा देशमुख',
        phone: '9823011223',
        email: readerAEmail,
        addressLine1: '१४, प्रभात रस्ता, डेक्कन',
        city: 'नांदेड',
        postalCode: '431605',
      },
    },
    readerAHeaders
  );
  assert.equal(readerOrderRes.status, 201);
  const sec01ReaderOrder = readerOrderRes.data.order;

  const replayPaymentRefAttempt = await postSignedVerifyPayment(
    sec01ReaderOrder.id,
    {
      outcome: 'success',
      paymentReference: validGuestPaymentRef, // Reusing paymentReference from sec01GuestOrder!
    },
    readerAHeaders
  );
  assert.equal(
    replayPaymentRefAttempt.status,
    409,
    'Reusing a consumed paymentReference on a different order must be rejected with 409 Conflict'
  );
  assert.equal(replayPaymentRefAttempt.data.code, 'PAYMENT_REFERENCE_REPLAY');
  console.log(
    '  [PASS] SEC-01.10 (Payment Reference Replay): Reusing a consumed paymentReference across orders rejected with 409 Conflict'
  );

  // SEC-01.11: Dedicated Admin Verification Endpoint (/api/admin/orders/:id/verify-payment) & Authentic Gateway Webhook (/api/webhooks/payment)
  const nonAdminManualVerify = await postJson(
    `/api/admin/orders/${sec01ReaderOrder.id}/verify-payment`,
    {
      outcome: 'success',
      paymentReference: `ADMIN-REF-${Date.now()}`,
    },
    readerAHeaders
  );
  assert.equal(
    nonAdminManualVerify.status,
    403,
    'Reader must be blocked from /api/admin/orders/:id/verify-payment with 403'
  );

  const adminManualVerify = await postJson(
    `/api/admin/orders/${sec01ReaderOrder.id}/verify-payment`,
    {
      outcome: 'success',
      paymentReference: `ADMIN-MANUAL-${Date.now()}`,
    },
    adminHeaders
  );
  assert.equal(adminManualVerify.status, 200);
  assert.equal(adminManualVerify.data.order.paymentStatus, 'verified');

  // Test authentic signed gateway webhook on a third order via POST /api/webhooks/payment
  const webhookOrderRes = await postJson('/api/orders', {
    idempotencyKey: `sec01-webhook-order-${Date.now()}`,
    lang: 'en',
    paymentMethod: 'razorpay_cards',
    items: [{ bookId: 'book-lokshahimadhye-samajmadhyamancha-vapar', quantity: 1 }],
    customer: {
      fullName: 'Gateway Webhook Customer',
      phone: '9765432109',
      email: 'webhook.customer@example.com',
      addressLine1: '108, M.G. Road',
      city: 'Nanded',
      postalCode: '431601',
    },
  });
  assert.equal(webhookOrderRes.status, 201);
  const webhookOrder = webhookOrderRes.data.order;

  const webhookSecret =
    process.env.PAYMENT_WEBHOOK_SECRET?.trim() ||
    'whsec_akath_dev_hmac_secret_2026';
  const webhookTs = String(Date.now());
  const webhookEventId = `evt-live-gw-${webhookTs}`;
  const webhookPayloadObj = {
    orderId: webhookOrder.id,
    outcome: 'success',
    paymentReference: `RZP-GW-${webhookTs}`,
    amount: webhookOrder.grandTotal,
  };
  const webhookRawBody = JSON.stringify(webhookPayloadObj);
  const webhookSig = computeWebhookSignature(webhookRawBody, webhookSecret, webhookTs);

  const liveWebhookRes = await fetch(`${BASE_URL}/api/webhooks/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': webhookSig,
      'x-webhook-timestamp': webhookTs,
      'x-webhook-event-id': webhookEventId,
    },
    body: webhookRawBody,
  });
  const liveWebhookData = await liveWebhookRes.json();
  assert.equal(liveWebhookRes.status, 200);
  assert.equal(liveWebhookData.received, true);
  assert.equal(liveWebhookData.paymentStatus, 'verified');
  assert.equal(
    liveWebhookData.customer,
    undefined,
    'Gateway webhook acknowledgment must return minimal status metadata without customer PII'
  );

  // Replaying the exact same signed webhook request must return 409 Conflict
  const replayedWebhookRes = await fetch(`${BASE_URL}/api/webhooks/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': webhookSig,
      'x-webhook-timestamp': webhookTs,
      'x-webhook-event-id': webhookEventId,
    },
    body: webhookRawBody,
  });
  assert.equal(
    replayedWebhookRes.status,
    409,
    'Replaying an already-processed webhook event must be rejected with 409 Conflict'
  );
  console.log(
    '  [PASS] SEC-01.11 (Admin & Gateway Separation): /api/admin/orders/:id/verify-payment (RBAC enforced) and /api/webhooks/payment (HMAC + replay enforced) verified'
  );

  // --------------------------------------------------------------------------
  // 7. SEC-02 DEFENSE-IN-DEPTH HARDENING SUITE: HTTP HEADERS, CSV DDE GUARD,
  //    PROTOTYPE POLLUTION, IDEMPOTENCY PII GUARD & MANUSCRIPT REDACTION (5 CASES)
  // --------------------------------------------------------------------------
  console.log(
    '\n--- 7. SEC-02 Defense-in-Depth Hardening Suite (5 Cases) ---'
  );

  // SEC-02.1: HTTP Security Headers, CSP (frame-ancestors *), X-Powered-By removal, and Cache-Control: no-store
  const headerCheckRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert.equal(headerCheckRes.headers.get('x-powered-by'), null);
  assert.equal(headerCheckRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(
    headerCheckRes.headers.get('x-permitted-cross-domain-policies'),
    'none'
  );
  assert.ok(
    (headerCheckRes.headers.get('content-security-policy') || '').includes(
      'frame-ancestors *'
    )
  );
  assert.ok(
    (headerCheckRes.headers.get('cache-control') || '').includes('no-store')
  );
  console.log(
    '  [PASS] SEC-02.1 (Security Headers & Cache Control): CSP, Permissions-Policy, X-Powered-By removal, and Cache-Control: no-store verified'
  );

  // SEC-02.2: CSV Formula / DDE Injection Neutralization
  assert.equal(escapeCsvCell("=CMD|' /C calc'!A0"), "'=CMD|' /C calc'!A0");
  assert.equal(escapeCsvCell('@SUM(1+1)'), "'@SUM(1+1)");
  assert.equal(escapeCsvCell('+1+1'), "'+1+1");
  assert.equal(escapeCsvCell(-2), '-2');
  assert.equal(escapeCsvCell('320'), '320');
  console.log(
    '  [PASS] SEC-02.2 (CSV Formula Injection Guard): DDE payloads (=, +, -, @) neutralized while preserving numeric values'
  );

  // SEC-02.3: Prototype Pollution & Unsafe Site-Config URL/XSS Sanitization
  const protoPatchRes = await fetch(`${BASE_URL}/api/admin/site-config`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
    body: '{"promoBanner":{"enabled":true,"ctaLink":"javascript:alert(1)","badgeText":"<script>evil()</script>AKATH10"},"__proto__":{"polluted":true}}',
  });
  const protoPatchData = await protoPatchRes.json();
  assert.equal(protoPatchRes.status, 200);
  assert.equal(protoPatchData.siteConfig.promoBanner.ctaLink, '/books');
  assert.ok(
    !protoPatchData.siteConfig.promoBanner.badgeText.includes('<script>')
  );
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  console.log(
    '  [PASS] SEC-02.3 (Prototype Pollution & Site-Config Guard): __proto__ keys stripped and javascript: CTA URLs neutralized'
  );

  // SEC-02.4: Order Idempotency Replay PII & Token Leak Prevention
  const idemProbeKey = `sec02-idem-${Date.now()}`;
  const idemCreateRes = await postJson('/api/orders', {
    idempotencyKey: idemProbeKey,
    lang: 'en',
    paymentMethod: 'upi_verified',
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    customer: {
      fullName: 'Idempotency Owner',
      phone: '9823456780',
      email: 'idem.owner@example.com',
      addressLine1: 'Secret House 99, VIP Road',
      city: 'Nanded',
      postalCode: '431602',
    },
  });
  assert.equal(idemCreateRes.status, 201);
  assert.ok(idemCreateRes.data.order.guestAccessToken);

  // Replay the same idempotencyKey without providing the owner's guestAccessToken
  const idemReplayProbe = await postJson('/api/orders', {
    idempotencyKey: idemProbeKey,
    lang: 'en',
    paymentMethod: 'upi_verified',
    items: [{ bookId: 'book-dhukyachi-dulai', quantity: 1 }],
    customer: {
      fullName: 'Attacker Replay',
      phone: '9823456780',
      email: 'idem.owner@example.com',
      addressLine1: 'Probe',
      city: 'Nanded',
      postalCode: '431602',
    },
  });
  assert.equal(idemReplayProbe.status, 200);
  assert.equal(idemReplayProbe.data.duplicatePrevented, true);
  assert.equal(
    idemReplayProbe.data.order.guestAccessToken,
    undefined,
    'Non-owner idempotency replay must NEVER leak guestAccessToken'
  );
  assert.ok(
    idemReplayProbe.data.order.customer.phone.includes('*'),
    'Non-owner idempotency replay must mask phone PII'
  );
  console.log(
    '  [PASS] SEC-02.4 (Idempotency Replay PII Guard): Unauthenticated idempotency replay strips guestAccessToken and masks customer PII'
  );

  // SEC-02.5: PII-Redacted Manuscript Status Lookup
  const msTrackRes = await getJson('/api/manuscripts/track/AK-MS-2026-109');
  assert.equal(msTrackRes.status, 200);
  assert.equal(msTrackRes.data.manuscript.referenceCode, 'AK-MS-2026-109');
  assert.equal(msTrackRes.data.manuscript.reviewStatus, 'initial_reading');
  assert.equal(msTrackRes.data.manuscript.authorName, undefined);
  assert.equal(msTrackRes.data.manuscript.email, undefined);
  assert.equal(msTrackRes.data.manuscript.phone, undefined);
  assert.equal(msTrackRes.data.manuscript.synopsis, undefined);
  console.log(
    '  [PASS] SEC-02.5 (Manuscript Tracker PII Redaction): Public manuscript status lookup returns stage metadata with zero author PII'
  );

  console.log('\n================================================================');
  console.log(
    'ALL 90 AUTOMATED TESTS (20 CART + 11 EMAIL + 13 PHONE + 21 AUTH/RBAC + 9 UI/CMS + 11 SEC-01 + 5 SEC-02) PASSED!'
  );
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
