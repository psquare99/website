import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/Container";

import { getPublishedJournalEntry } from "@/lib/publishing/published-journal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedJournalEntry(slug);
  if (!entry) return {};

  return {
    title: `${entry.title} • The Long Way Home`,
    description: entry.excerpt,
    alternates: {
      canonical: `/journal/${entry.slug}`,
    },
    openGraph: {
      title: entry.title,
      description: entry.excerpt,
      url: `https://thelongwayhome.dev/journal/${entry.slug}`,
      siteName: "The Long Way Home",
      locale: "en_US",
      type: "article",
    },
  };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getPublishedJournalEntry(slug);
  if (!entry) notFound();

  return (
    <Container>
      <main className="mx-auto max-w-3xl py-20">
        <header className="mb-12">
          <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {entry.category}
          </p>
          <h1 className="text-4xl font-normal tracking-tight text-neutral-900 sm:text-5xl">
            {entry.title}
          </h1>
          <p className="mt-4 text-sm text-neutral-500">
            {new Date(entry.published).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {entry.readingTime && ` · ${entry.readingTime}`}
          </p>
        </header>
        <article className="prose prose-neutral max-w-none text-lg leading-9 text-neutral-700">
          {entry.content}
        </article>
      </main>
    </Container>
  );
}
