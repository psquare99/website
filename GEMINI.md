# P² Website — Gemini Project Context

> AI orientation and workflow guide for the P² / The Long Way Home website.
>
> This file provides project orientation, architectural context, and working guidance for AI coding agents.
> `AGENTS.md` is the authoritative source for repository rules, constraints, and publishing invariants.
> When this file conflicts with `AGENTS.md` or the current repository code, follow the more authoritative source.

---

# 1. PROJECT IDENTITY & PHILOSOPHY

This repository contains the production website and publishing platform for **The Long Way Home** (P² / Prateek Pal).

The site combines:
- Personal writing and journal essays
- Portfolio projects and experiments
- Dynamic standalone pages
- A flippable, structured About page
- An integrated administrative CMS (`/admin`)
- Media asset management and Cloudflare edge delivery

### Design Philosophy
The project is intentionally personal, quiet, literary, and minimal.
- Avoid unnecessary SaaS patterns, heavy animations, generic card stacks, or decorative clutter.
- Visuals favor warm paper-like surfaces, intentional typography (Source Serif 4, Caveat accents), and spacious editorial layouts.
- **Core Principle:** Build a thoughtful, enduring digital home for things worth keeping.

---

# 2. TECHNOLOGY STACK & CLOUDFLARE ARCHITECTURE

The repository uses the Next.js App Router deployed to Cloudflare Workers via OpenNext.

