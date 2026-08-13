import type { PublishedDocument } from "../journal-adapter";

export const studioTestPublication: PublishedDocument = {
  contractVersion: "0.1",

  id: "studio-test",

  contentType: "journal",

  slug: "studio-test",

  publishedAt: "2026-08-13T00:00:00.000Z",

  metadata: {
    title: "Studio Test",
    excerpt: "Testing the new publishing workflow.",
    category: "dev-logs",
  },

  blocks: [
    {
  id: "paragraph-1",
  type: "paragraph",
  data: {
    text:
      "This journal entry was created in Studio and received by the website through Publishing Contract v0.1.",
  },
},
    {
      id: "paragraph-2",
      type: "paragraph",
      data: {
        text:
          "Studio is responsible for the content. The website is responsible for how that content is published and presented.",
      },
    },
  ],
};