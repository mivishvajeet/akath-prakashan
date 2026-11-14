# Akath Prakashan

**अकथ प्रकाशन — मराठी साहित्य. नवे आवाज. दीर्घ संवाद.**

Akath Prakashan is an independent Marathi literary publishing platform based in Nanded, Maharashtra. The project brings the publishing house's public-facing website, book catalogue, reader experience, author workflows, editorial content and store operations into one application.

**Live website:** https://akathpublication.arthsankalp.com/

---

## What the platform includes

- **Publishing house website** — publisher profile, editorial principles, publishing services, contact information and manuscript submission.
- **Book catalogue and store** — browse books, view book details, search the catalogue, manage a cart, receive a server-calculated cart quote and proceed through checkout.
- **Reader experience** — reader accounts, profiles, saved addresses, wishlists, reviews, order history and order tracking.
- **Vachankatta (वाचनकट्टा)** — editorial articles, reading lists and first-page excerpts with reader reactions.
- **Author workspace** — author profiles and portal, manuscript submission/resubmission, and author article workflows.
- **Administration and CMS** — administrative views for managing catalogue content, authors, articles, excerpts, reading lists, orders, manuscripts, promotions, site configuration and audit information.
- **Bilingual interface** — Marathi and English interface content.
- **Responsive, installable experience** — web app manifest and mobile-friendly layouts.

The exact availability of account, commerce and administrative operations depends on the deployment mode and its configured services.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Build tooling | Vite |
| Styling | Tailwind CSS 4 |
| Motion and icons | Motion, Lucide React |
| Backend | Node.js, Express, TypeScript (tsx) |
| Authentication | Application-managed sessions and Firebase Authentication integration |
| Cloud data integration | Firebase Authentication and Cloud Firestore |
| Client-side routing | React SPA routing with History API |
| Static data | TypeScript seed data |
| Static hosting support | GitHub Pages adapter; Vercel rewrite configuration |

## Architecture at a glance

The application supports two broad runtime paths:

### 1. Express-backed application

The main entry point is **server.ts**. It hosts the Express API and, in development, the Vite middleware. The React application calls API routes for bootstrap data, authentication, reader and author operations, catalogue management, cart quotes, orders and editorial administration.

