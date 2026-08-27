import { MapPin } from "lucide-react";
import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow, BoardPhoto } from "./shared";

interface MountainsBoardProps {
  heading: string;
  text: string;
  location: string;
  image: string;
  imageAlt: string;
}

/**
 * BOARD 03 — Somewhere between the mountains and the road.
 * A field note: mountain photograph pinned slightly crooked with a small
 * location label, plus a MOUNTAINS note. Not a map, not a dashboard.
 */
export default function MountainsBoard({
  heading,
  text,
  location,
  image,
  imageAlt,
}: MountainsBoardProps) {
  return (
    <Pinboard label="Mountains" rotate={0.3} className="w-full p-6 sm:p-10">
      <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10">
        <div className="relative min-w-0 flex-1">
          <BoardEyebrow>Mountains</BoardEyebrow>
          {heading && (
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
              {heading}
            </h2>
          )}
          {text && (
            <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600 sm:text-base">
              {text.split("\n\n")[0]}
            </p>
          )}
          {location && (
            <p className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={1.75} />
              {location}
            </p>
          )}
        </div>
        {image && (
          <div className="relative shrink-0">
            <BoardPhoto
              src={image}
              alt={imageAlt}
              width={560}
              height={380}
              rotate={1.8}
              className="w-full max-w-md sm:w-64"
            />
          </div>
        )}
      </div>
    </Pinboard>
  );
}
