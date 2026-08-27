import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow, BoardPhoto } from "./shared";

interface ReadingBoardProps {
  heading: string;
  text: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookCoverAlt: string;
}

/**
 * BOARD 04 — Reading.
 * A bookshelf / reading note: current book pinned to the board with a small
 * attached note showing title and author.
 */
export default function ReadingBoard({
  heading,
  text,
  bookTitle,
  bookAuthor,
  bookCover,
  bookCoverAlt,
}: ReadingBoardProps) {
  return (
    <Pinboard label="Reading" rotate={-0.2} className="w-full p-6 sm:p-10">
      <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10">
        {bookCover && (
          <BoardPhoto
            src={bookCover}
            alt={bookCoverAlt || bookTitle}
            width={280}
            height={420}
            rotate={1.4}
            className="w-28 sm:w-32"
          />
        )}
        <div className="min-w-0">
          <BoardEyebrow>Reading</BoardEyebrow>
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
          {(bookTitle || bookAuthor) && (
            <div className="mt-4 inline-block border border-[var(--color-border)] bg-[#f7f1e3] px-4 py-3 shadow-sm">
              <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Current book
              </p>
              {bookTitle && (
                <p className="mt-1 font-serif text-base font-semibold text-neutral-900">{bookTitle}</p>
              )}
              {bookAuthor && <p className="text-xs text-[var(--muted)]">{bookAuthor}</p>}
            </div>
          )}
        </div>
      </div>
    </Pinboard>
  );
}
