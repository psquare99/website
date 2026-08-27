import type { ReactNode } from "react";

interface WaypointTrailProps {
  children: ReactNode[];
}

/**
 * Vertical trail layout for the About Waypoint page.
 *
 * Desktop: alternating left/right content with a centered vertical line and numbered markers.
 * Mobile: single-column with the trail on the left.
 */
export default function WaypointTrail({ children }: WaypointTrailProps) {
  const sections = Array.isArray(children) ? children : [children];

  return (
    <div className="relative">
      {/* Vertical trail line — desktop centered, mobile left-aligned */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[17px] top-2 w-px bg-neutral-200 sm:left-1/2 sm:-translate-x-px"
      />

      <div className="space-y-16 sm:space-y-24">
        {sections.map((section, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className="relative grid grid-cols-[36px_1fr] gap-6 sm:grid-cols-[1fr_48px_1fr] sm:gap-8"
            >
              {/* Mobile marker — visible below sm */}
              <div className="flex justify-center sm:hidden" aria-hidden="true">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[var(--color-accent)] text-xs font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Desktop: left column — content for even waypoints (01, 03, 05), empty for odd */}
              <div className={`hidden sm:block${isEven ? " sm:text-right" : ""}`}>
                {isEven ? section : null}
              </div>

              {/* Desktop: center marker — always on the vertical line */}
              <div
                className="relative z-10 hidden items-start justify-center sm:flex"
                aria-hidden="true"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[var(--color-accent)] text-xs font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Desktop: right column — content for odd waypoints (02, 04, 06), empty for even */}
              <div className="hidden sm:block">
                {!isEven ? section : null}
              </div>

              {/* Mobile: full-width content */}
              <div className="sm:hidden">{section}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
