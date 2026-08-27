import type { Metadata } from "next";

import Container from "@/components/Container";
import WorkshopWall from "@/components/about/WorkshopWall";

import { getAboutContent } from "@/lib/publishing/about-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "A small corner of the internet that belongs entirely to me — not a portfolio built to impress anyone, just a quiet place to collect what I'm learning, building, and thinking.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About • The Long Way Home",
    description:
      "A small corner of the internet that belongs entirely to me — not a portfolio built to impress anyone.",
    url: "https://thelongwayhome.dev/about",
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
    title: "About • The Long Way Home",
    description:
      "A small corner of the internet that belongs entirely to me.",
    images: ["/opengraph-image.png"],
  },
};

export default async function AboutPage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <Container>
        <main className="mx-auto max-w-3xl py-20 text-center">
          <p className="italic text-neutral-400">About page coming soon.</p>
        </main>
      </Container>
    );
  }

  return (
    <Container>
      <main className="mx-auto max-w-none py-0 sm:py-0">
        <WorkshopWall about={about} />
      </main>
    </Container>
  );
}
