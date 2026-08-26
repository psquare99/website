// Admin API — About page (singleton)
// GET /api/admin/about — read
// PUT /api/admin/about — upsert

import { NextRequest } from "next/server";
import { requireAuthentication } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAboutPage, upsertAboutPage } from "@/lib/repository/about";
import type { AboutData } from "@/types/about";

function getDb() {
  const { env } = getCloudflareContext();
  return (env as CloudflareEnv).CONTENT_DB;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// --- GET /api/admin/about ---

export async function GET(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const db = getDb();
    const content = await getAboutPage(db);
    return Response.json({ content });
  } catch (error) {
    console.error("Failed to read about page:", error);
    return jsonError("Failed to read about page", 500);
  }
}

// --- PUT /api/admin/about ---

export async function PUT(request: NextRequest) {
  const session = await requireAuthentication(request);
  if (!session) return jsonError("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const content = body.content as AboutData | undefined;
  if (!content || typeof content !== "object") {
    return jsonError("Missing or invalid content field", 400);
  }

  // Basic structural validation — ensure required sections exist
  const requiredSections = ["intro", "making", "mountains", "reading", "closing"] as const;
  for (const section of requiredSections) {
    if (typeof content[section] !== "object" || content[section] === null) {
      return jsonError(`Missing or invalid section: ${section}`, 400);
    }
  }

  if (!Array.isArray(content.now)) {
    return jsonError("Missing or invalid 'now' array", 400);
  }

  try {
    const db = getDb();
    await upsertAboutPage(db, content);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save about page:", error);
    return jsonError("Failed to save about page", 500);
  }
}
