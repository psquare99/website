import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const editorDocument = {
  "type": "doc",
  "content": [
    {
      "type": "image",
      "attrs": {
        "src": "/images/journal/reflection/the-long-way-home-manifesto-v-1-0-0/1000001817.jpg",
        "alt": "",
        "title": null,
        "width": 4080,
        "height": 3072,
        "pendingId": null,
        "caption": ""
      }
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
          "text": "Why I Build"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I believe software should make life simpler, not busier."
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
        },
        {
          "type": "hardBreak",
          "marks": [
            {
              "type": "bold"
            }
          ]
        },
        {
          "type": "hardBreak",
          "marks": [
            {
              "type": "bold"
            }
          ]
        },
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "1. One App. One Purpose"
        },
        {
          "type": "text",
          "text": "."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Every application exists for a clearly defined reason."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "If a feature does not strengthen that purpose, it does not belong."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "We choose focus over feature lists."
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
              "type": "italic"
            }
          ],
          "text": "2. Calm by Design."
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
          "text": "Software should feel calm, predictable, and respectful."
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
              "type": "italic"
            }
          ],
          "text": "3. Finish and Leave."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "4. Privacy Is the Default"
        },
        {
          "type": "text",
          "text": "."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "5. Offline First."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "6. Accounts Are Optional."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "7. Build for Decades."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "We avoid trends that age quickly."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "We build software we would still be proud to use ten years from now."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "8. Respect the User's Mind."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "9. Every App Stands Alone."
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
          "text": "Ecosystem exists because our products naturally complement one another—not because they depend on each other."
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
              "type": "italic"
            }
          ],
          "text": "10. Connected, Never Entangled."
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
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "marks": [
            {
              "type": "italic"
            }
          ],
          "text": "11. Quality Before Quantity."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Would rather release one thoughtful application than ten unfinished ones."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "We believe craftsmanship is remembered long after release dates are forgotten."
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
          "text": "12. Build Things We Need."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I  begin by solving our own problems."
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
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "P.S. This is the first post from this recently buit journal publisher app that I built to publish posts directly to my website from the comfort of my mobile and tab."
            }
          ]
        }
      ]
    }
  ]
};

const content = (
  <>
    <figure className="journal-image journal-image-right">
        <div className="overflow-hidden rounded-2xl">
          <Image
            src="/images/journal/reflection/the-long-way-home-manifesto-v-1-0-0/1000001817.jpg"
            alt=""
            width={4080}
            height={3072}
            className="h-auto w-full object-cover"
          />
        </div>
      </figure>

    <h2 className="clear-journal-float"><strong>Why I Build</strong></h2>

    <p>
      I believe software should make life simpler, not busier.
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

    <h2 className="clear-journal-float"><strong>My Principles</strong><br /><br /><em>1. One App. One Purpose</em>.</h2>

    <p>
      Every application exists for a clearly defined reason.
    </p>

    <p>
      If a feature does not strengthen that purpose, it does not belong.
    </p>

    <p>
      We choose focus over feature lists.
    </p>

    <h2 className="clear-journal-float"><em>2. Calm by Design.</em></h2>

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
      Software should feel calm, predictable, and respectful.
    </p>

    <h2 className="clear-journal-float"><em>3. Finish and Leave.</em></h2>

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

    <h2 className="clear-journal-float"><em>4. Privacy Is the Default</em>.</h2>

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

    <h2 className="clear-journal-float"><em>5. Offline First.</em></h2>

    <p>
      Software should remain useful even without an internet connection.
    </p>

    <p>
      The device is the user's home.
    </p>

    <p>
      Cloud services are conveniences, never requirements.
    </p>

    <h2 className="clear-journal-float"><em>6. Accounts Are Optional.</em></h2>

    <p>
      No one should be forced to create an account just to use our software.
    </p>

    <p>
      Accounts exist to make life easier through backup and synchronization—not to lock people into an ecosystem.
    </p>

    <h2 className="clear-journal-float"><em>7. Build for Decades.</em></h2>

    <p>
      We avoid trends that age quickly.
    </p>

    <p>
      We build software we would still be proud to use ten years from now.
    </p>

    <p>
      Good design outlives fashion.
    </p>

    <h2 className="clear-journal-float"><em>8. Respect the User's Mind.</em></h2>

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

    <h2 className="clear-journal-float"><em>9. Every App Stands Alone.</em></h2>

    <p>
      Each application should be complete and useful on its own.
    </p>

    <p>
      Ecosystem exists because our products naturally complement one another—not because they depend on each other.
    </p>

    <h2 className="clear-journal-float"><em>10. Connected, Never Entangled.</em></h2>

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

    <h2 className="clear-journal-float"><em>11. Quality Before Quantity.</em></h2>

    <p>
      Would rather release one thoughtful application than ten unfinished ones.
    </p>

    <p>
      We believe craftsmanship is remembered long after release dates are forgotten.
    </p>

    <h2 className="clear-journal-float">12. Build Things We Need.</h2>

    <p>
      I  begin by solving our own problems.
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

    <blockquote className="clear-journal-float">
      P.S. This is the first post from this recently buit journal publisher app that I built to publish posts directly to my website from the comfort of my mobile and tab.
    </blockquote>
  </>
);

export const thelongwayhomemanifestov100: JournalEntry = {
  slug: "the-long-way-home-manifesto-v-1-0-0",

  title: "The Long Way Home Manifesto V 1.0.0",

  excerpt: "Why I Build\n\nI believe software should make life simpler, not busier.\n\nTechnology should quietly support the real world, not compete with it for our attention.",

  published: "2026-08-09",

  category: "reflection",

  paper: "cream",

  readingTime: "4 min",

  featured: true,

  content,

  status: "published",
};
