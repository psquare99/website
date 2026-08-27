import Link from "next/link";
import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow, BoardPhoto } from "./shared";

interface MakingBoardProps {
  heading: string;
  text: string;
  image: string;
  imageAlt: string;
  linkLabel: string;
  linkUrl: string;
}

/**
 * BOARD 02 — Making things.
 * A workshop note: workshop photograph pinned to the board, then a MAKING note
 * with heading, description and the CTA.
 */
export default function MakingBoard({
  heading,
  text,
  image,
  imageAlt,
  linkLabel,
  linkUrl,
}: MakingBoardProps) {
  return (
    <Pinboard label="Making things" rotate={-0.4} className="w-full p-6 sm:p-10">
      <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10">
        {image && (
          <BoardPhoto
            src={image}
            alt={imageAlt}
            width={560}
            height={380}
            rotate={-1}
            className="w-full max-w-md sm:w-72"
          />
        )}
        <div className="min-w-0">
          <BoardEyebrow>Making</BoardEyebrow>
          {heading && (
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
              {heading}
            </h2>
          )}
          {text && (
            <div className="mt-3 max-w-xl space-y-3 text-sm leading-6 text-neutral-600 sm:text-base">
              {text.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {linkUrl && linkLabel && (
            <Link
              href={linkUrl}
              className="mt-4 inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {linkLabel} →
            </Link>
          )}
        </div>
      </div>
    </Pinboard>
  );
}