The server-side domain logic is organized under **src/server/**:

- **authStore.ts** — user/session/token stores and password/token utilities.
- **cmsStore.ts** — publishing CMS state and related persistence utilities.
- **cloudPersistence.ts** — local snapshot persistence and cloud data synchronization helpers.

The current server implementation uses in-memory application stores and JSON snapshot persistence for parts of its state. Firebase/Firestore integration is also present in the client and supporting configuration. Do not assume that every record is stored in a managed database; review the persistence path used by the deployment before operating it as a production commerce system.

### 2. Static hosting / GitHub Pages

The project includes a static adapter in **src/utils/githubPagesAdapter.ts**. It supplies seeded catalogue and editorial data, handles deployment under a repository subpath, and provides browser-local fallback behavior for supported interactions when the Express API is not available.

A static deployment is not equivalent to the Express-backed application: server-dependent operations, shared multi-user persistence, secure account workflows and authoritative order processing require a correctly configured backend.

## Repository layout

~~~text
.
├── assets/                  # Brand, book and editorial media
├── docs/                    # Static documentation-site assets
├── public/                  # Public static assets and deployment files
├── scripts/                 # Verification and maintenance scripts
├── src/
│   ├── auth/                 # Role-based access control helpers
│   ├── components/           # Shared UI components
│   ├── data/                 # Seed content for books, authors and articles
│   ├── firebase/             # Firebase client and Firestore integration
│   ├── i18n/                 # Marathi and English translations
│   ├── server/               # Authentication, CMS and persistence modules
│   ├── types/                # Publishing and commerce domain types
│   ├── utils/                # Validation, static-host adapter and diagnostics
│   ├── views/                # Store, publishing, author, reader and admin views
│   ├── App.tsx               # Application composition and navigation
│   └── main.tsx              # React entry point
├── server.ts                 # Express API and Vite development server
├── firestore.rules           # Firestore security rules
├── firebase-blueprint.json   # Firebase data/security blueprint
├── firebase-applet-config.json
├── package.json
├── vite.config.ts
└── vercel.json
~~~

## Getting started

### Requirements

- Node.js 20 or newer
- npm (or another package manager compatible with the project lockfile, if present)

### Install dependencies

~~~bash
npm install
~~~

### Configure environment

Copy the example environment file:

~~~bash
cp .env.example .env
~~~

Review every value before running the application. In particular:

- Set a strong, unique **ADMIN_BOOTSTRAP_TOKEN** for server-side administrator provisioning.
- Set a strong, private **PAYMENT_WEBHOOK_SECRET** that matches the payment provider configuration.
- Keep .env, generated bootstrap-token files and other credentials out of version control.
- Configure Firebase Authentication, Firestore and the deployed project's authorized domains/rules if using Firebase-backed features.
- Add **GEMINI_API_KEY** only if using the optional server-side Gemini-assisted authoring features.

Never use example or development secrets in a public deployment.

### Run the Express-backed development server

~~~bash
npm run dev
~~~

The server defaults to port **3000**. Set **PORT** in .env to use a different port.

### Build the frontend

~~~bash
npm run build
~~~

The production frontend bundle is generated in **dist/**.

### Preview the Vite build

~~~bash
npm run preview
~~~

### Start the Express server

~~~bash
npm start
~~~

This starts server.ts through tsx. Configure the runtime environment and persistence location for the target deployment.

### GitHub Pages build

~~~bash
npm run build:gh-pages
~~~

The GitHub Pages adapter supports project-site subpaths and static fallback data. Configure the repository's Pages source to publish the generated static output using the deployment workflow or process you have chosen.

### TypeScript check

~~~bash
npm run lint
~~~

Despite the script name, this command runs **tsc --noEmit**; it is a TypeScript check, not an ESLint invocation.

## Environment variables

The canonical list and example values are maintained in **.env.example**.

| Variable | Purpose |
|---|---|
| PORT | Express server port (default: 3000) |
| NODE_ENV | Runtime environment |
| SESSION_COOKIE_NAME | Name of the session cookie |
| SESSION_TTL_HOURS | Session lifetime in hours |
| ADMIN_BOOTSTRAP_TOKEN | Server-side administrator bootstrap credential |
| PAYMENT_WEBHOOK_SECRET | HMAC secret for payment webhook verification |
| CMS_STORAGE_FILE | Optional path for CMS JSON snapshot persistence |
| GEMINI_API_KEY | Optional server-side Gemini API key |

The persistence layer also supports **AUTH_DB_STORAGE_FILE** as an override for its authentication database snapshot path. Keep all secrets and private runtime data on the server; do not expose them through frontend environment variables.

## Application areas

The main route/view composition lives in **src/App.tsx**. Feature screens are grouped by domain:

- **HomeView.tsx** — publishing house landing page.
- **BooksAndStoreView.tsx** — book catalogue and book detail.
- **VachankattaView.tsx** — editorial hub and article detail.
- **PublishingHouseViews.tsx** — authors, publisher information, manuscript submission and contact.
- **CommerceAndPolicyViews.tsx** — cart, checkout, order tracking and policy pages.
- **AuthAndRoleViews.tsx** — authentication, reader account and author portal.
- **AdminAndAuditViews.tsx** — administration and technical audit screens.

Shared navigation, book cards, search, footer and brand illustrations are under **src/components/**.

## Security and production readiness

Security-sensitive code and policies are included in the repository:

- **src/auth/rbac.ts** contains role and resource-access helpers.
- **firestore.rules** defines Firestore access rules.
- **security_spec.md** documents intended Firestore security invariants.
- **SECURITY_AUDIT_REPORT.md** records a static security assessment and findings.

These documents are not a substitute for a fresh security review. The committed audit report records issues that need careful verification and remediation before production use, particularly around payment verification, administrator provisioning, session handling, webhook configuration and personal-data exposure. Re-audit the current code and deployment configuration before enabling real payments or processing customer data.

For production, use HTTPS, unique secrets, least-privilege service credentials, verified payment-provider webhooks, server-side authorization on every sensitive operation, durable database backups, rate limiting and monitored error/audit logs. Do not expose private user, order, address or manuscript data in public APIs or logs.

If you discover a security vulnerability, do not publish exploit details in a public issue. Contact the project maintainers privately.

## Content and brand

Akath's editorial identity is rooted in Marathi literature, emerging voices and thoughtful publishing. The seed content defines the publisher's Marathi and English identity, editorial principles and the tortoise metaphor: good books take time to grow and are meant to last.

Brand and book media are maintained under **assets/** and **public/**.

## Contributing

Contributions and suggestions are welcome. Before submitting a change:

1. Keep Marathi/Devanagari text intact and verify rendering in both Marathi and English.
2. Preserve existing book, author, order and manuscript data contracts in **src/types/publishing.ts**.
3. Test both root-domain and GitHub Pages subpath behavior when changing routing or asset paths.
4. Review authorization and Firestore rules whenever changing account, author, order or admin flows.
5. Run **npm run lint** and **npm run build**.

## License

This repository is proprietary and all rights are reserved. The terms are set out in the [LICENSE](./LICENSE) file.

Unless you have prior written permission from the applicable rights holder, you may not copy, modify, distribute, publish, sublicense, or create derivative works from the project's original code, design, branding, illustrations, editorial content, or other protected materials.

Third-party dependencies and assets remain subject to their own licenses and terms. This notice does not claim ownership of third-party materials or override rights that cannot be restricted under applicable law.

For permission requests, contact **akathpublication@gmail.com**.
