import type { Metadata } from "next";

import Container from "@/components/Container";

import HomeHero from "@/components/HomeHero";

export const metadata: Metadata = {
  title: "The Long Way Home • Prateek Pal",
  description:
    "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Long Way Home",
    description:
      "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",
    url: "https://thelongwayhome.dev",
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
    title: "The Long Way Home",
    description:
      "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <Container>
  <main className="pt-12 pb-8">
    <HomeHero />
  </main>
</Container>
  );
}