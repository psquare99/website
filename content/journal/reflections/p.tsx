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
          "text": "Hi, so this is a test post to see if my new app can publish to my website directly or not."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Lets see"
        }
      ]
    }
  ]
};

const content = (
  <>
    <p>
      Hi, so this is a test post to see if my new app can publish to my website directly or not.
    </p>

    <p>
      Lets see
    </p>
  </>
);

export const p: JournalEntry = {
  slug: "h",

  title: "Hello",

  excerpt: "testing",

  published: "2026-08-09",

  category: "reflection",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "published",
};
