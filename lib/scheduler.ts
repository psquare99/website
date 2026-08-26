// Scheduler: publish documents whose scheduled_at has passed
//
// Designed to run in two contexts:
// 1. Cron trigger (preferred): Cloudflare Workers cron fires the worker
//    which routes to /api/cron/publish via OpenNext
// 2. Manual trigger: GET /api/admin/schedule triggers the same logic

import type { Document } from "@/lib/domain/document";
import { getDocuments } from "@/lib/repository/documents";
import { publishDocument, type PublishResult } from "@/lib/publishing/publish";

export type { PublishResult };

export async function publishScheduledDocuments(
  db: D1Database
): Promise<PublishResult[]> {
  const now = new Date().toISOString();

  const scheduled = await getDocuments(db, undefined, "scheduled");

  const due = scheduled.filter(
    (doc) => doc.scheduledAt && doc.scheduledAt <= now
  );

  if (due.length === 0) return [];

  const results: PublishResult[] = [];

  for (const doc of due) {
    try {
      const result = await publishDocument(db, doc);
      results.push(result);
    } catch (error) {
      console.error(
        `Failed to publish scheduled document ${doc.id}:`,
        error
      );
    }
  }

  return results;
}
