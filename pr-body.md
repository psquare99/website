## Summary

Adds canonical URLs and page-specific metadata across all public routes.

## Changes

- **Static page metadata** (`export const metadata`):
  - Homepage (`/`): explicit metadata with canonical `/`
  - About (`/about`): unique title, description, canonical `/about`
  - Journal index (`/journal`): unique title, description, canonical `/journal`
  - Projects index (`/projects`): unique title, description, canonical `/projects`

- **Dynamic page metadata** (`export async function generateMetadata`):
  - Journal entries (`/journal/[slug]`): reuses `getPublishedJournal()` + `journal` content loader
  - Project pages (`/projects/[slug]`): reuses `getProject(slug)` from `@/lib/projects`

- **Root layout**: removed `alternates.canonical: "/"` to stop deep pages inheriting homepage canonical

- **OpenGraph/Twitter**: included for all pages; dynamic pages use entry/project images when available, fallback to site-wide `/opengraph-image`

## Intentionally excluded

- **Sitemap** (`app/sitemap.ts`): left unchanged — will be addressed in P1-6
- **Dynamic OG image generation** (`app/opengraph-image.tsx`): left unchanged — remains separate P0-7 milestone
- **Publishing/content loaders/types**: no modifications
- **Studio**: no modifications

## Verification

- `tsc --noEmit`: ✅ pass
- `eslint`: ✅ no new errors (pre-existing only)
- `npm run build`: ✅ production build succeeds
- All 7 routes verified with unique canonical URLs and metadata