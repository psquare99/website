import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      A normal paragraph.
    </p>
  </>
);

export const serializertest: JournalEntry = {
  slug: "serializer-test",

  title: "Serializer Test",

  excerpt: "",

  published: "2026-08-08",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "draft",
};
