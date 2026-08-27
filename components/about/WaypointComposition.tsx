import type { ReactNode } from "react";

interface WaypointCompositionProps {
  /**
   * The image node for this waypoint (optional). When omitted the layout
   * gracefully collapses to a single content column with no placeholder.
   */
  image?: ReactNode;
  /** The text content node for this waypoint. */
  content: ReactNode;
  /**
   * Which side the CONTENT text sits on desktop. The image takes the opposite side.
   * This creates the alternating "image ↔ text" composition across the central trail.
   */
  contentSide: "left" | "right";
}

/**
 * Shared composition primitive for the About waypoint trail.
 *
 * Desktop: a three-column grid — [content|image] | marker-space | [content|image] —
 * so the image and its text share the same vertical composition across the trail.
 * The middle 48px column is reserved for the trail marker, which `WaypointTrail`
 * places absolutely on the central line.
 *
 * Mobile: collapses to a single vertical stack (image then content, or content then
 * image), offset to the right of the left-side trail.
 */
export default function WaypointComposition({
  image,
  content,
  contentSide,
}: WaypointCompositionProps) {
  const imageCell = image ? <div className="sm:min-w-0">{image}</div> : null;
  const contentCell = <div className="sm:min-w-0">{content}</div>;

  const leftCell = contentSide === "left" ? contentCell : imageCell;
  const rightCell = contentSide === "left" ? imageCell : contentCell;

  return (
    <div className="pl-12 sm:pl-0">
      <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-[1fr_52px_1fr] sm:items-start sm:gap-x-10">
        <div>{leftCell}</div>
        <div aria-hidden="true" className="hidden sm:block" />
        <div>{rightCell}</div>
      </div>
    </div>
  );
}
