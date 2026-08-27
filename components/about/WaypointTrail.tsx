import type { ReactNode } from "react";
import WaypointMarker from "@/components/about/WaypointMarker";

interface WaypointTrailProps {
  children: ReactNode[];
}

/**
 * Vertical trail for the About Waypoint page.
 *
 * Provides the single continuous central/left line and the numbered markers.
 * Each waypoint section renders its own image↔text composition around the trail
 * (via `WaypointComposition`), so the trail remains the structural spine while
 * content alternates naturally around it.
 *
 * Desktop: one continuous centered trail. Mobile: a single left-side trail.
 */
export default function WaypointTrail({ children }: WaypointTrailProps) {
  const sections = Array.isArray(children) ? children : [children];

  return (
    <div className="relative">
      {/* One continuous trail — centered on desktop, left of content on mobile */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[17px] w-px bg-[var(--color-border)] sm:left-1/2"
      />

      <div className="space-y-16 sm:space-y-24">
        {sections.map((section, index) => {
          const i = index + 1;
          return (
            <div key={index} className="relative">
              {/* Waypoint marker — always centred on the trail, above the line */}
              <div className="absolute top-0 left-[17px] z-10 -translate-x-1/2 sm:left-1/2">
                <WaypointMarker number={i} />
              </div>

              {section}
            </div>
          );
        })}
      </div>
    </div>
  );
}
