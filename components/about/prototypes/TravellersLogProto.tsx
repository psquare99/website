import type { ReactNode } from "react";
import Image from "next/image";
import type { AboutData } from "@/types/about";

/**
 * Prototype D — TRAVELLER'S LOG
 *
 * The About page reads as a personal record of an ongoing journey. A FIELD LOG
 * header, a CURRENT LOCATION strip, then numbered entries (Building / Wandering /
 * Reading / Now). Photographs are documentary evidence from the road. Only the
 * location that already exists in the content is used as metadata — no invented
 * dates or facts.
 */

function Entry({
  number,
  place,
  children,
  image,
  imageAlt,
  caption,
  imageFirst = false,
}: {
  number: string;
  place: string;
  children: ReactNode;
  image?: string;
  imageAlt?: string;
  caption?: string;
  imageFirst?: boolean;
}) {
  const Photo = image ? (
    <figure className="overflow-hidden rounded-sm border border-[var(--color-border)] shadow-sm">
      <Image src={image} alt={imageAlt || ""} width={640} height={420} className="h-auto w-full object-cover" />
      {caption && <figcaption className="px-3 py-2 font-sans text-xs text-[var(--muted)]">{caption}</figcaption>}
    </figure>
  ) : null;

  return (
    <section className="grid gap-8 py-14 sm:grid-cols-[1fr_1fr] sm:gap-14">
      <div className={`flex flex-col gap-6 ${imageFirst ? "sm:order-2" : ""}`}>
        <div className="flex items-baseline gap-4 border-b border-[var(--color-border)] pb-3">
          <span className="font-mono text-xs text-[var(--color-accent)]">{number}</span>
          <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
            {place}
          </span>
        </div>
        <div className="space-y-5 text-lg leading-9 text-neutral-700">{children}</div>
      </div>
      {Photo && <div className={`sm:pt-6 ${imageFirst ? "sm:order-1" : ""}`}>{Photo}</div>}
    </section>
  );
}

export default function TravellersLogProto({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 sm:px-2">
      {/* FIELD LOG — opening */}
      <section className="border-b border-[var(--color-border)] pt-14 pb-10 sm:pt-20">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
          <span>Field Log</span>
          <span>01 — about</span>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-16">
          <div>
            <h1 className="text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {intro.heading}
            </h1>
            {intro.text && (
              <div className="mt-6 max-w-xl space-y-5 text-lg leading-9 text-neutral-700">
                {intro.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {intro.signature && (
              <p
                className="mt-6 text-3xl font-semibold"
                style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
              >
                {intro.signature}
              </p>
            )}
          </div>
          {intro.image && (
            <figure className="overflow-hidden rounded-sm border border-[var(--color-border)] shadow-sm">
              <Image
                src={intro.image}
                alt={intro.imageAlt || ""}
                width={300}
                height={380}
                className="h-auto w-44 object-cover sm:w-52"
              />
            </figure>
          )}
        </div>
      </section>

      {/* CURRENT LOCATION */}
      {mountains.location && (
        <section className="flex items-center justify-between gap-6 border-b border-[var(--color-border)] py-8">
          <div>
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
              Current location
            </p>
            <p className="mt-1 text-2xl text-neutral-800">{mountains.location}</p>
          </div>
          <svg aria-hidden="true" viewBox="0 0 32 32" className="h-9 w-9 shrink-0 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth={1.3}>
            <path d="M16 4 L18.5 13.5 L28 16 L18.5 18.5 L16 28 L13.5 18.5 L4 16 L13.5 13.5 Z" fill="currentColor" fillOpacity={0.12} />
            <circle cx="16" cy="16" r="3" />
          </svg>
        </section>
      )}

      {/* ENTRIES */}
      <div className="divide-y divide-[var(--color-border)]">
        <Entry number="02" place="Building" image={making.image} imageAlt={making.imageAlt} caption="inside the workshop">
          {making.heading && <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{making.heading}</h2>}
          {making.text?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          {making.linkUrl && (
            <a href={making.linkUrl} className="inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
              {making.linkLabel} →
            </a>
          )}
        </Entry>

        <Entry number="03" place="Wandering" image={mountains.image} imageAlt={mountains.imageAlt} caption="on the trail" imageFirst>
          {mountains.heading && <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{mountains.heading}</h2>}
          {mountains.text?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
        </Entry>

        <Entry number="04" place="Reading" image={reading.bookCover} imageAlt={reading.bookCoverAlt || reading.bookTitle} caption={reading.bookTitle}>
          {reading.heading && <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{reading.heading}</h2>}
          {reading.text?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          {reading.bookAuthor && <p className="text-sm text-[var(--muted)]">— {reading.bookAuthor}</p>}
        </Entry>
      </div>

      {/* NOW — log of what's current */}
      <section className="border-t border-[var(--color-border)] py-14">
        <div className="flex items-baseline gap-4 pb-3">
          <span className="font-mono text-xs text-[var(--color-accent)]">05</span>
          <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
            Now
          </span>
        </div>
        <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {now.map((item, i) => (
            <div key={i} className="flex items-baseline gap-3">
              <dt className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {item.label}
              </dt>
              <dd className="text-lg text-neutral-700">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* NEXT ENTRY — closing */}
      <section className="border-t border-[var(--color-border)] py-16 text-center">
        {closing.eyebrow && (
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
            {closing.eyebrow}
          </p>
        )}
        {closing.heading && (
          <h2 className="mx-auto mt-4 max-w-md text-3xl font-semibold tracking-tight text-neutral-900">
            {closing.heading}
          </h2>
        )}
        {closing.text && (
          <div className="mx-auto mt-6 max-w-md space-y-5 text-lg leading-9 text-neutral-700">
            {closing.text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
        {closing.signature && (
          <p className="mt-8 text-3xl font-semibold" style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}>
            {closing.signature}
          </p>
        )}
      </section>
    </div>
  );
}
