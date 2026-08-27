interface WaypointMarkerProps {
  number: number;
}

/**
 * Small numbered marker for the About waypoint trail.
 * Rendered on the central trail line, above it, as an understated waypoint
 * rather than a large UI button.
 */
export default function WaypointMarker({ number }: WaypointMarkerProps) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[var(--color-background)] bg-[var(--color-accent)] text-xs font-semibold text-white">
      {number < 10 ? `0${number}` : number}
    </span>
  );
}
