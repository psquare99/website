## Summary

Replaces the failing dynamic `/opengraph-image` edge function with a static pre-generated OG image.

## Changes

- **Deleted**: `app/opengraph-image.tsx` (81-line edge function using `next/og` `ImageResponse` that returned 500 in production)
- **Added**: `public/opengraph-image.png` (static 1200×630 PNG matching the original design)
- **Updated**: All 6 fallback references from `/opengraph-image` → `/opengraph-image.png`:
  - `app/layout.tsx` (root metadata)
  - `app/page.tsx` (homepage)
  - `app/about/page.tsx`
  - `app/journal/page.tsx` (journal index)
  - `app/projects/page.tsx` (projects index)
  - `app/journal/[slug]/page.tsx` (journal detail fallback)

## What Was NOT Changed

- Project-specific OG images (`project.primaryImage` via R2 URLs) — unchanged
- Journal entry-specific images (`entry.image.src`) — unchanged
- P0-4 metadata behavior — unchanged
- P0-5 journal typography — unchanged
- P0-6 Workshop bridge — unchanged
- Studio / Supabase / P0-8 / P0-9 / sitemap / docs/PROJECT-PAGE-SYSTEM.md — untouched

## Verification

- `tsc --noEmit` ✅ pass
- `eslint` ✅ no new errors
- `npm run build` ✅ production build succeeds
- No remaining `/opengraph-image` references without `.png` ✅
- Static asset included in build output ✅
- All 6 fallback pages reference `/opengraph-image.png` ✅
- Project/journal dynamic images preserved ✅