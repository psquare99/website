/**
 * A small sage-green push pin that holds an object to the workshop wall.
 * Decorative — hidden from assistive technology.
 */
export default function WallPin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-0 inline-block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_1px_3px_rgba(0,0,0,0.35)] ${className}`}
    >
      <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/60" />
    </span>
  );
}
