import type { ReactNode } from "react";
import WallPin from "@/components/about/WallPin";

type Paper = "note" | "scrap" | "notebook";

interface WallNoteProps {
  paper?: Paper;
  rotate?: number;
  /** Optional per-object width / offset helpers. */
  className?: string;
  children: ReactNode;
  /** Rendered above the paper — a title/label line. */
  title?: ReactNode;
}

const paperStyles: Record<
  Paper,
  { bg: string; shadow: string; lines?: boolean }
> = {
  // Warm off-white paper note.
  note: {
    bg: "#fbfaf7",
    shadow: "0 1px 5px rgba(0,0,0,0.08)",
  },
  // Slightly warmer, yellower small scrap.
  scrap: {
    bg: "#f7f1e3",
    shadow: "0 1px 5px rgba(0,0,0,0.08)",
  },
  // Very subtle ruled notebook sheet.
  notebook: {
    bg: "#fcfbf7",
    shadow: "0 1px 6px rgba(0,0,0,0.10)",
    lines: true,
  },
};

/**
 * A paper object pinned to the workshop wall. Three very subtle paper
 * treatments are available (note / scrap / notebook), kept restrained — the
 * goal is handmade, not craft-store.
 */
export default function WallNote({
  paper = "note",
  rotate = 0,
  className = "",
  children,
  title,
}: WallNoteProps) {
  const s = paperStyles[paper];
  return (
    <div className={`relative ${className}`}>
      <WallPin />
      <div
        className="relative border border-[var(--color-border)] px-5 py-4"
        style={{
          backgroundColor: s.bg,
          boxShadow: s.shadow,
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
          transformOrigin: "top center",
        }}
      >
        {s.lines && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 top-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 23px, var(--color-border) 23px, var(--color-border) 24px)",
              opacity: 0.55,
            }}
          />
        )}
        {title && <div className="relative mb-2">{title}</div>}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
