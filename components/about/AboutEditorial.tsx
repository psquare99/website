import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Laptop,
  MapPin,
  BookOpen,
  Headphones,
  Coffee,
  Lightbulb,
  Compass,
  Gamepad2,
  Music,
  Camera,
  PenTool,
  Code,
  Globe,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import type { AboutData } from "@/types/about";
import { getOptimizedImageUrl } from "@/lib/media/url";

const ICON_MAP: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Laptop,
  MapPin,
  BookOpen,
  Headphones,
  Coffee,
  Lightbulb,
  Compass,
  Gamepad2,
  Music,
  Camera,
  PenTool,
  Code,
  Globe,
  Heart,
  Star,
};

interface AboutEditorialProps {
  about: AboutData;
}

export default function AboutEditorial({ about }: AboutEditorialProps) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32">
      {/* =========================================================================
          1. INTRO
          ========================================================================= */}
      <section aria-labelledby="about-intro-heading" className="space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            {intro.eyebrow || "ABOUT"}
          </p>
          <h1
            id="about-intro-heading"
            className="font-serif text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl"
          >
            {intro.heading || "A little about me."}
          </h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700 sm:text-xl sm:leading-8">
            {intro.text ? (
              intro.text.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : null}
            {intro.signature && (
              <p
                className="pt-2 text-3xl font-semibold text-[var(--color-accent)] sm:text-4xl"
                style={{ fontFamily: "var(--font-script)" }}
              >
                {intro.signature}
              </p>
            )}
          </div>

          {intro.image && (
            <figure className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-neutral-100 shadow-sm">
              <Image
                unoptimized
                src={getOptimizedImageUrl(intro.image, { width: 1000, quality: 85 })}
                alt={intro.imageAlt || intro.heading || "Prateek Pal portrait"}
                width={1000}
                height={1333}
                priority
                className="h-auto w-full object-cover"
              />
            </figure>
          )}
        </div>
      </section>

      {/* THIN NOTEBOOK DIVIDER */}
      <hr className="border-t border-[var(--color-border)]" aria-hidden="true" />

      {/* =========================================================================
          2. MAKING
          ========================================================================= */}
      <section aria-labelledby="about-making-heading" className="space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            01 / MAKING
          </p>
          {making.heading && (
            <h2
              id="about-making-heading"
              className="font-serif text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
            >
              {making.heading}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="space-y-5 font-serif text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-8">
            {making.text ? (
              making.text.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : null}

            {making.linkUrl && making.linkLabel && (
              <div className="pt-2">
                <Link
                  href={making.linkUrl}
                  className="group inline-flex items-center gap-2 font-medium text-neutral-900 transition-colors hover:text-[var(--color-accent)]"
                >
                  <span>{making.linkLabel}</span>
                  <span
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            )}
          </div>

          {making.image && (
            <figure className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-neutral-100 shadow-sm">
              <Image
                unoptimized
                src={getOptimizedImageUrl(making.image, { width: 1100, quality: 85 })}
                alt={making.imageAlt || making.heading || "Workshop"}
                width={1100}
                height={733}
                className="h-auto w-full object-cover"
              />
            </figure>
          )}
        </div>
      </section>

      {/* THIN NOTEBOOK DIVIDER */}
      <hr className="border-t border-[var(--color-border)]" aria-hidden="true" />

      {/* =========================================================================
          3. THE MOUNTAINS
          ========================================================================= */}
      <section aria-labelledby="about-mountains-heading" className="space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            02 / SOMEWHERE BETWEEN THE MOUNTAINS
          </p>
          {mountains.heading && (
            <h2
              id="about-mountains-heading"
              className="font-serif text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
            >
              {mountains.heading}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {mountains.image && (
            <figure className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-neutral-100 shadow-sm">
              <Image
                unoptimized
                src={getOptimizedImageUrl(mountains.image, { width: 1100, quality: 85 })}
                alt={mountains.imageAlt || mountains.heading || "The Himalayas"}
                width={1100}
                height={733}
                className="h-auto w-full object-cover"
              />
            </figure>
          )}

          <div className="space-y-5 font-serif text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-8">
            {mountains.text ? (
              mountains.text.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : null}

            {mountains.location && (
              <div className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)] font-sans">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{mountains.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* THIN NOTEBOOK DIVIDER */}
      <hr className="border-t border-[var(--color-border)]" aria-hidden="true" />

      {/* =========================================================================
          4. RIGHT NOW & READING
          ========================================================================= */}
      <section aria-labelledby="about-now-heading" className="space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            03 / RIGHT NOW
          </p>
          <h2
            id="about-now-heading"
            className="font-serif text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
          >
            These days & things I&apos;m exploring
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Living Pulse List */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Living Pulse
            </h3>
            <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[#faf8f5]/60 px-5 sm:px-6">
              {now &&
                now.map((item, index) => {
                  const Icon = ICON_MAP[item.icon] ?? ArrowRight;
                  return (
                    <li key={index} className="flex items-center justify-between gap-4 py-3.5 sm:py-4">
                      <div className="flex items-center gap-3">
                        <Icon
                          className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                          strokeWidth={1.75}
                        />
                        <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-right font-serif text-sm font-normal text-neutral-800 sm:text-base">
                        {item.value}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Current Reading */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              {reading.heading || "Current Reading"}
            </h3>
            <div className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[#faf8f5]/60 p-5 sm:p-6">
              {reading.text ? (
                <div className="space-y-3 font-serif text-sm leading-relaxed text-neutral-700 sm:text-base">
                  {reading.text.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : null}

              {(reading.bookCover || reading.bookTitle || reading.bookAuthor) && (
                <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-4">
                  {reading.bookCover && (
                    <Image
                      unoptimized
                      src={getOptimizedImageUrl(reading.bookCover, { width: 240, quality: 85 })}
                      alt={reading.bookCoverAlt || reading.bookTitle || "Current book cover"}
                      width={240}
                      height={360}
                      className="h-20 w-auto rounded border border-[var(--color-border)] object-cover shadow-sm sm:h-24"
                    />
                  )}
                  <div className="space-y-1">
                    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                      On the nightstand
                    </p>
                    {reading.bookTitle && (
                      <p className="font-serif text-base font-semibold text-neutral-900 sm:text-lg">
                        {reading.bookTitle}
                      </p>
                    )}
                    {reading.bookAuthor && (
                      <p className="font-serif text-sm text-neutral-600">
                        {reading.bookAuthor}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* THIN NOTEBOOK DIVIDER */}
      <hr className="border-t border-[var(--color-border)]" aria-hidden="true" />

      {/* =========================================================================
          5. CLOSING
          ========================================================================= */}
      <section aria-labelledby="about-closing-heading" className="space-y-6 py-6 text-center">
        {closing.eyebrow && (
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            {closing.eyebrow}
          </p>
        )}
        {closing.heading && (
          <h2
            id="about-closing-heading"
            className="font-serif text-2xl font-normal tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl"
          >
            {closing.heading}
          </h2>
        )}
        {closing.text && (
          <div className="mx-auto max-w-xl space-y-4 font-serif text-base leading-relaxed text-neutral-700 sm:text-lg">
            {closing.text.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {closing.signature && (
          <p
            className="pt-2 text-3xl font-semibold text-[var(--color-accent)] sm:text-4xl"
            style={{ fontFamily: "var(--font-script)" }}
          >
            {closing.signature}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm font-medium">
          <Link
            href="/journal"
            className="group inline-flex items-center gap-1.5 text-neutral-700 transition-colors hover:text-[var(--color-accent)]"
          >
            <span>Read the Journal</span>
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
          <span className="text-neutral-300" aria-hidden="true">
            ·
          </span>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 text-neutral-700 transition-colors hover:text-[var(--color-accent)]"
          >
            <span>Explore Projects</span>
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
