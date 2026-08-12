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
          "text": "Journal Publisher "
        },
        {
          "type": "text",
          "text": "is "
        },
        {
          "type": "text",
          "text": "having a bug where it wouldn't create and publish posts in new categories. Implemented the fix by allowing worker to accept dynamic categories instead of the hard coded 5 initial categories. To test whether the fix worked, I created the Dev Logs category and am publishing this post from the journal publisher Android app. If this works it will solve the problem of having to manually create categories from the website.Now a little bit about the Dev Logs category. As the name conveys, these are development logs for various projects I am working on right now. This will be helpful in many ways. Instead of relying on updating the projects status on the  pages everytime I do something in the project, I can simply record them as a dev logs here and when the project is stable it will be updated in the website as well.So with that, lets see if this works...Trial 1 failed...Lets try another fix"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "New Development - The main.dart was carrying all the burden (all the screens of the app were being rendered by this single file), so splitted it into separate screens. Also fixed the little slug and export name bug."
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Now again trying to see if it works..."
        }
      ]
    },
    {
      "type": "paragraph"
    }
  ]
};

const content = (
  <>
    <p>
      Journal Publisher is having a bug where it wouldn't create and publish posts in new categories. Implemented the fix by allowing worker to accept dynamic categories instead of the hard coded 5 initial categories. To test whether the fix worked, I created the Dev Logs category and am publishing this post from the journal publisher Android app. If this works it will solve the problem of having to manually create categories from the website.Now a little bit about the Dev Logs category. As the name conveys, these are development logs for various projects I am working on right now. This will be helpful in many ways. Instead of relying on updating the projects status on the  pages everytime I do something in the project, I can simply record them as a dev logs here and when the project is stable it will be updated in the website as well.So with that, lets see if this works...Trial 1 failed...Lets try another fix
    </p>

    <p>
      New Development - The main.dart was carrying all the burden (all the screens of the app were being rendered by this single file), so splitted it into separate screens. Also fixed the little slug and export name bug.
    </p>

    <p>
      Now again trying to see if it works...
    </p>

    <p>

    </p>
  </>
);

export const devLog1: JournalEntry = {
  slug: "dev log1",

  title: "Dev Logs #1: Fixed Journal Publisher Category Creation Bug",

  excerpt: "Journal Publisher is having a bug where it wouldn't create and publish posts in new categories. Implemented the fix by...",

  published: "2026-08-12",

  category: "dev-logs",

  paper: "cream",

  readingTime: "1 min",

  content,

  status: "published",
};
