import { notFound } from "next/navigation";
import Link from "next/link";

import { journal } from "@/content/journal";

interface JournalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JournalPage({
  params,
}: JournalPageProps) {
  const { slug } = await params;

  const entry = journal.find((post) => post.slug === slug);

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F2EEE7]">
      <article className="mx-auto max-w-3xl px-6 py-24">

        <Link
          href="/journal"
          className="text-sm text-[#8A7D6F] transition hover:text-[#2C2A28]"
        >
          ← Back to notebook
        </Link>

        <header className="mt-12">

          <p className="text-sm uppercase tracking-[0.2em] text-[#8A7D6F]">
            {entry.published}
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[#2C2A28]">
            {entry.title}
          </h1>

          {entry.readingTime && (
            <p className="mt-4 text-[#8A7D6F]">
              {entry.readingTime} read
            </p>
          )}

        </header>

        {entry.image && (
          <div className="mt-16 overflow-hidden rounded-3xl">
            {/* We'll improve this later */}
            <img
              src={entry.image.src}
              alt={entry.image.alt}
              className="w-full"
            />
          </div>
        )}

        <section
          className="
            prose
            prose-neutral
            mt-16
            max-w-none

            prose-p:text-[1.3rem]
            prose-p:leading-10
            prose-p:text-[#4D463F]

            prose-headings:text-[#2C2A28]

            prose-blockquote:border-l-[#C7B9A4]
            prose-blockquote:text-[#6A6258]
          "
        >
          {entry.content}
        </section>

        <footer className="mt-24 border-t border-[#DDD2C3] pt-12">

          <p className="text-[#8A7D6F]">
            Written by
          </p>

          <p className="mt-2 text-lg font-medium">
            Prateek
          </p>

        </footer>

      </article>
    </main>
  );
}