interface WaypointMarkerProps {
  number: number;
}

export default function WaypointMarker({ number }: WaypointMarkerProps) {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--color-accent)] text-xs font-semibold text-white shadow-sm">
        {number < 10 ? `0${number}` : number}
      </span>
    </div>
  );
}
