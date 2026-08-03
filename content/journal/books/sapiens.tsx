import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      Okay, so I don't remember buying a ton of books from my local bookstore
      in Kanpur, but I 100% remember picking up <em>Sapiens</em>. I'm still not
      sure what caught my attention first—the cover or the title casually
      claiming it could explain all of humanity in one book—but I bought it on
      a whim, and it ended up quietly changing the way I look at the world.
    </p>

    <Image
      src="/images/journal/books/sapiens/my-copy.jpg"
      alt="My copy of Sapiens"
      width={1200}
      height={900}
      className="my-10 rounded-2xl"
    />

    <h2>What I loved about it</h2>

    <p>
      Harari has this incredible ability to take things we almost never stop to
      question—money, religion, nations, even human rights—and ask,
      "What if these only exist because we all collectively believe they do?"
    </p>

    <p>
      The chapter about gossip and shared stories completely caught me off
      guard. The idea that civilizations are built on stories we choose to
      believe sounded absurd at first... until it didn't.
    </p>

    <p>
      For a book covering nearly seventy thousand years of history, it never
      felt like a textbook. It reads with the curiosity of someone trying to
      understand humanity rather than simply list historical events.
    </p>

    <Image
      src="/images/journal/books/sapiens/favourite-page.jpg"
      alt="A highlighted page from my copy of Sapiens"
      width={1200}
      height={900}
      className="my-10 rounded-2xl"
    />

    <h2>The idea that stayed with me</h2>

    <blockquote>
      Large groups of strangers can cooperate because they believe in the same
      stories.
    </blockquote>

    <p>
      Once that idea clicked, I couldn't stop seeing it everywhere. Money.
      Countries. Companies. Even fandoms. None of them are physical objects in
      the way a mountain or a river is. They're shared ideas powerful enough to
      organize millions of people.
    </p>

    <h2>Would I recommend it?</h2>

    <p>
      Absolutely. Whether you're interested in history, psychology or simply
      enjoy books that challenge the way you think, <em>Sapiens</em> is worth
      reading.
    </p>

    <p>
      It isn't a perfect book, and I'm sure historians would disagree with
      parts of it, but that was never why it stayed with me. It stayed with me
      because it taught me to question assumptions I didn't even know I had.
      That's a rare thing for a book to do.
    </p>
  </>
);

export const sapiens: JournalEntry = {
  slug: "the-book-that-made-me-question-everything",

  title: "The Book That Made Me Question Everything",

  excerpt:
    "I picked up Sapiens on a whim from a bookstore in Kanpur. I finished it seeing money, nations and even companies in a completely different way.",

  published: "August 2026",

  category: "Book",

  paper: "linen",

  readingTime: "6 min",

  content,
};