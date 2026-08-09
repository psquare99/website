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
          "text": "Edited from the Android App "
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Okay, so I don't remember buying a ton of books from my local bookstore in Kanpur, but I 100% remember picking up "
        },
        {
          "type": "text",
          "text": "Sapiens",
          "marks": [
            {
              "type": "italic"
            }
          ]
        },
        {
          "type": "text",
          "text": ". I'm still not sure what caught my attention first the cover or the title casually claiming it could explain all of humanity in one book but I bought it on a whim, and it ended up quietly changing the way I look at the world."
        }
      ]
    },
    {
      "type": "paragraph"
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "What I loved about it"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Harari has this incredible ability to take things we almost never stop to question money, religion, nations, even human rights and ask, \"What if these only exist because we all collectively believe they do?\" This is the idea that most intrigued me."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The chapter about gossip and shared stories completely caught me off guard. The idea that civilizations are built on stories we choose to believe sounded absurd at first... until it didn't."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "For a book covering nearly seventy thousand years of history, it never felt like a textbook. It reads with the curiosity of someone trying to understand humanity rather than simply list historical events."
        }
      ]
    },
    {
      "type": "paragraph"
    },
    {
      "type": "paragraph"
    },
    {
      "type": "image",
      "attrs": {
        "src": "/images/journal/book/the-book-that-made-me-question-everything/favourite-page.jpg",
        "alt": "",
        "width": null,
        "height": null,
        "pendingId": null,
        "caption": ""
      }
    },
    {
      "type": "paragraph"
    },
    {
      "type": "paragraph"
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The idea that stayed with me"
        }
      ]
    },
    {
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Large groups of strangers can cooperate because they believe in the same stories."
            }
          ]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Once that idea clicked, I couldn't stop seeing it everywhere. Money. Countries. Companies. Even fandoms. None of them are physical objects in the way a mountain or a river is. They're shared ideas powerful enough to organize millions of people."
        }
      ]
    },
    {
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "text": "Would I recommend it?"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Absolutely. Whether you're interested in history, psychology or simply enjoy books that challenge the way you think, "
        },
        {
          "type": "text",
          "text": "Sapiens",
          "marks": [
            {
              "type": "italic"
            }
          ]
        },
        {
          "type": "text",
          "text": " is worth reading."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "It isn't a perfect book, and I'm sure historians would disagree with parts of it, but that was never why it stayed with me. It stayed with me because it taught me to question assumptions I didn't even know I had. That's a rare thing for a book to do."
        }
      ]
    }
  ]
};

const content = (
  <>
    <p>
      Edited from the Android App 
    </p>

    <p>
      Okay, so I don't remember buying a ton of books from my local bookstore in Kanpur, but I 100% remember picking up <em>Sapiens</em>. I'm still not sure what caught my attention first the cover or the title casually claiming it could explain all of humanity in one book but I bought it on a whim, and it ended up quietly changing the way I look at the world.
    </p>

    <p>

    </p>

    <p>
      What I loved about it
    </p>

    <p>
      Harari has this incredible ability to take things we almost never stop to question money, religion, nations, even human rights and ask, "What if these only exist because we all collectively believe they do?" This is the idea that most intrigued me.
    </p>

    <p>
      The chapter about gossip and shared stories completely caught me off guard. The idea that civilizations are built on stories we choose to believe sounded absurd at first... until it didn't.
    </p>

    <p>
      For a book covering nearly seventy thousand years of history, it never felt like a textbook. It reads with the curiosity of someone trying to understand humanity rather than simply list historical events.
    </p>

    <p>

    </p>

    <p>

    </p>

    <figure className="journal-image journal-image-right">
        <div className="overflow-hidden rounded-2xl">
          <Image
            src="/images/journal/book/the-book-that-made-me-question-everything/favourite-page.jpg"
            alt=""
            width={1200}
            height={900}
            className="h-auto w-full object-cover"
          />
        </div>
      </figure>

    <p>

    </p>

    <p>

    </p>

    <p>
      The idea that stayed with me
    </p>

    <blockquote className="clear-journal-float">
      Large groups of strangers can cooperate because they believe in the same stories.
    </blockquote>

    <p>
      Once that idea clicked, I couldn't stop seeing it everywhere. Money. Countries. Companies. Even fandoms. None of them are physical objects in the way a mountain or a river is. They're shared ideas powerful enough to organize millions of people.
    </p>

    <h2 className="clear-journal-float">Would I recommend it?</h2>

    <p>
      Absolutely. Whether you're interested in history, psychology or simply enjoy books that challenge the way you think, <em>Sapiens</em> is worth reading.
    </p>

    <p>
      It isn't a perfect book, and I'm sure historians would disagree with parts of it, but that was never why it stayed with me. It stayed with me because it taught me to question assumptions I didn't even know I had. That's a rare thing for a book to do.
    </p>
  </>
);

export const sapiens: JournalEntry = {
  slug: "the-book-that-made-me-question-everything",

  title: "The Book That Made Me Question Everything",

  excerpt: "I picked up Sapiens on a whim from a bookstore in Kanpur. I finished it seeing money, nations and even companies in a completely different way.",

  published: "2026-08-09",

  category: "book",

  paper: "linen",

  readingTime: "2 min",

  content,

  status: "published",
};
