// Test-time stub for Next.js virtual module "server-only".
//
// In production, Next.js resolves `server-only` via webpack aliases:
//   - Client layer: next/dist/compiled/server-only/empty (no-op)
//   - Server layer: next/dist/compiled/server-only/index (throws — but webpack
//     catches the import at build time via a dedicated rule, so this never runs
//     in a correctly-routed server component)
//
// During tests, tsx uses tsconfig paths for resolution. This stub is referenced
// by the `"server-only"` path alias in tsconfig.json. Webpack's explicit
// resolve.alias in next.config takes precedence over tsconfig paths during
// production builds, so this stub has no effect outside of tsx/test.
//
// The stub is intentionally empty. The build-time guard is enforced by
// Next.js's webpack client-layer rule, not by this module.
export {};
