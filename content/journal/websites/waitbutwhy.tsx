import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      Wait But Why feels like the last real blog on the internet.
    </p>

    <p>
      You open it and it's just Tim Urban talking to you for a long time about
      something he's been turning over in his head. No polished branding, no
      "content strategy," no attempt to keep you scrolling. Just a guy with
      stick figures and a slightly obsessive need to figure things out.
    </p>

    <p>
      The best posts feel less like articles and more like someone sitting
      across from you at 1 a.m. going, "Okay... wait, but why though?" and then
      actually following the thought all the way down.
    </p>

    <p>
      The procrastination series especially. They don't lecture. They simply
      describe the exact internal nonsense most of us live with, and somehow
      that makes it feel lighter.
    </p>

    <p>
      It's also wildly uneven in both the best and the worst ways. Sometimes
      Tim disappears for years. Sometimes the posts become more personal and
      less mind-bending. The site itself still looks like it was built in 2014
      and never received a second pass.
    </p>

    <p>
      None of that really matters once you're three thousand words in and
      suddenly understand something better than you did an hour ago.
    </p>

    <p>
      It's not for everyone. If you want short, polished and regular content,
      this will probably frustrate the hell out of you.
    </p>

    <p>
      But if you've ever wished the internet still had places where someone
      simply thought deeply about something and then wrote it down without
      trying to sell you anything, this is one of the few corners still left.
    </p>

    <p>
      It's imperfect, irregular and occasionally a little self-indulgent.
      It's also one of the only websites I still open when I genuinely want to
      think.
    </p>
  </>
);

export const waitButWhy: JournalEntry = {
  slug: "why-i-couldnt-stop-reading-wait-but-why",

  title: "Why I Couldn't Stop Reading Wait But Why",

  excerpt:
    "A website that reminded me what the internet feels like when someone writes because they have something worth saying, not because they need something to post.",

  published: "August 2026",

  category: "website",

  paper: "mist",

  readingTime: "4 min",

  content,

  status: "published",
};