// About page — one winding MountainTrail segment.
//
// Renders the SVG stroke for a single waypoint band. The trail enters at the
// top of the stop, curves to the waypoint marker, and continues out the bottom,
// so consecutive stops visually join into one continuous path.
//
// The SVG uses viewBox="0 0 100 100" with preserveAspectRatio="none", so the
// path coordinates are percentages of the stop band: fully responsive at any
// width or height without any JavaScript.
//
// Two geometry variants are rendered (mobile left-rail, desktop full weave) so
// the trail never collides with content on a narrow phone.

interface MountainTrailProps {
  /** Desktop path through this stop's band. */
  desktopD: string;
  /** Mobile path through this stop's band. */
  mobileD: string;
}

export default function MountainTrail({ desktopD, mobileD }: MountainTrailProps) {
  return (
    <>
      {/* Mobile: the trail hugs the left, weaving gently */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full sm:hidden"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d={mobileD}
          pathLength={100}
          className="about-trail-draw"
          stroke="var(--color-accent-soft)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
        />
      </svg>

      {/* Desktop: full-page winding trail */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full sm:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d={desktopD}
          pathLength={100}
          className="about-trail-draw"
          stroke="var(--color-accent-soft)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
      </svg>
    </>
  );
}
