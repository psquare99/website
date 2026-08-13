import type { JournalEntry } from "@/types/journal";

import {
  journalFromPublishedDocument,
} from "./journal-adapter";

import {
  studioTestPublication,
} from "./fixtures/studio-test";

const publishedDocuments = [
  studioTestPublication,
];

export const publishedJournal: JournalEntry[] =
  publishedDocuments.map(
    journalFromPublishedDocument
  );