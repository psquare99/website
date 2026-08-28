import Link from "next/link";
import { MapPin } from "lucide-react";
import type { AboutData } from "@/types/about";
import { BoardEyebrow, BoardPhoto, HandNote } from "./shared";

interface WhiteboardFrontProps {
  about: AboutData;
}

export default function WhiteboardFront({ about }: WhiteboardFrontProps) {
  const { intro, making, mountains } = about;

  return (
    <div className="space-y-12 p-6 sm:p-12 lg:p-16">
      {/* SECTION 1: INTRO / BIO */}
      <section aria-labelledby="about-heading" className="relative">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12">
          {intro.image && (
            <div className="relative shrink-0">
              <BoardPhoto
                src={intro.image}
                alt={intro.imageAlt || "Prateek Pal"}
                width={380}
                height={480}
                rotate={-1.8}
                className="w-40 sm:w-48"
              />
              <HandNote className="absolute -right-3 -top-5 rotate-6">me</HandNote>
            </div>
          )}
          <div className="min-w-0 flex-1">
            {intro.eyebrow && <BoardEyebrow>{intro.eyebrow}</BoardEyebrow>}
            {intro.heading && (
              <h1
                id="about-heading"
                className="mt-3 font-serif text-3xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-4xl"
              >
                {intro.heading}
              </h1>
            )}
            {intro.text && (
              <div className="mt-4 space-y-4 text-base leading-7 text-neutral-700">
                {intro.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {intro.signature && (
              <p
                className="mt-5 text-2xl leading-none text-[var(--color-accent)]"
                style={{ fontFamily: "var(--font-script)" }}
              >
                {intro.signature}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SUBTLE PINNED DIVIDER */}
      <div className="relative border-t border-dashed border-[var(--color-border)]" aria-hidden="true" />

      {/* SECTION 2 & 3 GRID: MAKING & MOUNTAINS */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
        {/* SECTION 2: MAKING */}
        <section aria-label="Making things" className="flex flex-col justify-between">
          <div>
            <BoardEyebrow>Making</BoardEyebrow>
            {making.heading && (
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
                {making.heading}
              </h2>
            )}
            {making.text && (
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {making.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>

          {making.image && (
            <div className="mt-6">
              <BoardPhoto
                src={making.image}
                alt={making.imageAlt || "Workshop"}
                width={560}
                height={380}
                rotate={-1.2}
                className="w-full max-w-sm"
              />
            </div>
          )}

          {making.linkUrl && making.linkLabel && (
            <div className="mt-5">
              <Link
                href={making.linkUrl}
                className="inline-flex items-center gap-1.5 border-b border-neutral-300 pb-0.5 text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                <span>{making.linkLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </section>

        {/* SECTION 3: MOUNTAINS */}
        <section aria-label="Mountains" className="flex flex-col justify-between">
          <div>
            <BoardEyebrow>Mountains</BoardEyebrow>
            {mountains.heading && (
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
                {mountains.heading}
              </h2>
            )}
            {mountains.text && (
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {mountains.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {mountains.location && (
              <p className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={1.75} />
                {mountains.location}
              </p>
            )}
          </div>

          {mountains.image && (
            <div className="mt-6">
              <BoardPhoto
                src={mountains.image}
                alt={mountains.imageAlt || "Mountains"}
                width={560}
                height={380}
                rotate={1.5}
                className="w-full max-w-sm"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
