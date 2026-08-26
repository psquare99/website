## Summary

Restores journal typography by adding the missing Tailwind Typography plugin.

## Changes

- **Added `@tailwindcss/typography`** as a devDependency
- **Added `@plugin "@tailwindcss/typography";`** in `app/globals.css` after the Tailwind import

## Effect

The journal detail page (`app/journal/[slug]/page.tsx`) already used Tailwind Typography classes:
- `prose prose-lg prose-neutral`
- `prose-p:leading-9 prose-p:text-[#4D463F]`
- `prose-headings:text-[#2C2A28]`
- `prose-blockquote:border-l-[#C7B9A4] prose-blockquote:text-[#6A6258]`

These classes now produce actual CSS output. Previously they were no-ops because the plugin was missing.

## What Was NOT Changed

- `JournalContent.tsx` — no changes
- `journal-adapter.tsx` — no changes (published content keeps its custom inline styles which override prose defaults)
- Studio — no changes
- Publishing contract — no changes

## Verification

- `npm install` ✅ — `@tailwindcss/typography@0.5.20` added with dependencies
- `tsc --noEmit` ✅ — passes
- `eslint` ✅ — no new errors
- `npm run build` ✅ — production build succeeds
- Generated CSS verified to contain all `prose*`, `prose-lg`, `prose-neutral`, and custom modifier rules