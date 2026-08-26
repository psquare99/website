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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--color-accent)] text-xs font-semibold text-white shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Desktop: left content (even) or empty */}
              <div className={`${isEven ? "sm:text-right" : "sm:order-3"} hidden sm:block`}>
                {isEven ? section : null}
              </div>

              {/* Desktop: center marker */}
              <div className="hidden items-start justify-center sm:flex sm:order-2" aria-hidden="true">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--color-accent)] text-xs font-semibold text-white shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Desktop: right content (odd) or empty */}
              <div className={`${!isEven ? "" : "sm:order-3"} hidden sm:block`}>
                {!isEven ? section : null}
              </div>

              {/* Mobile: full-width content */}
              <div className="sm:hidden">
                {section}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
