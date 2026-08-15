import "server-only";

import type { JournalEntry } from "@/types/journal";

import {
  publishedJournals,
} from "./generated/published-content";

import {
  journalFromPublishedDocument,
} from "./journal-adapter";

export function getPublishedJournal(): JournalEntry[] {
  return publishedJournals.map(
    (document) =>
      journalFromPublishedDocument(
        document
      )
  );
}