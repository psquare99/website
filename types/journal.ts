import { ReactNode } from "react";

export type Paper =
  | "cream"
  | "sage"
  | "mist"
  | "peach"
  | "linen";

export interface JournalImage {
  src: string;
  alt: string;
}

export interface JournalEntry {
  slug: string;

  title: string;

  excerpt: string;

  content: ReactNode;

  published: string;

  paper: Paper;

  image?: JournalImage;

  category?: string;

  readingTime?: string;
}