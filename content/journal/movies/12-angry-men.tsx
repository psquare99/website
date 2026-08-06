import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      I haven't watched <em>12 Angry Men</em> yet.
    </p>

    <p>
      It's been on my watchlist for a long time, and I've heard enough good
      things about it that I know it'll eventually find its way here.
    </p>

    <p>
      Until then, this page is intentionally left blank.
    </p>
  </>
);

export const twelveAngryMen: JournalEntry = {
  slug: "12-angry-men",

  title: "12 Angry Men",

  excerpt:
    "One of the many films waiting patiently on my watchlist.",

  published: "Coming Soon",

  category: "movie",

  paper: "white",

  readingTime: "1 min",

  content,

  status: "coming-soon",
};