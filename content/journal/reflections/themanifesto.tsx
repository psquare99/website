import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const editorDocument = {
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "Why I Build"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "We believe software should make life simpler, not busier."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Technology should quietly support the real world, not compete with it for our attention."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Every product I create exists to solve a genuine problem with clarity, respect, and purpose."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "When my software has done its job well, it should disappear into the background, allowing people to return to what truly matters."
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
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "My Principles"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>1. One App. One Purpose.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Every application exists for a clearly defined reason.<br />If a feature does not strengthen that purpose, it does not belong."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I choose focus over feature lists."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>2. Calm by Design.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I refuse to compete for attention."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "No endless feeds."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "No engagement tricks."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "No dark patterns."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "No unnecessary notifications."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "My software should feel calm, predictable, and respectful."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>3. Finish and Leave.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Success is measured by how quickly someone can accomplish what they came to do."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Open."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Finish."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Close."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Go live your life."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>4. Privacy Is the Default.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Personal data belongs to the person who created it."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Collect only what is necessary."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Share nothing without permission."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Trust is earned, never assumed."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>5. Offline First.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Software should remain useful even without an internet connection."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The device is the user's home."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Cloud services are conveniences, never requirements."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>6. Accounts Are Optional.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "No one should be forced to create an account just to use our software."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Accounts exist to make life easier through backup and synchronization—not to lock people into an ecosystem."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>7. Build for Decades.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Avoid trends that age quickly."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Build software we would still be proud to use ten years from now."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Good design outlives fashion."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>8. Respect the User's Mind.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Software should reduce mental effort, not increase it."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Automate repetitive work."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Simplify difficult tasks."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Never ask people to manage unnecessary complexity."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>9. Every App Stands Alone.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Each application should be complete and useful on its own."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Ecosystem exists because my products naturally complement one another—not because they depend on each other."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>10. Connected, Never Entangled.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Applications may communicate, but they remain independent."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Data sharing is transparent."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Permissions are explicit."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The user always remains in control."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>11. Quality Before Quantity.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I would rather release one thoughtful application than ten unfinished ones."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I believe craftsmanship is remembered long after release dates are forgotten."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "<strong>12. Build Things I Need.</strong>"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I begin by solving my own problems."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "If my work improves my own life, it will likely improve someone else's as well."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Popularity is not the goal."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Usefulness is."
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
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "My Promise"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I will never build software whose primary purpose is to capture attention."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I will never add features simply because everyone else has them."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I will never sacrifice privacy for convenience without giving users a choice."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I will always choose simplicity over complexity, clarity over clutter, and trust over growth."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "My products are not designed to become the center of one's life."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "They're designed to quietly help one live it."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "The Long Way Home"
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
              "text": "Software that helps you get back to life."
            }
          ]
        }
      ]
    }
  ]
};

