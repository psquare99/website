// Cloudflare Workers environment bindings
// Generated for Durable V1 publishing backend

/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  // D1 Database
  CONTENT_DB: D1Database;

  // KV Namespace (auth sessions + OTP challenges)
  AUTH_SESSIONS: KVNamespace;

  // R2 Bucket (media)
  MEDIA_BUCKET: R2Bucket;

  // Shared secret for admin authentication
  ADMIN_SECRET: string;

  // Shared secret for cron endpoint authentication
  CRON_SECRET: string;

  // Assets
  ASSETS: { fetch: typeof fetch };

  // Images
  IMAGES: { fetch: typeof fetch };

  // Worker self-reference
  WORKER_SELF_REFERENCE: { fetch: typeof fetch };
}
