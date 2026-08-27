import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Shared primitives for the /about visual direction prototypes.
 * Visual-prototyping only — not part of the production About template.
 */

const accent = "var(--color-accent)";

export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)] ${className}`}
    >
      <span aria-hidden="true" className="inline-block h-px w-6 bg-[var(--color-accent)]" />
      {children}
    </span>
  );
}

/** A handwritten-style annotation in the Caveat script. */
export function Annotation({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block text-xl leading-none text-[var(--color-accent-soft)] ${className}`}
      style={{ fontFamily: "var(--font-script)" }}
    >
      {children}
    </span>
  );
}

/** A short foot-rule used between blocks. */
export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-px w-full max-w-[180px] bg-[var(--color-border)] ${className}`} />;
}

/** A photograph pinned/attached to the page, with optional rotation + caption. */
export function PhotoFrame({
  src,
  alt,
  width = 600,
  height = 400,
  caption,
  rotate = 0,
  className = "",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <figure className={`inline-block ${className}`}>
      <div
        className={`overflow-hidden rounded-[2px] border border-[var(--color-border)] bg-white p-1.5 shadow-sm`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 font-sans text-xs text-[var(--muted)]">{caption}</figcaption>
      )}
    </figure>
  );
}

/** A tiny squiggle/arrow pointing at something — a restrained handwritten cue. */
export function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 24"
      className={`h-6 w-10 ${className}`}
      fill="none"
      stroke={accent}
      strokeWidth={1.4}
      strokeLinecap="round"
    >
      <path d="M2 20 C 14 18, 30 14, 36 6" />
      <path d="M30 6 L 37 5 M36 6 L 33 12" />
    </svg>
  );
}
