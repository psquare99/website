// Cron endpoint for scheduled publishing
// Called by Cloudflare Workers cron trigger via OpenNext
// Requires CRON_SECRET as Bearer token in Authorization header

import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { publishScheduledDocuments } from "@/lib/scheduler";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function getCronSecret(): string {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CRON_SECRET;
}

function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  const expected = `Bearer ${getCronSecret()}`;
  // Constant-time comparison to prevent timing attacks
  if (authHeader.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < authHeader.length; i++) {
    result |= authHeader.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const results = await publishScheduledDocuments(db);

    return Response.json({
      published: results.length,
      documents: results,
    });
  } catch (error) {
    console.error("Cron publish failed:", error);
    return Response.json(
      { error: "Failed to publish scheduled documents" },
      { status: 500 }
    );
  }
}

// POST also works for manual trigger (same auth required)
export async function POST(request: NextRequest) {
  return GET(request);
}
