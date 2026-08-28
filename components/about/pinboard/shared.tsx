import type { ReactNode } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/media/url";

/** Small sans-serif uppercase section label in the sage accent. */
export function BoardEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
      {children}
    </p>
  );
}

/** A photograph physically pinned to the board (white border, rotation, shadow). */
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
      />
      <div
        className="bg-white p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.14)]"
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, transformOrigin: "top center" }}
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

/** A tiny handwritten annotation (Caveat), used very sparingly. */
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
