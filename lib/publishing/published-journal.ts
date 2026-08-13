import "server-only";

import fs from "node:fs";
import path from "node:path";

import type { JournalEntry } from "@/types/journal";
import type { PublishedDocument } from "./journal-adapter";

import { journalFromPublishedDocument } from "./journal-adapter";

const PUBLISHED_JOURNAL_DIR = path.join(
  process.cwd(),
  "content",
  "published",
  "journal"
);

function readPublishedJournalDocuments(): PublishedDocument[] {
  if (!fs.existsSync(PUBLISHED_JOURNAL_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PUBLISHED_JOURNAL_DIR)
    .filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const filePath = path.join(
      PUBLISHED_JOURNAL_DIR,
      file
    );

    const raw = fs.readFileSync(
      filePath,
      "utf-8"
    );

    return JSON.parse(
      raw
    ) as PublishedDocument;
  });
}

export function getPublishedJournal(): JournalEntry[] {
  const publishedDocuments =
    readPublishedJournalDocuments();

  return publishedDocuments.map(
    journalFromPublishedDocument
  );
}