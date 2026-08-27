import type { ReactNode } from "react";
import Image from "next/image";
import type { AboutData } from "@/types/about";
import { Annotation } from "@/components/about/prototypes/shared";

/**
 * Prototype E — WORKSHOP WALL
 *
 * The About page as a quiet wall inside the workshop. Objects (portrait,
 * workshop photo, mountain photo, book, current notes) are pinned at slightly
 * varied positions on a soft wall tone rather than locked into a rigid grid.
 * A small tack on each object and a couple of handwritten annotations keep it
 * feeling like a maker's wall without becoming a messy scrapbook.
 */

const WALL_BG = "#f3f0ea";

function Pin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-2 left-1/2 inline-block h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${className}`}
    >
      <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/50" />
    </span>
  );
}

function WallObject({
  children,
  rotate = 0,
  offset = "",
  className = "",
}: {
  children: ReactNode;
  rotate?: number;
  offset?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${offset} ${className}`}>
      <Pin />
      <div
        className="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-white shadow-md"
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}

export default function WorkshopWallProto({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="px-6 pb-24 pt-14 sm:px-2 sm:pt-20">
      {/* wall surface */}
      <div
        className="mx-auto max-w-3xl rounded-[14px] px-8 py-12 sm:px-14 sm:py-16"
        style={{ backgroundColor: WALL_BG }}
      >
        {/* heading on the wall */}
        <div className="mb-12 flex items-baseline justify-between">
          <div>
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Workshop · Wall
            </p>
            {intro.heading && (
              <h1 className="mt-3 text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl">
                {intro.heading}
              </h1>
            )}
          </div>
          {intro.signature && (
            <span
              className="hidden -rotate-3 text-2xl font-semibold sm:block"
              style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
            >
              {intro.signature}
            </span>
          )}
        </div>

        {/* ---- objects pinned on the wall ---- */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {/* portrait */}
          {intro.image && (
            <WallObject rotate={-1.5} className="col-span-1 -mt-4">
              <Image src={intro.image} alt={intro.imageAlt || ""} width={300} height={380} className="h-auto w-full object-cover" />
            </WallObject>
          )}

          {/* intro note */}
          <div className="col-span-2 self-center">
            {intro.text && (
              <div className="space-y-4 text-base leading-7 text-neutral-700">
                {intro.text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>

          {/* mountain photo */}
          {mountains.image && (
            <WallObject rotate={1.5} className="col-span-1 mt-6">
              <div className="relative">
                <Image src={mountains.image} alt={mountains.imageAlt || ""} width={300} height={200} className="h-auto w-full object-cover" />
                {mountains.location && (
                  <span className="absolute bottom-0 left-0 bg-white/80 px-2 py-0.5 font-sans text-[0.65rem] text-[var(--muted)]">
                    {mountains.location}
                  </span>
                )}
              </div>
            </WallObject>
          )}
        </div>

        {/* workshop + notes row */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {making.image && (
            <WallObject rotate={-1} className="col-span-1">
              <Image src={making.image} alt={making.imageAlt || ""} width={400} height={260} className="h-auto w-full object-cover" />
            </WallObject>
          )}
          {making.heading && (
            <div className="col-span-1 bg-white p-4 shadow-md" style={{ transform: "rotate(1deg)" }}>
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Making
              </p>
              <h2 className="mt-2 text-xl font-semibold leading-tight text-neutral-900">{making.heading}</h2>
              {making.text && (
                <p className="mt-2 text-sm leading-6 text-neutral-600">{making.text.split("\n\n")[0]}</p>
              )}
              {making.linkUrl && (
                <a href={making.linkUrl} className="mt-3 inline-block border-b border-neutral-300 pb-px text-xs font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                  {making.linkLabel} →
                </a>
              )}
            </div>
          )}

          {/* reading note */}
          <div className="col-span-1 flex flex-col gap-4">
            {reading.bookCover && (
              <WallObject rotate={2} className="w-24">
                <Image src={reading.bookCover} alt={reading.bookCoverAlt || reading.bookTitle} width={200} height={300} className="h-auto w-full object-cover" />
              </WallObject>
            )}
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Reading
            </p>
            {reading.bookTitle && <p className="font-serif text-lg font-semibold text-neutral-900">{reading.bookTitle}</p>}
            {reading.bookAuthor && <p className="-mt-2 text-xs text-[var(--muted)]">{reading.bookAuthor}</p>}
          </div>
        </div>

        {/* right-now paper note */}
        <div className="relative mx-auto mt-12 max-w-xl -rotate-1 bg-white px-6 py-5 shadow-md" style={{ transform: "rotate(-1deg)" }}>
          <Pin className="-top-2" />
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Right now
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {now.map((item, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">{item.label}</span>
                <span className="text-base text-neutral-700">{item.value}</span>
              </li>
            ))}
          </ul>
          <Annotation className="absolute -right-16 -bottom-3 hidden rotate-6 sm:block">still adding</Annotation>
        </div>

        {/* closing */}
        <div className="mx-auto mt-16 max-w-xl text-center">
          {closing.eyebrow && (
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">{closing.eyebrow}</p>
          )}
          {closing.heading && (
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">{closing.heading}</h2>
          )}
          {closing.text && (
            <div className="mt-4 space-y-4 text-base leading-7 text-neutral-700">
              {closing.text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
          {closing.signature && (
            <p className="mt-6 text-3xl font-semibold" style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}>
              {closing.signature}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
