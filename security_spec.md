# Akath Prakashan — Phase 0 Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: Any path not explicitly matched in `firestore.rules` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication**: Every client write operation requires `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Admin Verification without Custom Claims**: Admin status is determined strictly via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or verified runtime bootstrap email (`request.auth.token.email == 'vishudhawle11111@gmail.com' && request.auth.token.email_verified == true`).
4. **Prevent Self-Assigned Roles**: When creating a `users/{userId}` document, a user can never self-assign `role == 'admin'`, `role == 'staff'`, or `role == 'author'` (unless they are already a verified admin). Public sign-ups must set `role == 'reader'`.
5. **PII Isolation**: `users/{userId}`, `addresses/{addressId}`, `orders/{orderId}`, and `manuscripts/{manuscriptId}` contain PII (emails, phone numbers, physical addresses). Reads (`get` and `list`) are strictly restricted to the document owner (`resource.data.ownerUid == request.auth.uid` or `resource.data.userId == request.auth.uid`) or `isAdmin()`.
6. **Immutability of Ownership & Creation Fields**: `id`, `ownerUid`, `userId`, `authorUserId`, and `createdAt` / `submittedAt` cannot be mutated during `update`.
7. **Terminal State Locking**: Once an order reaches `delivered` or `cancelled`, or a manuscript reaches `accepted` or `declined`, non-admin users cannot mutate the document.
8. **Strict Key & Volumetric Boundaries**: Every `isValid[Entity]` helper enforces `.keys().hasAll(...)`, `.keys().hasOnly(...)`, and explicit `.size()` bounds on every string and list.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Privilege Escalation on Registration)**: Authenticated user creates `/users/uid1` with `role: "admin"`. -> **Expected: PERMISSION_DENIED**.
2. **Payload 2 (Shadow Field Injection on Update)**: Owner updates `/users/uid1` adding undeclared field `isSuperAdmin: true`. -> **Expected: PERMISSION_DENIED** (`affectedKeys().hasOnly(...)` blocks it).
3. **Payload 3 (Unverified Email Spoofing)**: Attacker with `email: "vishudhawle11111@gmail.com"` and `email_verified: false` attempts admin write. -> **Expected: PERMISSION_DENIED**.
4. **Payload 4 (Cross-User PII Read)**: Authenticated user `uid2` attempts `get(/users/uid1)` or `get(/addresses/addr1)` owned by `uid1`. -> **Expected: PERMISSION_DENIED**.
5. **Payload 5 (Blanket List Scraping)**: Authenticated user runs unconstrained `list(/orders)` without filtering `where('userId', '==', request.auth.uid)`. -> **Expected: PERMISSION_DENIED**.
6. **Payload 6 (ID Poisoning / Denial of Wallet)**: Attacker attempts to create `/addresses/{2000_char_junk_id}`. -> **Expected: PERMISSION_DENIED** (`isValidId()` rejects >128 chars or invalid regex).
7. **Payload 7 (Ownership Hijack on Update)**: User updates `/addresses/addr1` changing `userId` from `uid1` to `uid2`. -> **Expected: PERMISSION_DENIED** (immutability gate).
8. **Payload 8 (Terminal Order Mutation)**: User attempts to update `/orders/ord1` after `status == 'delivered'`. -> **Expected: PERMISSION_DENIED** (terminal state lock).
9. **Payload 9 (Value Poisoning on Whitelisted Key)**: User updates `/users/uid1` setting `name` to a boolean `true` or a 10,000-character string. -> **Expected: PERMISSION_DENIED** (`isValidUserProfile(incoming())` wraps the update block).
10. **Payload 10 (Orphaned Review Creation)**: User creates `/reviews/rev1` with `userId` not matching `request.auth.uid` or invalid rating `99`. -> **Expected: PERMISSION_DENIED**.
11. **Payload 11 (Unbounded Wishlist Array)**: User updates `/users/uid1` with a `wishlistBookIds` array of 500 elements or non-string item. -> **Expected: PERMISSION_DENIED**.
12. **Payload 12 (Unauthorized Admin Registry Write)**: Non-admin user attempts to create `/admins/uid2`. -> **Expected: PERMISSION_DENIED**.
