import type { ReactNode } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media/url";

/** Small sans-serif uppercase section badge / label in sage accent. */
export function BoardEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
      {children}
    </p>
  );
}

/** Mounting pin anchor at the top edge of the board. */
export function MountingPin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-3.5 w-3.5 rounded-full bg-[var(--color-accent)] shadow-[0_1px_3px_rgba(0,0,0,0.35)] ${className}`}
    >
      <span className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60" />
    </span>
  );
}

/** A photograph physically pinned to the whiteboard with subtle rotation and shadow. */
export function BoardPhoto({
  src,
  alt,
  width,
  height,
  rotate = 0,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Top pushpin */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      />
      <div
        className="bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.01]"
        style={{
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
          transformOrigin: "top center",
        }}
      >
        <Image
          src={getOptimizedImageUrl(src, { width: width * 2, quality: 85 })}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
        />
      </div>
    </div>
  );
}

/** Handwritten annotation in Caveat. */
export function HandNote({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none select-none text-xl leading-none text-[var(--color-accent-soft)] ${className}`}
      style={{ fontFamily: "var(--font-script)" }}
    >
      {children}
    </span>
  );
}