const content = (
  <>
    <h2 className="clear-journal-float"><strong>Why I Build</strong></h2>

    <p>
      We believe software should make life simpler, not busier.
    </p>

    <p>
      Technology should quietly support the real world, not compete with it for our attention.
    </p>

    <p>
      Every product I create exists to solve a genuine problem with clarity, respect, and purpose.
    </p>

    <p>
      When my software has done its job well, it should disappear into the background, allowing people to return to what truly matters.
    </p>

    <h2 className="clear-journal-float"><strong>My Principles</strong></h2>

    <p>
      <em>{"<"}strong{">"}1. One App. One Purpose.{"<"}/strong{">"}</em>
    </p>

    <p>
      Every application exists for a clearly defined reason.{"<"}br /{">"}If a feature does not strengthen that purpose, it does not belong.
    </p>

    <p>
      I choose focus over feature lists.
    </p>

    <p>
      <em>{"<"}strong{">"}2. Calm by Design.{"<"}/strong{">"}</em>
    </p>

    <p>
      I refuse to compete for attention.
    </p>

    <p>
      No endless feeds.
    </p>

    <p>
      No engagement tricks.
    </p>

    <p>
      No dark patterns.
    </p>

    <p>
      No unnecessary notifications.
    </p>

    <p>
      My software should feel calm, predictable, and respectful.
    </p>

    <p>
      <em>{"<"}strong{">"}3. Finish and Leave.{"<"}/strong{">"}</em>
    </p>

    <p>
      Success is measured by how quickly someone can accomplish what they came to do.
    </p>

    <p>
      Open.
    </p>

    <p>
      Finish.
    </p>

    <p>
      Close.
    </p>

    <p>
      Go live your life.
    </p>

    <p>
      <em>{"<"}strong{">"}4. Privacy Is the Default.{"<"}/strong{">"}</em>
    </p>

    <p>
      Personal data belongs to the person who created it.
    </p>

    <p>
      Collect only what is necessary.
    </p>

    <p>
      Share nothing without permission.
    </p>

    <p>
      Trust is earned, never assumed.
    </p>

    <p>
      <em>{"<"}strong{">"}5. Offline First.{"<"}/strong{">"}</em>
    </p>

    <p>
      Software should remain useful even without an internet connection.
    </p>

    <p>
      The device is the user's home.
    </p>

    <p>
      Cloud services are conveniences, never requirements.
    </p>

    <p>
      <em>{"<"}strong{">"}6. Accounts Are Optional.{"<"}/strong{">"}</em>
    </p>

    <p>
      No one should be forced to create an account just to use our software.
    </p>

    <p>
      Accounts exist to make life easier through backup and synchronization—not to lock people into an ecosystem.
    </p>

    <p>
      <em>{"<"}strong{">"}7. Build for Decades.{"<"}/strong{">"}</em>
    </p>

    <p>
      Avoid trends that age quickly.
    </p>

    <p>
      Build software we would still be proud to use ten years from now.
    </p>

    <p>
      Good design outlives fashion.
    </p>

    <p>
      <em>{"<"}strong{">"}8. Respect the User's Mind.{"<"}/strong{">"}</em>
    </p>

    <p>
      Software should reduce mental effort, not increase it.
    </p>

    <p>
      Automate repetitive work.
    </p>

    <p>
      Simplify difficult tasks.
    </p>

    <p>
      Never ask people to manage unnecessary complexity.
    </p>

    <p>
      <em>{"<"}strong{">"}9. Every App Stands Alone.{"<"}/strong{">"}</em>
    </p>

    <p>
      Each application should be complete and useful on its own.
    </p>

    <p>
      Ecosystem exists because my products naturally complement one another—not because they depend on each other.
    </p>

    <p>
      <em>{"<"}strong{">"}10. Connected, Never Entangled.{"<"}/strong{">"}</em>
    </p>

    <p>
      Applications may communicate, but they remain independent.
    </p>

    <p>
      Data sharing is transparent.
    </p>

    <p>
      Permissions are explicit.
    </p>

    <p>
      The user always remains in control.
    </p>

    <p>
      <em>{"<"}strong{">"}11. Quality Before Quantity.{"<"}/strong{">"}</em>
    </p>

    <p>
      I would rather release one thoughtful application than ten unfinished ones.
    </p>

    <p>
      I believe craftsmanship is remembered long after release dates are forgotten.
    </p>

    <p>
      <em>{"<"}strong{">"}12. Build Things I Need.{"<"}/strong{">"}</em>
    </p>

    <p>
      I begin by solving my own problems.
    </p>

    <p>
      If my work improves my own life, it will likely improve someone else's as well.
    </p>

    <p>
      Popularity is not the goal.
    </p>

    <p>
      Usefulness is.
    </p>

    <h2 className="clear-journal-float"><strong>My Promise</strong></h2>

    <p>
      I will never build software whose primary purpose is to capture attention.
    </p>

    <p>
      I will never add features simply because everyone else has them.
    </p>

    <p>
      I will never sacrifice privacy for convenience without giving users a choice.
    </p>

    <p>
      I will always choose simplicity over complexity, clarity over clutter, and trust over growth.
    </p>

    <p>
      My products are not designed to become the center of one's life.
    </p>

    <p>
      They're designed to quietly help one live it.
    </p>

    <p>
      <strong>The Long Way Home</strong>
    </p>

    <blockquote className="clear-journal-float">
      Software that helps you get back to life.
    </blockquote>
  </>
);

export const themanifesto: JournalEntry = {
  slug: "the-manifesto",

  title: "The Manifesto",

  excerpt: "",

  published: "2026-08-09",

  category: "reflection",

  paper: "cream",

  readingTime: "5 min",

  featured: true,

  content,

  status: "published",
};
