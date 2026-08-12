import { ReactNode } from "react";

export type JournalCategory = string;

export type JournalStatus =
  | "published"
  | "draft"
  | "coming-soon";

export type JournalPaper =
  | "cream"
  | "white"
  | "linen"
  | "mist"
  | "sage"
  | "peach";

export type JournalEntry = {
  slug: string;

  title: string;

  excerpt: string;

  content: ReactNode;

  published: string;

  readingTime: string;

  category: JournalCategory;

  paper: JournalPaper;

  image?: {
  src: string;
  alt: string;
};

  featured?: boolean;

  location?: string;

  status: JournalStatus;
};