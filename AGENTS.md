# AGENTS.md

## Project

This is the personal website of Prateek Pal, "The Long Way Home".

The website is a Next.js application using:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- OpenNext for Cloudflare Workers

The website contains:
- Homepage
- Journal
- Projects
- Pages
- Admin (`/admin`) — protected publishing backend

## Architecture

This is a single codebase: website = public site + protected `/admin`.

There is no standalone Studio. No Supabase. No GitHub-based publishing.

Published content lives in D1 (database) and is read at request time via `force-dynamic`.

### Content Types

Three fixed, hardcoded application-level content types:
- `journal` — diary-style entries
- `project` — portfolio projects
- `page` — standalone pages (about, etc.)

These are NOT a generic CMS.

### Storage

- **D1** — content database (documents, revisions, redirects, categories)
- **R2** — media storage (published images)
- **KV** — auth sessions + OTP challenges

### Document Model

Five statuses: `draft`, `published`, `modified`, `scheduled`, `unpublished`.

Unpublish contract: `publishedAt` preserved (history), `publishedSlug` cleared, `scheduledAt` cleared, editorial `slug`/`title`/`metadata`/`blocks` preserved, no redirect created.

`scheduled_at` consistency: DB-level CHECK constraint enforces `status = 'scheduled' ⟺ scheduled_at IS NOT NULL`.

### Publishing Contract

Published documents follow Publishing Contract v0.1.

Important concepts include:
- `contractVersion`
- `id`
- `contentType`
- `slug`
- `publishedAt`
- `metadata`
- `blocks`

Do not change the publishing contract without explicitly discussing the consequences first.

### Title/Slug Source-of-Truth

Top-level `document.title` and `document.slug` are authoritative.

`metadata.title`/`metadata.slug` are editorial/legacy copies that may diverge.

### Revision Query

Composite index `(document_id, label, created_at)`.

Current published revision = `WHERE document_id = ? AND label = 'published' ORDER BY created_at DESC LIMIT 1`.

### Slug-Conflict Policy

Reject with 409 rather than allow slug reuse. Check runs on every publish.

### Redirect Uniqueness

Scoped per content type: composite unique index `idx_redirects_content_type_old_slug ON redirects (content_type, old_slug)`.

### Images

Published images are stored in Cloudflare R2.

Published documents contain absolute R2 URLs.

Do not replace or rewrite image URLs without understanding the existing image pipeline.

### Page Metadata

Intentionally minimal — `description?: string`, `navigationLabel?: string`.

Pages are content, not structured data.

Navigation is presentation — Page model does NOT assume every page appears in Navbar.

### Page Block Types

Same as journal — `paragraph`, `heading`, `quote`, `image`.

## Layout Structure

### Route Groups

- `app/(public)/` — public pages with Navbar + Footer
- `app/admin/` — protected admin pages with admin shell (sidebar nav + auth guard)
- `app/admin/login/` — login page (outside admin layout, no auth required)
- `app/api/admin/` — API routes (auth, documents, session)

### Root Layout

`app/layout.tsx` — html, body, fonts, Google Analytics. No Navbar/Footer.

### Public Layout

`app/(public)/layout.tsx` — wraps public pages with Navbar + Footer.

### Admin Layout

`app/admin/layout.tsx` — admin shell with sidebar navigation, auth guard, logout button.

Auth guard: checks session cookie, redirects to `/admin/login` if not authenticated.

### Auth

- `lib/auth.ts` — core auth functions (getSession, requireAuthentication, etc.)
- `lib/auth-utils.ts` — pure testable auth functions
- `SESSION_COOKIE_NAME = "admin_session"`
- `ADMIN_SECRET` env var (set in `.dev.vars` for dev)
- OTP flow: request-otp → verify-otp → session cookie

## Development Rules

Before modifying code:

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Explain the intended change.
4. Keep the change narrowly scoped.
5. Do not refactor unrelated code.

When possible, verify changes with the appropriate build, type-check, lint, or test command.

## Testing

Run tests: `npm test`
Type check: `npx tsc --noEmit`
Build: `npm run build`

Test infrastructure:
- `lib/__tests__/` — unit and integration tests
- `scripts/lib/` — script tests
- MockD1, MockKV for testing without real Cloudflare services
- Real-D1 smoke tests available via `scripts/`

## Git Safety

Do not commit changes unless explicitly asked.

Do not reset, delete, or overwrite user work.

Before making significant changes, inspect the Git working tree.

Always keep unrelated changes untouched.

## Design Philosophy

The website should remain:
- minimal
- calm
- content-focused
- personal
- readable
- spacious
- intentional

Avoid unnecessary UI complexity, animations, abstractions, or dependencies.

Prefer simple solutions that fit the existing architecture.

## Important Principle

When uncertain, inspect the code and existing documentation rather than guessing.

Clearly distinguish between:
- verified facts
- reasonable inference
- unknown behavior

Never present an inference as a verified fact.
