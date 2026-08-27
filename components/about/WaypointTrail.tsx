import type { ReactNode } from "react";
import MountainTrail from "@/components/about/MountainTrail";
import MountainLandscape from "@/components/about/MountainLandscape";
import WaypointMarker from "@/components/about/WaypointMarker";

interface WaypointTrailProps {
  children: ReactNode[];
}

type Side = "left" | "right" | "center";

/**
 * The About journey — one winding Himalayan trail with six waypoint stops.
 *
 * This is the orchestrator: it establishes the mountain landscape, draws the
 * winding SVG trail that weaves through the page, places each numbered waypoint
 * marker on the line, and frames its content as a small stop found along the
 * route. Content is positioned beside the trail naturally (varying sides and
 * depths), not in a rigid alternating editorial grid.
 *
 * The trail is deliberately not a straight line: the path bends left and right,
 * each stop sits at its own lateral position, and the path carries on at the
 * bottom so the journey reads as "continues beyond the page".
 */

const r2 = (n: number) => Number(n.toFixed(2));

// The lateral position of each waypoint marker, as a fraction of container width.
// The trail weaves left and right as it descends.
const DESKTOP_X = [0.26, 0.74, 0.32, 0.68, 0.5, 0.5];
const MOBILE_X = [0.1, 0.14, 0.1, 0.14, 0.12, 0.12];

// Which side the content sits on for each stop (right = content hugs the right,
// trail and marker pass on the left). Not a strict alternating pattern.
const CONTENT_SIDE: Side[] = ["right", "left", "right", "left", "center", "center"];

const sideClasses: Record<Side, string> = {
  left: "sm:mr-auto sm:text-left",
  right: "sm:ml-auto sm:text-left",
  center: "sm:mx-auto sm:text-center",
};

// Build a smooth, organic cubic through this stop band: enters at the top,
// reaches the waypoint marker, and continues out the bottom so consecutive
// stops join into one continuous path.
function segment(ex: number, markerX: number, lx: number): string {
  return [
    `M ${r2(ex)} 0`,
    `C ${r2(ex)} 44, ${r2(markerX)} 4, ${r2(markerX)} 18`,
    `C ${r2(markerX)} 34, ${r2(lx)} 82, ${r2(lx)} 100`,
  ].join(" ");
}

interface StopFrameProps {
  index: number;
  children: ReactNode;
}

function StopFrame({ index, children }: StopFrameProps) {
  const i = index;
  const prevX = DESKTOP_X[i - 1] ?? DESKTOP_X[i];
  const nextX = DESKTOP_X[i + 1] ?? DESKTOP_X[i];
  const entryX = (prevX + DESKTOP_X[i]) / 2;
  const exitX = (DESKTOP_X[i] + nextX) / 2;

  const mPrevX = MOBILE_X[i - 1] ?? MOBILE_X[i];
  const mNextX = MOBILE_X[i + 1] ?? MOBILE_X[i];
  const mEntryX = (mPrevX + MOBILE_X[i]) / 2;
  const mExitX = (MOBILE_X[i] + mNextX) / 2;

  const side = CONTENT_SIDE[i];

  return (
    <div className="relative">
      <MountainTrail
        desktopD={segment(entryX, DESKTOP_X[i], exitX)}
        mobileD={segment(mEntryX, MOBILE_X[i], mExitX)}
      />

      {/* Waypoint marker — sits on the trail (mobile variant hugs the left) */}
      <div
        aria-hidden="true"
        className="absolute left-[12%] top-[16%] z-10 -translate-x-1/2 -translate-y-1/2 sm:hidden"
      >
        <WaypointMarker number={i + 1} />
      </div>
      <div
        className="absolute top-[16%] z-10 -translate-x-1/2 -translate-y-1/2 hidden sm:block"
        style={{ left: `${DESKTOP_X[i] * 100}%` }}
      >
        <WaypointMarker number={i + 1} />
      </div>

      {/* The content / stop */}
      <div className="relative z-10 pl-12 sm:pl-0">
        <div className={`sm:max-w-[34rem] ${sideClasses[side]} pt-6`}>{children}</div>
      </div>
    </div>
  );
}

// A short, faded trail that carries on beyond the last waypoint — the journey
// continues off the page toward the mountains.
function TrailEnd() {
  return (
    <div className="relative h-40 sm:h-64">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 50 0 C 44 30, 52 50, 38 78 C 30 92, 40 100, 40 100"
          pathLength={100}
          className="about-trail-draw"
          stroke="var(--color-accent-soft)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.4}
        />
      </svg>
    </div>
  );
}

export default function WaypointTrail({ children }: WaypointTrailProps) {
  const sections = Array.isArray(children) ? children : [children];

  return (
    <div className="relative">
      {/* trailhead horizon at the very top */}
      <div aria-hidden="true" className="relative h-16 sm:h-24">
        <svg
          className="absolute inset-x-0 top-0 h-full w-full"
          viewBox="0 0 800 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 60 L90 34 L170 54 L260 28 L350 50 L460 32 L560 50 L660 30 L740 46 L800 36"
            stroke="var(--color-border)"
            strokeWidth={1.5}
            opacity={0.9}
          />
          <path
            d="M0 74 L110 52 L210 68 L320 48 L440 66 L560 46 L680 64 L800 54"
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.6}
          />
        </svg>
      </div>

      {/* the journey */}
      <div className="space-y-20 sm:space-y-28">
        {sections.map((section, index) => (
          <StopFrame key={index} index={index}>
            {section}
          </StopFrame>
        ))}
      </div>

      {/* the trail continues toward the mountains below */}
      <TrailEnd />

      {/* the landscape the trail disappears into */}
      <MountainLandscape />
    </div>
  );
}
