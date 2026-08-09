import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const editorDocument = {
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Testing this from Android "
        }
      ]
    }
  ]
};

const content = (
  <>
    <p>
      Testing this from Android 
    </p>
  </>
);

export const testing: JournalEntry = {
  slug: "testing",

  title: "Testing",

  excerpt: "test",

  published: "2026-08-09",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "published",
};
