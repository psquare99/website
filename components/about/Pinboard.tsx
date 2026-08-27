import type { ReactNode } from "react";

interface PinboardProps {
  children: ReactNode;
  /** Slight deterministic rotation to make each board feel physical. */
  rotate?: number;
  /** CSS classes for sizing / layout of the sheet itself. */
  className?: string;
  /** Optional accessible label identifying this board. */
  label?: string;
}

const BOARD_STYLE = {
  backgroundColor: "#fbfaf6",
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.014) 0 1px, transparent 1px 7px)," +
    "radial-gradient(140% 90% at 50% 0%, rgba(255,255,255,0.6), transparent 55%)",
};

/**
 * A single physical board in the pinboard stack: warm cream surface, extremely
 * subtle textured texture, two small sage push-pins near the top, softly
 * rounded corners and a very slight shadow + rotation so it reads as a real
 * pinned board rather than a webpage panel.
 */
export default function Pinboard({
  children,
  rotate = 0,
  className = "",
  label,
}: PinboardProps) {
  return (
    <section
      aria-label={label}
      className={`relative rounded-[6px] border border-[var(--color-border)] ${className}`}
      style={{
        ...BOARD_STYLE,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.05), 0 12px 32px -18px rgba(0,0,0,0.35)",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* two pins near the upper portion */}
      <span aria-hidden="true" className="pointer-events-none absolute left-[18%] top-3 h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
        <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/60" />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute right-[18%] top-3 h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
        <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/60" />
      </span>
      {children}
    </section>
  );
}
