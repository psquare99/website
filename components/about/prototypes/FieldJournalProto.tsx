import Image from "next/image";
import type { AboutData } from "@/types/about";
import { SectionLabel, Annotation, Rule, PhotoFrame, CurvedArrow } from "@/components/about/prototypes/shared";

/**
 * Prototype A — FIELD JOURNAL
 *
 * A literary personal notebook. No timeline, no equal sections, no central
 * column. The page reads like someone opened Prateek's field notebook: a
 * portrait attached to the opening page, then loose entries ("FIELD NOTE 01…")
 * distributed naturally down the page. A faint left page-margin gutter carries
 * tiny handwritten annotations and arrows. Deliberately asymmetric.
 */

export default function FieldJournalProto({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 sm:px-2">
      {/* -------- opening / intro -------- */}
      <section className="relative pt-14 sm:pt-20">
        <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
          About
        </span>

        <div className="mt-7 flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-12">
          <div className="flex-1">
            <h1 className="text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {intro.heading}
            </h1>
            {intro.text && (
              <div className="mt-6 space-y-5 text-lg leading-9 text-neutral-700">
                {intro.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>

          {intro.image && (
            <div className="relative shrink-0 sm:-mr-6">
              <PhotoFrame
                src={intro.image}
                alt={intro.imageAlt || ""}
                width={420}
                height={525}
                rotate={-1.5}
                className="w-48 sm:w-52"
              />
              <Annotation className="absolute -right-3 -top-6 rotate-3 sm:right-auto sm:-left-6">
                me
              </Annotation>
            </div>
          )}
        </div>

        {intro.signature && (
          <div className="mt-8 flex items-end gap-4">
            <p
              className="text-3xl font-semibold leading-none"
              style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
            >
              {intro.signature}
            </p>
            <CurvedArrow className="mb-1 -rotate-12" />
            <Annotation className="text-base text-neutral-400">that&apos;s me</Annotation>
          </div>
        )}
      </section>

      {/* -------- FIELD NOTE 01 — Making -------- */}
      <section className="relative mt-24">
        <SectionLabel>Field Note 01</SectionLabel>
        {making.heading && (
          <h2 className="mt-5 max-w-md text-3xl font-semibold tracking-tight text-neutral-900">
            {making.heading}
          </h2>
        )}
        <div className="mt-6 grid gap-8 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10">
          <div className="space-y-5 text-lg leading-9 text-neutral-700">
            {making.text?.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {making.linkUrl && (
              <a
                href={making.linkUrl}
                className="mt-2 inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {making.linkLabel} →
              </a>
            )}
          </div>
          {making.image && (
            <div className="relative sm:mt-8">
              <PhotoFrame
                src={making.image}
                alt={making.imageAlt || ""}
                caption="the workshop"
                rotate={1.25}
                className="w-full sm:w-56 sm:-rotate-1"
              />
            </div>
          )}
        </div>
      </section>

      <Rule className="mx-auto my-16" />

      {/* -------- FIELD NOTE 02 — Mountains -------- */}
      <section className="relative mt-4">
        <SectionLabel>Field Note 02</SectionLabel>
        {mountains.heading && (
          <h2 className="mt-5 max-w-md text-3xl font-semibold tracking-tight text-neutral-900">
            {mountains.heading}
          </h2>
        )}
        {mountains.location && (
          <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            <span aria-hidden="true" className="inline-block h-px w-4 bg-[var(--color-accent)]" />
            {mountains.location}
          </p>
        )}
        <div className="mt-7 grid gap-8 sm:grid-cols-[0.9fr_1.1fr] sm:gap-12">
          {mountains.image && (
            <div className="relative order-1 sm:order-none">
              <PhotoFrame
                src={mountains.image}
                alt={mountains.imageAlt || ""}
                caption="somewhere above the road"
                rotate={-1}
                className="w-full sm:w-60"
              />
              <Annotation className="absolute -left-4 -top-7 -rotate-6">
                breath in
              </Annotation>
            </div>
          )}
          <div className="space-y-5 text-lg leading-9 text-neutral-700 sm:pt-10">
            {mountains.text?.split("\n\n").map((p, i) => (
              <p key={i} className="max-w-sm">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <Rule className="mx-auto my-16" />

      {/* -------- FIELD NOTE 03 — Reading -------- */}
      <section className="relative mt-4">
        <SectionLabel>Field Note 03</SectionLabel>
        {reading.heading && (
          <h2 className="mt-5 max-w-md text-3xl font-semibold tracking-tight text-neutral-900">
            {reading.heading}
          </h2>
        )}
        <div className="mt-7 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
          {reading.bookCover && (
            <PhotoFrame
              src={reading.bookCover}
              alt={reading.bookCoverAlt || reading.bookTitle}
              width={300}
              height={450}
              rotate={-2}
              caption={reading.bookTitle}
              className="w-32 sm:w-36"
            />
          )}
          <div className="sm:pt-6">
            <div className="space-y-5 text-lg leading-9 text-neutral-700">
              {reading.text?.split("\n\n").map((p, i) => (
                <p key={i} className="max-w-sm">
                  {p}
                </p>
              ))}
            </div>
            {reading.bookAuthor && (
              <p className="mt-5 text-sm text-[var(--muted)]">— {reading.bookAuthor}</p>
            )}
          </div>
        </div>
      </section>

      <Rule className="mx-auto my-16" />

      {/* -------- FIELD NOTE 04 — Right now -------- */}
      <section className="relative mt-4">
        <SectionLabel>Field Note 04</SectionLabel>
        <h3 className="mt-5 text-2xl text-neutral-800" style={{ fontFamily: "var(--font-script)" }}>
          right now
        </h3>
        <ul className="mt-6 space-y-4 border-l border-[var(--color-border)] pl-6">
          {now.map((item, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[27px] top-3 h-2 w-2 rounded-[2px] border border-[var(--color-accent)]"
              />
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {item.label}
              </p>
              <p className="mt-0.5 text-lg text-neutral-700">{item.value}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* -------- FINAL NOTE — closing -------- */}
      <section className="relative mt-24 text-center">
        {closing.eyebrow && (
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
            {closing.eyebrow}
          </p>
        )}
        {closing.heading && (
          <h2 className="mx-auto mt-5 max-w-md text-3xl font-semibold tracking-tight text-neutral-900">
            {closing.heading}
          </h2>
        )}
        {closing.text && (
          <div className="mx-auto mt-6 max-w-md space-y-5 text-lg leading-9 text-neutral-700">
            {closing.text.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {closing.signature && (
          <p
            className="mt-8 text-3xl font-semibold"
            style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
          >
            {closing.signature}
          </p>
        )}
      </section>
    </div>
  );
}
