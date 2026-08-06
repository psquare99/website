import Image from "next/image";
import Link from "next/link";

import type { JournalEntry } from "@/types/journal";
import { papers } from "@/lib/papers";
import { formatDate } from "@/lib/formatDate";

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
    <Link
  href={`/journal/${entry.slug}`}
  className="block"
>
  <article
      className="group mb-6 break-inside-avoid overflow-hidden rounded-[28px] border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: paper.background,
        borderColor: paper.border,
      }}
    >
      {entry.image && (
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={entry.image.src}
            alt={entry.image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[#8A7D6F]">
          {formatDate(entry.published)}
        </p>

       
          <h2
            className={`mt-4 font-semibold tracking-tight text-[#2C2A28] ${
              variant === "featured" ? "text-4xl" : "text-2xl"
            }`}
          >
            {entry.title}
          </h2>
        

        <p className="mt-6 leading-8 text-[#5F564D]">
          {entry.excerpt}
        </p>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm text-[#8A7D6F]">
            {entry.readingTime}
          </span>

          <span className="font-medium">
  Continue →
</span>
        </div>
      </div>
      </article>
</Link>
  );
}