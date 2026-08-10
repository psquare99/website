import type { JournalEntry } from "@/types/journal";

import { reflections } from "./reflections";
import { books } from "./books";
import { movies } from "./movies";
import { travel } from "./travel";
import { websites } from "./websites";

export const journal: JournalEntry[] = [
  ...reflections,
  ...books,
  ...movies,
  ...travel,
  ...websites,
];