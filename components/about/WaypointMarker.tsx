interface WaypointMarkerProps {
  number: number;
}

/**
 * A trekking waypoint marker for the About trail.
 *
 * A small warm-cream disc with a thin accent spine, an outer cream ring and a
 * serif numeral — it reads as a marker found on a map/route rather than a
 * numbered timeline bullet. Sits directly on the winding trail.
 */
export default function WaypointMarker({ number }: WaypointMarkerProps) {
  return (
    <span
      role="img"
      aria-label={`Waypoint ${String(number).padStart(2, "0")}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] shadow-[0_0_0_4px_rgba(250,250,248,0.9)]"
    >
      <span
        aria-hidden="true"
        className="absolute -inset-[5px] rounded-full border border-[var(--color-border)]"
      />
      <span className="font-serif text-xs font-semibold text-[var(--color-accent)]">
        {number < 10 ? `0${number}` : number}
      </span>
    </span>
  );
}
