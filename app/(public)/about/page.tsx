import type { Metadata } from "next";

import AboutPinboard from "@/components/about/AboutPinboard";
import { getAboutContent } from "@/lib/publishing/about-content";

import "@/app/about-pinboard.css";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="italic text-neutral-400">About page coming soon.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AboutPinboard about={about} />
    </div>
  );
}
