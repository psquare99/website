// About page repository — singleton D1 record
// Follows the same direct-D1-prepared-statement pattern as documents.ts.

import type { AboutData } from "@/types/about";

const ABOUT_ID = "about";

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface AboutRow {
  id: string;
  content: string;
  updated_at: string;
}

function emptyAboutData(): AboutData {
  return {
    intro: {
      eyebrow: "",
      heading: "",
      text: "",
      signature: "",
      image: "",
      imageAlt: "",
    },
    making: {
      heading: "",
      text: "",
      image: "",
      imageAlt: "",
      linkLabel: "",
      linkUrl: "",
    },
    mountains: {
      heading: "",
      text: "",
      location: "",
      image: "",
      imageAlt: "",
    },
    reading: {
      heading: "",
      text: "",
      bookTitle: "",
      bookAuthor: "",
      bookCover: "",
      bookCoverAlt: "",
    },
    now: [],
    closing: {
      eyebrow: "",
      heading: "",
      text: "",
      signature: "",
    },
  };
}

export async function getAboutPage(
  db: D1Database
): Promise<AboutData | null> {
  const row = await db
    .prepare("SELECT * FROM about_page WHERE id = ?")
    .bind(ABOUT_ID)
    .first<AboutRow>();

  if (!row) return null;

  const raw = safeJsonParse<Partial<AboutData>>(row.content, {});
  const empty = emptyAboutData();

  return {
    intro: { ...empty.intro, ...(raw.intro ?? {}) },
    making: { ...empty.making, ...(raw.making ?? {}) },
    mountains: { ...empty.mountains, ...(raw.mountains ?? {}) },
    reading: { ...empty.reading, ...(raw.reading ?? {}) },
    now: Array.isArray(raw.now) ? raw.now : [],
    closing: { ...empty.closing, ...(raw.closing ?? {}) },
  };
}

export async function upsertAboutPage(
  db: D1Database,
  content: AboutData
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO about_page (id, content, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         content = excluded.content,
         updated_at = excluded.updated_at`
    )
    .bind(ABOUT_ID, JSON.stringify(content), now)
    .run();
}
