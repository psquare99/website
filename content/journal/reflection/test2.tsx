import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      this is a test draft
    </p>
  </>
);

export const test2: JournalEntry = {
  slug: "test-2",

  title: "Test 2",

  excerpt: "",

  published: "2026-08-08",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "draft",
};
