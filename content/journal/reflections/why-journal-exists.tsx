import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      I don't think every interesting idea deserves to become software.
    </p>

    <p>
      Some ideas become observations. Some become conversations.
      Some become memories I'd like to revisit years from now.
    </p>

    <p>
      For a long time, I tried turning every curiosity into a project.
      Eventually I realized some thoughts don't want to become products.
      They simply want to be written down.
    </p>

    <p>
      This notebook is where those thoughts live.
    </p>
  </>
);

export const whyJournalExists: JournalEntry = {
  slug: "why-this-journal-exists",

  title: "Why this journal exists",

  excerpt:
    "I don't think every interesting idea deserves to become software. Some become observations, conversations and memories I'd like to revisit years from now.",

  content,

  published: "August 2026",

  paper: "cream",

  readingTime: "2 min",
};