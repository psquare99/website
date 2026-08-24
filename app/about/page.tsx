import type { Metadata } from "next";

import Container from "@/components/Container";
import Image from "next/image";

// Fill in whichever of these you actually have — empty/undefined ones
// won't render, and if all three are empty the whole section disappears.
const socials = {
  github: "",
  linkedin: "",
  twitter: "",
};

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

export default function AboutPage() {
  const hasSocials = Object.values(socials).some((url) => url);

  return (
    <Container>
      <main className="mx-auto max-w-3xl py-20">

        <section>
          <h1 className="text-center text-5xl font-normal tracking-tight text-neutral-900">
            Hello, I&apos;m{" "}
            <span
              className="font-semibold"
              style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
            >
              Prateek.
            </span>
          </h1>
        </section>

        <section className="mt-16 grid grid-cols-1 items-start gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-lg leading-9 text-neutral-700">
            <p>
              Welcome to my small corner of the internet — a place that
              belongs entirely to me, not a portfolio built to impress
              anyone.
            </p>

            <p>
              I enjoy making things: software, websites, little
              experiments and occasionally stories. Most of what you&apos;ll
              find here started as curiosity rather than a grand plan.
            </p>

            <p>
              I don&apos;t consider myself an expert in any of it. This
              website isn&apos;t a showcase of mastery — it&apos;s simply a
              record of progress.
            </p>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/about/hero.jpg"
                alt="A quiet mountain landscape"
                width={900}
                height={1125}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <p className="mt-2.5 font-sans text-sm text-neutral-500">
              Dharchula, on the Kumaon border — monsoon clouds rolling
              in over the valley.
            </p>
          </div>
        </section>

        <section className="mt-24">
          <span
            className="mb-3.5 block font-sans text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Why this exists
          </span>

          <h2 className="text-3xl font-semibold tracking-tight">
            Not a profile. Not a pitch.
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-9 text-neutral-700">
            <p>
              Not a social media profile. Not a portfolio made to
              impress people.
            </p>

            <p>
              Just a quiet place to collect what I&apos;m learning, what
              I&apos;m building, and the thoughts I don&apos;t want to lose.
            </p>
          </div>
        </section>

        <section className="mt-24">
          <span
            className="mb-3.5 block font-sans text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Right now
          </span>

          <h2 className="text-3xl font-semibold tracking-tight">
            Building, mostly.
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-9 text-neutral-700">
            <p>
              I&apos;m working on Prime, this website, an Adi Kailash
              tourism platform, and a small story-driven game inspired
              by the Himalayas.
            </p>

            <p>
              Every project teaches me something new — that&apos;s the
              part I enjoy most.
            </p>
          </div>
        </section>

        <section className="mt-24 text-center">
          <p className="text-xl italic text-neutral-700">
            Thanks for stopping by.
          </p>

          {hasSocials && (
            <div className="mt-14">
              <span
                className="mb-4 block font-sans text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-accent)" }}
              >
                Elsewhere
              </span>

              <div className="flex items-center justify-center gap-3 font-sans text-base">
                {socials.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-neutral-200 pb-px text-neutral-900 transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                  >
                    GitHub
                  </a>
                )}

                {socials.github && socials.linkedin && (
                  <span className="text-neutral-300">·</span>
                )}

                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-neutral-200 pb-px text-neutral-900 transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                  >
                    LinkedIn
                  </a>
                )}

                {(socials.github || socials.linkedin) && socials.twitter && (
                  <span className="text-neutral-300">·</span>
                )}

                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-neutral-200 pb-px text-neutral-900 transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

      </main>
    </Container>
  );
}
