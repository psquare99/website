import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { AboutData } from "@/types/about";
import WallPhoto from "@/components/about/WallPhoto";
import WallNote from "@/components/about/WallNote";
import WallRightNow from "@/components/about/WallRightNow";

/**
 * The /about page as a large workshop wall.
 *
 * Photographs, notes, the current project, the place, the book and the
 * right-now sheet are pinned at slightly varied positions on a warm wall
 * surface — deliberately a little imperfect, like things collected over time.
 * No page heading: the wall begins directly with "A little about me."
 */

/* Very subtle wall surface: warm base + faint plaster-like lines. */
const WALL_STYLE: CSSProperties = {
  backgroundColor: "#f2efea",
  backgroundImage:
    "radial-gradient(900px 500px at 12% -10%, rgba(255,255,255,0.65), transparent 60%)," +
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.012) 0 1px, transparent 1px 9px)",
};

function HandNote({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none select-none font-sans text-xl leading-none text-[var(--color-accent-soft)] ${className}`}
      style={{ fontFamily: "var(--font-script)" }}
    >
      {children}
    </span>
  );
}

/** A tiny handwritten arrow used sparingly. */
function HandArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 22"
      className={`pointer-events-none h-5 w-8 ${className}`}
      fill="none"
      stroke="var(--color-accent-soft)"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <path d="M2 18 C 12 16, 26 12, 34 5" />
      <path d="M28 7 L 34 5 M34 5 L 31 11" />
    </svg>
  );
}

function SmallLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
      {children}
    </p>
  );
}

export default function WorkshopWall({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      {/* the wall */}
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[16px] px-5 py-14 sm:px-10 sm:py-16"
        style={WALL_STYLE}
      >
        {/* ============================================================
            Upper cluster — portrait + introduction note
            ============================================================ */}
        <div className="flex flex-wrap items-start gap-8 lg:gap-12">
          {intro.image && (
            <WallPhoto
              src={intro.image}
              alt={intro.imageAlt || ""}
              width={420}
              height={525}
              rotate={-2}
              className="relative z-10 w-40 sm:w-44 lg:-mt-2"
            >
              <HandNote className="absolute -right-5 -top-7 rotate-6">me</HandNote>
            </WallPhoto>
          )}

          <WallNote
            paper="note"
            rotate={1}
            className="flex-1 basis-64 lg:basis-auto lg:w-[26rem] lg:ml-6"
          >
            {intro.eyebrow && <SmallLabel>{intro.eyebrow}</SmallLabel>}
            {intro.heading && (
              <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-neutral-900">
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
                className="mt-4 text-2xl leading-none"
                style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
              >
                {intro.signature}
              </p>
            )}
          </WallNote>
        </div>

        {/* ============================================================
            Middle-left cluster — making (workshop photo + note)
            ============================================================ */}
        <div className="mt-16 flex flex-wrap items-start gap-8 lg:mt-20 lg:gap-10">
          {making.image && (
            <WallPhoto
              src={making.image}
              alt={making.imageAlt || ""}
              width={600}
              height={400}
              rotate={-1}
              className="relative z-10 w-64 sm:w-72 lg:order-2 lg:mt-10"
            />
          )}

          <WallNote paper="note" rotate={-0.5} className="order-1 flex-1 basis-60 lg:basis-72">
            <SmallLabel>Making</SmallLabel>
            {making.heading && (
              <h2 className="mt-2 font-serif text-xl font-semibold leading-snug tracking-tight text-neutral-900">
                {making.heading}
              </h2>
            )}
            {making.text && (
              <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-600">
                {making.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {making.linkUrl && making.linkLabel && (
              <Link
                href={making.linkUrl}
                className="mt-3 inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {making.linkLabel} →
              </Link>
            )}
          </WallNote>

          <div className="hidden lg:block lg:h-2" aria-hidden="true" />
        </div>

        {/* ============================================================
            Middle-right cluster — mountains (photo + small note)
            ============================================================ */}
        <div className="mt-14 flex flex-wrap items-start justify-end gap-8 lg:mt-12 lg:gap-10">
          <WallNote
            paper="note"
            rotate={-1.5}
            className="order-2 flex-1 basis-56 lg:order-1 lg:mr-4 lg:mt-16 lg:basis-60"
          >
            <SmallLabel>Mountains</SmallLabel>
            {mountains.heading && (
              <h2 className="mt-2 font-serif text-xl font-semibold leading-snug tracking-tight text-neutral-900">
                {mountains.heading}
              </h2>
            )}
            {mountains.text && (
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {mountains.text.split("\n\n")[0]}
              </p>
            )}
          </WallNote>

          {mountains.image && (
            <WallPhoto
              src={mountains.image}
              alt={mountains.imageAlt || ""}
              width={600}
              height={400}
              rotate={1.5}
              className="relative order-1 z-10 w-60 sm:w-64 lg:order-2"
            >
              {mountains.location && (
                <span className="pointer-events-none absolute -bottom-3 right-2 rounded-[2px] bg-[#f7f1e3] px-2 py-0.5 font-sans text-[0.62rem] text-[var(--muted)] shadow-sm">
                  {mountains.location}
                </span>
              )}
            </WallPhoto>
          )}
        </div>

        {/* ============================================================
            Middle-lower cluster — reading (book + note) + right-now sheet
            ============================================================ */}
        <div className="mt-16 flex flex-wrap items-start gap-8 lg:mt-20 lg:gap-12">
          {reading.bookCover && (
            <WallPhoto
              src={reading.bookCover}
              alt={reading.bookCoverAlt || reading.bookTitle}
              width={300}
              height={450}
              rotate={2}
              className="relative z-10 w-24 sm:w-28"
            />
          )}

          <WallNote paper="scrap" rotate={0.5} className="flex-1 basis-56 lg:mt-4 lg:basis-64">
            <SmallLabel>Reading</SmallLabel>
            {reading.heading && (
              <h2 className="mt-2 font-serif text-lg font-semibold leading-snug tracking-tight text-neutral-900">
                {reading.heading}
              </h2>
            )}
            {reading.text && (
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {reading.text.split("\n\n")[0]}
              </p>
            )}
            <div className="mt-3 border-t border-[var(--color-border)] pt-2">
              {reading.bookTitle && (
                <p className="font-serif text-base font-semibold text-neutral-900">
                  {reading.bookTitle}
                </p>
              )}
              {reading.bookAuthor && (
                <p className="text-xs text-[var(--muted)]">{reading.bookAuthor}</p>
              )}
            </div>
          </WallNote>

          <div className="hidden lg:block lg:flex-1" aria-hidden="true" />
        </div>

        {/* right-now sheet anchored to the right side of the wall */}
        <div className="mt-14 flex justify-end lg:-mt-2 lg:mr-6">
          <WallRightNow items={now} />
        </div>

        {/* ============================================================
            Lower-right — closing note (last note on the wall)
            ============================================================ */}
        {closing.text && (
          <div className="mt-16 flex justify-center lg:mt-20 lg:justify-end lg:pr-8">
            <WallNote paper="scrap" rotate={2} className="relative w-full max-w-sm lg:mr-4">
              <HandArrow className="absolute -bottom-3 -right-8 rotate-90" />
              {closing.eyebrow && (
                <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
                  {closing.eyebrow}
                </p>
              )}
              {closing.heading && (
                <h2 className="mt-3 font-serif text-2xl leading-tight tracking-tight text-neutral-900">
                  {closing.heading}
                </h2>
              )}
              {closing.text && (
                <div className="mt-4 space-y-4 text-base leading-7 text-neutral-700">
                  {closing.text.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              {closing.signature && (
                <p
                  className="mt-4 text-2xl leading-none"
                  style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
                >
                  {closing.signature}
                </p>
              )}
            </WallNote>
          </div>
        )}
      </div>
    </div>
  );
}
