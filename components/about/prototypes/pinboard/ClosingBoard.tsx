import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow } from "./shared";

interface ClosingBoardProps {
  eyebrow: string;
  heading: string;
  text: string;
  signature: string;
}

/**
 * BOARD 06 — Closing.
 * The last sheet in the stack. Quiet, lots of empty space, minimal content.
 */
export default function ClosingBoard({
  eyebrow,
  heading,
  text,
  signature,
}: ClosingBoardProps) {
  return (
    <Pinboard label="Closing" rotate={0.4} className="w-full p-10 sm:p-16">
      <div className="mx-auto max-w-xl text-center">
        {eyebrow && <BoardEyebrow>{eyebrow}</BoardEyebrow>}
        {heading && (
          <h2 className="mt-5 font-serif text-2xl leading-tight tracking-tight text-neutral-900 sm:text-3xl">
            {heading}
          </h2>
        )}
        {text && (
          <div className="mx-auto mt-5 max-w-lg space-y-4 text-base leading-7 text-neutral-700">
            {text.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {signature && (
          <p
            className="mt-8 text-3xl leading-none text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-script)" }}
          >
            {signature}
          </p>
        )}
      </div>
    </Pinboard>
  );
}
