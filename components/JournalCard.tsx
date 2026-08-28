import Image from "next/image";
import Link from "next/link";

import type { JournalEntry } from "@/types/journal";
import { papers } from "@/lib/papers";
import { formatDate } from "@/lib/formatDate";
import { getOptimizedImageUrl } from "@/lib/media/url";

interface JournalCardProps {
  entry: JournalEntry;
  variant?: "featured" | "compact";
}

export default function JournalCard({
  entry,
}: JournalCardProps) {
  const paper = papers[entry.paper];

  return (
    <Link
      href={`/journal/${entry.slug}`}
      className="group block"
    >
      <article
        className="overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        style={{
          background: paper.background,
          borderColor: paper.border,
        }}
      >
        {entry.image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={getOptimizedImageUrl(entry.image.src, { width: 800 })}
              alt={entry.image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#8A7D6F]">
            <span>{formatDate(entry.published)}</span>
            <span>•</span>
            <span>{entry.category}</span>
            <span>•</span>
            <span>{entry.readingTime}</span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#2C2A28] transition-colors group-hover:text-[#5F564D]">
            {entry.title}
          </h2>

          <p className="mt-5 leading-8 text-[#5F564D]">
            {entry.excerpt}
          </p>

          <div className="mt-7 text-sm text-[#8A7D6F]">
            Read →
          </div>
        </div>
      </article>
    </Link>
  );
}