// About page — public server-only data access
// Follows the same pattern as published-journal.ts / public-read.ts.

import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AboutData } from "@/types/about";
import { getAboutPage } from "@/lib/repository/about";

export async function getAboutContent(): Promise<AboutData | null> {
  const { env } = getCloudflareContext();
  return getAboutPage((env as CloudflareEnv).CONTENT_DB);
}
