import type { ReactNode } from "react";
import Image from "next/image";
import type { AboutData } from "@/types/about";
import { Annotation } from "@/components/about/prototypes/shared";

/**
 * Prototype C — WAYFINDER / COMPASS
 *
 * The About page as a personal compass. A faint circular compass-ring geometry
 * and tiny directional marks give the page an orientation motif, while sections
 * are staggered (not a strict column) so they read as bearings radiating from a
 * central idea. Understated and literary — not a navigation app.
 */

const accent = "var(--color-accent)";

/** Faint compass ring: outer circle + tick marks + light cardinal points. */
function CompassRing({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 32 });
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={`pointer-events-none h-40 w-40 ${className}`}
      fill="none"
      stroke={accent}
    >
      <circle cx="100" cy="100" r="92" strokeWidth={1} opacity={0.35} />
      <circle cx="100" cy="100" r="70" strokeWidth={0.75} opacity={0.25} />
      {ticks.map((_, i) => {
        const deg = (360 / 32) * i;
        const major = i % 4 === 0;
        const len = major ? 10 : 5;
        const inner = major ? 66 : 71;
        const rad = (deg * Math.PI) / 180;
        const x1 = 100 + inner * Math.sin(rad);
        const y1 = 100 - inner * Math.cos(rad);
        const x2 = 100 + (inner + len) * Math.sin(rad);
        const y2 = 100 - (inner + len) * Math.cos(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 1.5 : 0.75} opacity={major ? 0.5 : 0.3} />;
      })}
    </svg>
  );
}

/** A small directional tick + label used before a section. */
function Bearing({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill={accent}>
        <path d="M8 2 L9.5 9.5 L8 12 L6.5 9.5 Z" opacity={0.7} />
      </svg>
      {label}
    </span>
  );
}

function Section({
  label,
  offset = "",
  children,
}: {
  label: string;
  offset?: string;
  children: ReactNode;
}) {
  return (
    <section className={`relative ${offset}`}>
      <Bearing label={label} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

const nowIcon = ["▲", "◆", "●", "■", "✦", "◗", "◈"];

export default function WayfinderProto({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 sm:px-2">
      {/* compass-influenced intro */}
      <section className="relative grid gap-10 pt-16 sm:grid-cols-[1fr_auto] sm:items-start sm:pt-24 sm:pr-44">
        <div>
          <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
            Bearing · 001
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-5xl">
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
          <div className="relative hidden sm:block">
            <CompassRing className="absolute -right-24 -top-20 opacity-60" />
            <div className="relative overflow-hidden rounded-md border border-[var(--color-border)] shadow-sm">
              <Image
                src={intro.image}
                alt={intro.imageAlt || ""}
                width={260}
                height={325}
                className="h-auto w-48 object-cover"
              />
            </div>
            <Annotation className="absolute -bottom-4 -left-8 -rotate-6">true north</Annotation>
          </div>
        )}
      </section>

      <div className="mt-20 space-y-20 sm:space-y-24">
        {/* WHAT I BUILD */}
        <Section label="what I build" offset="sm:ml-[8%]">
          <div className="grid gap-8 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:gap-12">
            <div className="space-y-5 text-lg leading-9 text-neutral-700">
              {making.heading && (
                <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
                  {making.heading}
                </h2>
              )}
              {making.text?.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {making.linkUrl && (
                <a
                  href={making.linkUrl}
                  className="inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {making.linkLabel} →
                </a>
              )}
            </div>
            {making.image && (
              <div className="overflow-hidden rounded-md border border-[var(--color-border)] shadow-sm">
                <Image
                  src={making.image}
                  alt={making.imageAlt || ""}
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>
        </Section>

        {/* WHERE I AM */}
        <Section label="where I am" offset="sm:mr-[8%] sm:ml-auto sm:max-w-xl">
          {mountains.heading && (
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              {mountains.heading}
            </h2>
          )}
          {mountains.location && (
            <p className="mt-3 flex items-center gap-2 font-sans text-sm text-[var(--muted)]">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill={accent}>
                <path d="M8 2 L9.5 9.5 L8 12 L6.5 9.5 Z" opacity={0.7} />
              </svg>
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
          {mountains.image && (
            <div className="mt-7 overflow-hidden rounded-md border border-[var(--color-border)] shadow-sm">
              <Image
                src={mountains.image}
                alt={mountains.imageAlt || ""}
                width={640}
                height={420}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </Section>

        {/* WHAT I READ */}
        <Section label="what I read" offset="sm:ml-[10%] sm:max-w-xl">
          {reading.heading && (
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              {reading.heading}
            </h2>
          )}
          {reading.text && (
            <div className="mt-5 space-y-5 text-lg leading-9 text-neutral-700">
              {reading.text.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <div className="mt-7 flex items-center gap-6">
            {reading.bookCover && (
              <div className="overflow-hidden rounded-sm border border-[var(--color-border)] shadow-sm">
                <Image
                  src={reading.bookCover}
                  alt={reading.bookCoverAlt || reading.bookTitle}
                  width={220}
                  height={330}
                  className="h-auto w-24 object-cover"
                />
              </div>
            )}
            <div>
              {reading.bookTitle && (
                <p className="font-serif text-xl font-semibold text-neutral-900">{reading.bookTitle}</p>
              )}
              {reading.bookAuthor && <p className="mt-1 text-sm text-[var(--muted)]">{reading.bookAuthor}</p>}
            </div>
          </div>
        </Section>

        {/* RIGHT NOW — radiating */}
        <Section label="what I'm exploring" offset="sm:ml-[4%]">
          <div className="relative">
            <CompassRing className="absolute -right-6 -top-10 opacity-50 sm:-right-10" />
            <ul className="relative grid max-w-2xl gap-x-12 gap-y-6 sm:grid-cols-2">
              {now.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1 text-xs text-[var(--color-accent)]">
                    {nowIcon[i % nowIcon.length]}
                  </span>
                  <div>
                    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl text-neutral-800">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* CLOSING */}
        <section className="relative pb-4 pt-6 text-center">
          <div className="mx-auto flex w-fit items-center gap-6">
            <CompassRing className="opacity-40" />
            <span aria-hidden="true" className="h-px w-10 bg-[var(--color-border)]" />
            <span aria-hidden="true" className="h-px w-24 bg-[var(--color-border)]" />
          </div>
          {closing.eyebrow && (
            <p className="mt-8 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
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
    </div>
  );
}
