import type { Metadata } from "next";

import Container from "@/components/Container";
import Notebook from "@/components/Notebook";

import { getPublishedJournal } from "@/lib/publishing/published-journal";

export const dynamic = "force-dynamic";

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
        url: "/opengraph-image.png",
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
    images: ["/opengraph-image.png"],
  },
};

export default async function JournalPage() {
  const allJournal = await getPublishedJournal();

  return (
    <Container>
      <Notebook
        journal={allJournal}
      />
    </Container>
  );
}
