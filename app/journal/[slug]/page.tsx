import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import type { Metadata } from "next";

import { journal } from "@/content/journal";
import { getPublishedJournal } from "@/lib/publishing/published-journal";
import { formatDate } from "@/lib/formatDate";

import JournalContent from "@/components/JournalContent";

interface JournalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: JournalPageProps): Promise<Metadata> {
  const { slug } = await params;

  const publishedJournal = getPublishedJournal();

  const allJournal = [
    ...journal,
    ...publishedJournal,
  ];

  const entry = allJournal.find(
    (post) => post.slug === slug
  );

  if (!entry) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: entry.title,
    description: entry.excerpt,
    alternates: {
      canonical: `/journal/${slug}`,
    },
    openGraph: {
      title: `${entry.title} • Journal`,
      description: entry.excerpt,
      url: `https://thelongwayhome.dev/journal/${slug}`,
      siteName: "The Long Way Home",
      locale: "en_US",
      type: "article",
      publishedTime: entry.published,
images: entry.image
        ? [
            {
              url: entry.image.src,
              width: 1600,
              height: 900,
              alt: entry.image.alt,
            },
          ]
        : [
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
        title: `${entry.title} • Journal`,
        description: entry.excerpt,
        images: entry.image
          ? [entry.image.src]
          : ["/opengraph-image.png"],
      },
  };
}

export default async function JournalPage({
  params,
}: JournalPageProps) {
  const { slug } = await params;

  const publishedJournal = getPublishedJournal();

  const allJournal = [
    ...journal,
    ...publishedJournal,
  ];

  const entry = allJournal.find(
    (post) => post.slug === slug
  );

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F2EEE7]">
      <article className="mx-auto max-w-4xl px-6 py-24">

        <Link
          href="/journal"
          className="text-sm text-[#8A7D6F] transition hover:text-[#2C2A28]"
        >
          ← Back to notebook
        </Link>

        <header className="mt-12">

          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.18em] text-[#8A7D6F]">
            <span>{formatDate(entry.published)}</span>

            <span>•</span>

            <span className="capitalize">
              {entry.category}
            </span>

            <span>•</span>

            <span>{entry.readingTime}</span>
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-[#2C2A28]">
            {entry.title}
          </h1>

        </header>

        {entry.image && (
          <div className="mt-16 overflow-hidden rounded-3xl">
            <Image
              src={entry.image.src}
              alt={entry.image.alt}
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        <section
          className="
            prose
            prose-lg
            prose-neutral
            mt-16
            max-w-none

            prose-p:leading-9
            prose-p:text-[#4D463F]

            prose-headings:text-[#2C2A28]

            prose-blockquote:border-l-[#C7B9A4]
            prose-blockquote:text-[#6A6258]
          "
        >
          {entry.editorDocument ? (
            <JournalContent
              document={entry.editorDocument}
            />
          ) : (
            entry.content
          )}
        </section>

        <footer className="mt-24 border-t border-[#DDD2C3] pt-12">

          <p className="text-lg italic text-[#6A6258]">
            Thanks for reading.
          </p>

        </footer>

      </article>
    </main>
  );
}