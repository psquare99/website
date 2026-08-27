import type { ReactNode } from "react";
import Image from "next/image";
import type { AboutData } from "@/types/about";
import { SectionLabel, Rule } from "@/components/about/prototypes/shared";

/**
 * Prototype B — BASE CAMP
 *
 * A quiet mountain cabin / personal workspace. Large photographic moments set
 * against warm whitespace, divided by thin rules. Each section reads like a
 * room of the base camp: The Workshop, The Mountains, The Bookshelf, Right Now,
 * and The Road Ahead. The workshop photograph is the emotional centre.
 */

function Room({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="py-20 first:pt-0 last:pb-24 sm:py-28">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function BigPhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-md border border-[var(--color-border)] shadow-sm ${className}`}>
      <Image src={src} alt={alt} width={800} height={520} className="h-auto w-full object-cover" />
    </div>
  );
}

export default function BaseCampProto({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-2">
      {/* -------- ABOUT — portrait + intro -------- */}
      <section className="pt-14 sm:pt-24">
        <div className="grid gap-10 sm:grid-cols-[0.85fr_1fr] sm:items-start sm:gap-14">
          <div className="order-2 sm:order-1">
            <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              About
            </span>
            <h1 className="mt-5 text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl">
              {intro.heading}
            </h1>
            {intro.text && (
              <div className="mt-6 space-y-5 text-lg leading-9 text-neutral-700">
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
            <div className="order-1 sm:order-2">
              <BigPhoto src={intro.image} alt={intro.imageAlt || ""} className="max-w-[260px]" />
            </div>
          )}
        </div>
      </section>

      {/* -------- THE WORKSHOP -------- */}
      <Room label="The Workshop">
        {making.heading && (
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-neutral-900">
            {making.heading}
          </h2>
        )}
        <div className="mt-8 grid gap-10 sm:grid-cols-2 sm:items-start sm:gap-12">
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
            <BigPhoto src={making.image} alt={making.imageAlt || ""} className="sm:mt-2" />
          )}
        </div>
      </Room>

      <Rule className="mx-auto max-w-[200px]" />

      {/* -------- THE MOUNTAINS -------- */}
      <Room label="The Mountains">
        <div className="grid gap-10 sm:grid-cols-2 sm:items-start sm:gap-12">
          {mountains.image ? (
            <BigPhoto src={mountains.image} alt={mountains.imageAlt || ""} className="order-2 sm:order-1" />
          ) : null}
          <div className="order-1 sm:order-2">
            {mountains.heading && (
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
                {mountains.heading}
              </h2>
            )}
            {mountains.location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                <span aria-hidden="true" className="inline-block h-px w-4 bg-[var(--color-accent)]" />
                {mountains.location}
              </p>
            )}
            {mountains.text && (
              <div className="mt-5 space-y-5 text-lg leading-9 text-neutral-700">
                {mountains.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Room>

      <Rule className="mx-auto max-w-[200px]" />

      {/* -------- THE BOOKSHELF -------- */}
      <Room label="The Bookshelf">
        {reading.heading && (
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
            {reading.heading}
          </h2>
        )}
        <div className="mt-8 flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-14">
          <div className="sm:max-w-md">
            {reading.text && (
              <div className="space-y-5 text-lg leading-9 text-neutral-700">
                {reading.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <div className="mt-6 border-l-2 border-[var(--color-accent)] pl-5">
              {reading.bookTitle && (
                <p className="font-serif text-xl font-semibold text-neutral-900">{reading.bookTitle}</p>
              )}
              {reading.bookAuthor && <p className="mt-1 text-sm text-[var(--muted)]">{reading.bookAuthor}</p>}
            </div>
          </div>
          {reading.bookCover && (
            <div className="shrink-0 overflow-hidden rounded-sm border border-[var(--color-border)] shadow-sm sm:mt-4">
              <Image
                src={reading.bookCover}
                alt={reading.bookCoverAlt || reading.bookTitle}
                width={300}
                height={450}
                className="h-auto w-32 object-cover sm:w-36"
              />
            </div>
          )}
        </div>
      </Room>

      <Rule className="mx-auto max-w-[200px]" />

      {/* -------- RIGHT NOW -------- */}
      <Room label="Right Now">
        <ul className="space-y-6 border-l border-[var(--color-border)] pl-8 sm:pl-10">
          {now.map((item, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[33px] top-3 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]"
              />
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {item.label}
              </p>
              <p className="mt-1 text-2xl text-neutral-800">{item.value}</p>
            </li>
          ))}
        </ul>
      </Room>

      <Rule className="mx-auto max-w-[200px]" />

      {/* -------- THE ROAD AHEAD -------- */}
      <section className="py-20 pb-28 text-center sm:py-24">
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
