// Custom Worker: wraps OpenNext's fetch handler and adds a scheduled handler
// for Cloudflare Cron Triggers.
//
// How cron works:
// 1. Cloudflare Cron Trigger fires → scheduled() is invoked
// 2. scheduled() uses WORKER_SELF_REFERENCE to call /api/cron/publish
//    with CRON_SECRET as a Bearer token
// 3. The /api/cron/publish route verifies the token and runs the scheduler
//
// This is secure because:
// - The public HTTP endpoint still requires CRON_SECRET auth
// - Only the Worker itself can invoke via WORKER_SELF_REFERENCE
// - CRON_SECRET is a wrangler secret, not hardcoded

// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(
    event: ScheduledController,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ) {
    console.log("[CRON] Scheduled event fired at", new Date(event.scheduledTime).toISOString());

    try {
      const response = await env.WORKER_SELF_REFERENCE.fetch(
        new Request("http://localhost/api/cron/publish", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${env.CRON_SECRET}`,
          },
        })
      );

      const body = await response.text();
      console.log(`[CRON] Response ${response.status}: ${body}`);
    } catch (error) {
      console.error("[CRON] Failed to invoke publish endpoint:", error);
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;
