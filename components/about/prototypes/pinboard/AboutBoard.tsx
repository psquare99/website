import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow, BoardPhoto, HandNote } from "./shared";

interface AboutBoardProps {
  eyebrow: string;
  heading: string;
  text: string;
  signature: string;
  image: string;
  imageAlt: string;
}

/**
 * BOARD 01 — A little about me.
 * Portrait pinned to one side; intro paragraphs and Caveat signature on the board.
 * This board deliberately carries the only h1 (there is no page title above it).
 */
export default function AboutBoard({
  eyebrow,
  heading,
  text,
  signature,
  image,
  imageAlt,
}: AboutBoardProps) {
  return (
    <Pinboard label="A little about me" rotate={0.2} className="w-full p-6 sm:p-10">
      <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
        {image && (
          <div className="relative shrink-0">
            <BoardPhoto
              src={image}
              alt={imageAlt}
              width={380}
              height={480}
              rotate={-1.6}
              className="w-40 sm:w-44"
            />
            <HandNote className="absolute -right-4 -top-6 rotate-6">me</HandNote>
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && <BoardEyebrow>{eyebrow}</BoardEyebrow>}
          {heading && (
            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              {heading}
            </h1>
          )}
          {text && (
            <div className="mt-4 max-w-xl space-y-4 text-base leading-7 text-neutral-700">
              {text.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {signature && (
            <p
              className="mt-5 text-2xl leading-none text-[var(--color-accent)]"
              style={{ fontFamily: "var(--font-script)" }}
            >
              {signature}
            </p>
          )}
        </div>
      </div>
    </Pinboard>
  );
}
