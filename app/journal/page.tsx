import type { Metadata } from "next";

import Container from "@/components/Container";
import Notebook from "@/components/Notebook";

import { journal } from "@/content/journal";
import { getPublishedJournal } from "@/lib/publishing/published-journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes on books, travel, code, mountains, and the long way home.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "Journal • The Long Way Home",
    description:
      "Notes on books, travel, code, mountains, and the long way home.",
    url: "https://thelongwayhome.dev/journal",
    siteName: "The Long Way Home",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Long Way Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal • The Long Way Home",
    description:
      "Notes on books, travel, code, mountains, and the long way home.",
    images: ["/opengraph-image"],
  },
};

export default function JournalPage() {
  const publishedJournal =
    getPublishedJournal();

  const allJournal = [
    ...journal,
    ...publishedJournal,
  ];

  return (
    <Container>
      <Notebook
        journal={allJournal}
      />
    </Container>
  );
}