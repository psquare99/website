import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { journal } from "@/content/journal";
import { formatDate } from "@/lib/formatDate";

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
          {entry.content}
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