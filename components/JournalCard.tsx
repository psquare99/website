import Image from "next/image";
import Link from "next/link";

import type { JournalEntry } from "@/types/journal";
import { papers } from "@/lib/papers";

interface JournalCardProps {
  entry: JournalEntry;
  variant?: "featured" | "compact";
}

export default function JournalCard({
  entry,
  variant = "compact",
}: JournalCardProps) {
  const paper = papers[entry.paper];

  return (
    <article
      className="rounded-[28px] border p-8 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: paper.background,
        borderColor: paper.border,
      }}
    >
      {entry.image && (
        <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={entry.image.src}
            alt={entry.image.alt}
            fill
            className="object-cover"
          />
        </div>
      )}

      <p className="text-sm uppercase tracking-[0.2em] text-[#8A7D6F]">
        {entry.published}
      </p>

      <Link href={`/journal/${entry.slug}`}>
        <h2
          className={`mt-4 font-semibold tracking-tight text-[#2C2A28]
          ${
            variant === "featured"
              ? "text-4xl"
              : "text-2xl"
          }`}
        >
          {entry.title}
        </h2>
      </Link>

      <p className="mt-6 leading-8 text-[#5F564D]">
        {entry.excerpt}
      </p>

      <div className="mt-8 flex items-center justify-between">

        {entry.readingTime && (
          <span className="text-sm text-[#8A7D6F]">
            {entry.readingTime}
          </span>
        )}

        <Link
          href={`/journal/${entry.slug}`}
          className="font-medium"
        >
          Continue →
        </Link>

      </div>
    </article>
  );
}