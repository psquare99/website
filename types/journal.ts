export type JournalCategory =
  | "book"
  | "game"
  | "movie"
  | "music"
  | "place";

export interface JournalEntry {
  slug: string;
  title: string;
  category: JournalCategory;
  summary: string;
}