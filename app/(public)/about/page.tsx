import type { Metadata } from "next";

import Container from "@/components/Container";
import WaypointTrail from "@/components/about/WaypointTrail";
import WaypointIntro from "@/components/about/WaypointIntro";
import WaypointMaking from "@/components/about/WaypointMaking";
import WaypointMountains from "@/components/about/WaypointMountains";
import WaypointReading from "@/components/about/WaypointReading";
import WaypointNow from "@/components/about/WaypointNow";
import WaypointClosing from "@/components/about/WaypointClosing";

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
      <main className="mx-auto max-w-[960px] py-16 sm:py-20">
        <WaypointTrail>
          <WaypointIntro
            eyebrow={about.intro.eyebrow}
            heading={about.intro.heading}
            text={about.intro.text}
            signature={about.intro.signature}
            image={about.intro.image}
            imageAlt={about.intro.imageAlt}
          />

          <WaypointMaking
            heading={about.making.heading}
            text={about.making.text}
            image={about.making.image}
            imageAlt={about.making.imageAlt}
            linkLabel={about.making.linkLabel}
            linkUrl={about.making.linkUrl}
          />

          <WaypointMountains
            heading={about.mountains.heading}
            text={about.mountains.text}
            location={about.mountains.location}
            image={about.mountains.image}
            imageAlt={about.mountains.imageAlt}
          />

          <WaypointReading
            heading={about.reading.heading}
            text={about.reading.text}
            bookTitle={about.reading.bookTitle}
            bookAuthor={about.reading.bookAuthor}
            bookCover={about.reading.bookCover}
            bookCoverAlt={about.reading.bookCoverAlt}
          />

          <WaypointNow items={about.now} />

          <WaypointClosing
            eyebrow={about.closing.eyebrow}
            heading={about.closing.heading}
            text={about.closing.text}
            signature={about.closing.signature}
          />
        </WaypointTrail>
      </main>
    </Container>
  );
}