### Core Stack
- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Deployment & Runtime:** OpenNext on Cloudflare Workers ([custom-worker.ts](file:///C:/Projects/website/custom-worker.ts))
- **Email:** Resend for OTP authentication delivery

### Cloudflare Services & Bindings
Cloudflare resource bindings are defined in [wrangler.jsonc](file:///C:/Projects/website/wrangler.jsonc):
- **D1 Database (`CONTENT_DB`):** Structured website data (documents, revisions, categories, redirects, media metadata, and singleton about content).
- **KV Namespace (`AUTH_SESSIONS`):** Ephemeral authentication sessions and OTP challenges.
- **R2 Bucket (`MEDIA_BUCKET`):** Storage for published media assets, served via `R2_PUBLIC_URL_BASE`.
- **Worker Service Binding (`WORKER_SELF_REFERENCE`):** Used by the worker's scheduled handler for internal cron-triggered requests.

> Always inspect [package.json](file:///C:/Projects/website/package.json) and [wrangler.jsonc](file:///C:/Projects/website/wrangler.jsonc) for exact versions, IDs, and configuration rather than assuming them.

---

# 3. REPOSITORY & ROUTE ORGANIZATION

The codebase is organized into three primary layers:

### 1. Public Application (`app/(public)/`)
- Wrapped by [app/(public)/layout.tsx](file:///C:/Projects/website/app/(public)/layout.tsx) with site-wide Navbar and Footer.
- Includes Home (`page.tsx`), Journal (`journal/`), Projects (`projects/`), About (`about/`), and dynamic standalone pages (`[slug]/`).

### 2. Administrative CMS (`app/(admin)/` and `app/admin/`)
- **Admin Shell:** [app/(admin)/layout.tsx](file:///C:/Projects/website/app/(admin)/layout.tsx) provides the protected layout (sidebar navigation + session auth guard).
- **Admin Pages:** Located in [app/(admin)/admin/](file:///C:/Projects/website/app/(admin)/admin) for managing documents, categories, media, and the About page.
- **Login:** [app/admin/login/](file:///C:/Projects/website/app/admin/login) lives outside the `(admin)` route group to allow unauthenticated access.

### 3. APIs & Worker Services (`app/api/` & `custom-worker.ts`)
- **Admin API (`app/api/admin/`):** Authenticated endpoints for CRUD operations, OTP auth, publishing, and media handling.
- **Cron API (`app/api/cron/`):** Internal endpoint for executing scheduled publishing routines.
- **Worker Entry ([custom-worker.ts](file:///C:/Projects/website/custom-worker.ts)):** Exports the fetch handler and Cloudflare `scheduled()` event handler.

### 4. Shared Application Code
- [lib/](file:///C:/Projects/website/lib): Domain entities, database repositories, publishing adapters, authentication logic, and email helpers.
- [components/](file:///C:/Projects/website/components): UI components partitioned into public components, admin components, and about presentation components.

---

# 4. CONTENT MODELS & DATA LAYER

Content in D1 falls into two distinct models:

### 1. Versioned Documents (`documents` table)
- Three fixed application content types: `journal`, `project`, and `page`.
- Governed by **Publishing Contract v0.1**.
- Full historical snapshots are stored in `document_revisions` upon publication.
- Slugs and categories are scoped per content type.
- Legacy URLs are preserved in the `redirects` table on slug updates.

### 2. Structured Singleton About Page (`about_page` table)
- Stored as a dedicated JSON singleton record in the `about_page` table ([migrations/0004_about_page.sql](file:///C:/Projects/website/migrations/0004_about_page.sql)).
- Schema defined in [types/about.ts](file:///C:/Projects/website/types/about.ts) (`AboutData`).
- Handled through dedicated repository functions in [lib/repository/about.ts](file:///C:/Projects/website/lib/repository/about.ts) ([`getAboutPage`](file:///C:/Projects/website/lib/repository/about.ts#L65), [`upsertAboutPage`](file:///C:/Projects/website/lib/repository/about.ts#L88)).
- Managed via the admin editor at [app/(admin)/admin/about/](file:///C:/Projects/website/app/(admin)/admin/about) and rendered on the public `/about` page.

---

# 5. PUBLISHING & CRON ARCHITECTURE

Publishing is designed to be deterministic and safe:

### Document Lifecycle & Revisions
- Five statuses: `draft`, `published`, `modified`, `scheduled`, `unpublished`.
- Public queries fetch the latest published snapshot revision, ensuring unpublished draft modifications do not leak to public pages.
- Database CHECK constraints enforce scheduling consistency: `status = 'scheduled' ⟺ scheduled_at IS NOT NULL`.

### Scheduled Publishing Mechanism
1. Cloudflare Cron Trigger fires on schedule (e.g., `*/5 * * * *`).
2. The `scheduled()` event in [custom-worker.ts](file:///C:/Projects/website/custom-worker.ts) is invoked.
3. The worker uses `env.WORKER_SELF_REFERENCE` to issue an internal HTTP GET request to `/api/cron/publish` with a Bearer `CRON_SECRET` header.
4. `/api/cron/publish` validates `CRON_SECRET`, identifies due scheduled documents (`scheduled_at <= now()`), promotes them to `published`, and generates corresponding published revisions.

---

# 6. AUTHENTICATION & SESSION ARCHITECTURE

Admin authentication uses a passwordless One-Time Password (OTP) flow backed by Cloudflare KV and Resend:

1. **OTP Request:** Admin enters their email at `/admin/login` → POST `/api/admin/auth/request-otp` generates a time-limited OTP stored in KV (`AUTH_SESSIONS`) and sends the code via Resend ([lib/email/index.ts](file:///C:/Projects/website/lib/email/index.ts)).
2. **OTP Verification:** Admin submits OTP → POST `/api/admin/auth/verify-otp` validates the challenge, creates a persistent session token in KV, and sets an HTTP-only `admin_session` cookie.
3. **Session Verification:** Protected admin routes and APIs verify the session cookie against KV via [lib/auth.ts](file:///C:/Projects/website/lib/auth.ts).
4. **Layout Protection:** [app/(admin)/layout.tsx](file:///C:/Projects/website/app/(admin)/layout.tsx) validates the session on the server side and redirects unauthenticated users to `/admin/login`.

> Never expose, log, or hardcode secrets, tokens, or email API keys.

---

# 7. SOURCE-OF-TRUTH HIERARCHY & AI RULES

When working in this repository, resolve questions using this priority hierarchy:

1. **Current Repository Code** (Source of truth for runtime behavior)
2. **`AGENTS.md`** (Authoritative repository rules and constraints)
3. **Current Tests & Database Migrations**
4. **Current Configuration Files** (`wrangler.jsonc`, `package.json`)
5. **Task-Specific Design Briefs**
6. **`GEMINI.md`** (Orientation, workflow, and architecture guide)
7. **`docs/ai/Developer_Toolbox.md`** (External reference & discovery catalogue)

### Important Rule: Do Not Guess
Always distinguish between:
- **Verified:** Directly confirmed from code, schema, config, or test output.
- **Inferred:** A reasonable deduction based on verified evidence.
- **Unknown:** Information not present in the repository.

If requirements are ambiguous, destructive, or missing critical context, ask for clarification before acting.

---

# 8. PRESENTATION VS. DATA BOUNDARIES

When performing frontend or presentation changes:
- Keep presentation refactors strictly decoupled from data schemas.
- Do not alter D1 schemas, data types, admin CMS editors, or API contracts unless the task explicitly requires a full-stack data migration.
- Reuse existing database fields and media URLs whenever implementing new visual concepts.

---

# 9. DISCOVER BEFORE BUILDING

Follow the core project principle:
> **Build the unique parts. Borrow the boring parts.**

Before writing complex custom algorithms, UI widgets, or infrastructure:
1. Consult [docs/ai/Developer_Toolbox.md](file:///C:/Projects/website/docs/ai/Developer_Toolbox.md) for established libraries, public APIs, or architectural patterns.
2. Evaluate candidates for maintenance, bundle size, licensing, security, and stack compatibility.
3. Prefer mature, boring, and lightweight solutions over sprawling dependencies or unnecessary abstractions.

---

# 10. AI ENGINEERING WORKFLOW & SAFETY

Follow this systematic sequence for non-trivial tasks:

```
Inspect → Understand → Search → Plan → Implement → Verify → Review → Report
```

### Safety Principles
- **Git Safety:** Never silently overwrite, reset, or delete user work. Never commit unless explicitly instructed.
- **Database Safety:** D1 is production infrastructure. Treat migrations, CHECK constraints, and unique indexes with high care.
- **Media Safety:** Preserve existing R2 URLs and avoid creating orphan or duplicate media.

### Validation Commands
- **Run Tests:** `npm test` (Runs Node's native test runner with tsx across `lib/__tests__/*.test.ts` using in-memory D1/KV mocks)
- **Type Check:** `npx tsc --noEmit`
- **Build Verification:** `npm run build`
- **Linting:** `npm run lint`

Never report that a check or build passed without executing and verifying it.