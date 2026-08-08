import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <h2><strong>This</strong> is a test from the new journal <em>publisher.</em></h2>

    <blockquote>
      It is a small experiment to see whether I can write from anywhere and send it directly to my website.
    </blockquote>
  </>
);

export const publishertest: JournalEntry = {
  slug: "publisher-test",

  title: "Publisher Test",

  excerpt: "Testing the new journal publisher.",

  published: "August 2026",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "draft",
};
