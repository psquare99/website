// About page — subtle line-art mountain environment.
//
// Low-contrast, restrained ink line-art that establishes the Himalayan setting
// without ever competing with the content: distant peaks, gentle terrain
// contours and a couple of pines. Purely decorative (`aria-hidden`).
//
// Rendering uses the existing palette (neutral border + soft accent) so the
// illustration adapts to the site rather than introducing a new one.

const RIDGES = [
  "M0 46 L70 22 L118 38 L170 12 L232 30 L300 8 L356 26 L420 16 L470 28 L540 10 L620 24 L700 14",
  "M0 64 L84 40 L150 56 L214 38 L286 52 L354 36 L430 50 L500 40 L572 52 L650 42 L720 50 L800 44",
];

const PINES = [
  { x: 40, y: 86, s: 1 },
  { x: 92, y: 92, s: 0.8 },
  { x: 690, y: 88, s: 0.9 },
  { x: 738, y: 94, s: 0.7 },
];

function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke="currentColor" fill="none" strokeWidth={1.5}>
      <path d="M0 6 L-14 18 L14 18 Z" />
      <path d="M0 0 L-10 10 L10 10 Z" />
      <path d="M0 -7 L-6 0 L6 0 Z" />
      <path d="M0 18 L0 30" />
    </g>
  );
}

export default function MountainLandscape() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 overflow-hidden">
      {/* Distant ridge across the very top (the trailhead's horizon) */}
      <svg
        className="absolute -top-24 left-0 h-40 w-full"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d={RIDGES[0]} stroke="var(--color-border)" strokeWidth={1.5} opacity={0.9} />
        <path d={RIDGES[1]} stroke="var(--color-border)" strokeWidth={1} opacity={0.6} />
      </svg>

      {/* Bottom: the landscape the trail disappears into */}
      <svg
        className="absolute bottom-0 left-0 h-64 w-full"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* far ridge */}
        <path
          d="M0 78 L90 52 L170 72 L260 44 L350 68 L450 50 L540 70 L630 46 L720 66 L800 56"
          stroke="var(--color-border)"
          strokeWidth={1.5}
          opacity={0.9}
        />
        {/* nearer ridge */}
        <path
          d="M0 86 L120 66 L230 82 L330 64 L440 80 L560 62 L680 78 L800 70"
          stroke="var(--color-border)"
          strokeWidth={1}
          opacity={0.6}
        />
        {/* terrain contours */}
        <path d="M-20 94 Q 180 86 360 92 T 760 88" stroke="var(--color-border)" strokeWidth={1} opacity={0.5} />
        {/* foreground pines */}
        {PINES.map((p, i) => (
          <Pine key={i} {...p} />
        ))}
        {/* small accent ridge hint */}
        <path
          d="M352 44 L430 50 L510 40"
          stroke="var(--color-accent-soft)"
          strokeWidth={1.2}
          opacity={0.6}
        />
      </svg>
    </div>
  );
}
