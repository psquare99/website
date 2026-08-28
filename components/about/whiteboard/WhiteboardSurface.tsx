import type { ReactNode } from "react";
import { RotateCw, CornerRightUp } from "lucide-react";
import { MountingPin } from "./shared";

interface WhiteboardSurfaceProps {
  isFlipped: boolean;
  onToggleFlip: () => void;
  frontContent: ReactNode;
  backContent: ReactNode;
}

export default function WhiteboardSurface({
  isFlipped,
  onToggleFlip,
  frontContent,
  backContent,
}: WhiteboardSurfaceProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      {/* PERSPECTIVE WRAPPER */}
      <div className="whiteboard-perspective-wrapper">
        {/* FLIPPER CONTAINER */}
        <div className={`whiteboard-flipper ${isFlipped ? "is-flipped" : ""}`}>
          
          {/* FRONT FACE (SIDE A) */}
          <div
            className="whiteboard-face whiteboard-face-front whiteboard-frame"
            aria-hidden={isFlipped}
            // @ts-expect-error React 19 / modern HTML standard inert attribute
            inert={isFlipped ? "" : undefined}
          >
            {/* TOP HEADER / PIN BAR */}
            <div className="relative flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 sm:px-10">
              <MountingPin className="left-6 top-3 sm:left-10" />
              <MountingPin className="right-6 top-3 sm:right-10" />

              <div className="flex items-center gap-3 pl-6 sm:pl-8">
                <span className="font-mono text-xs font-semibold tracking-wider text-[var(--color-accent)]">
                  01 / 02
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Story & Foundations
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleFlip}
                className="flip-button inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[#fcfbf9] px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                aria-label="Flip whiteboard to view Field Notes and Current Reading"
              >
                <span>Field Notes</span>
                <RotateCw className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              </button>
            </div>

            {/* FRONT CONTENT */}
            <div>{frontContent}</div>

            {/* BOTTOM CORNER FLIP ACCENT */}
            <div className="flex justify-end border-t border-[var(--color-border)]/60 px-6 py-3 sm:px-10">
              <button
                type="button"
                onClick={onToggleFlip}
                className="group inline-flex items-center gap-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--color-accent)]"
              >
                <span>Flip to back face</span>
                <CornerRightUp className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* BACK FACE (SIDE B) */}
          <div
            className="whiteboard-face whiteboard-face-back whiteboard-frame"
            aria-hidden={!isFlipped}
            // @ts-expect-error React 19 / modern HTML standard inert attribute
            inert={!isFlipped ? "" : undefined}
          >
            {/* TOP HEADER / PIN BAR */}
            <div className="relative flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 sm:px-10">
              <MountingPin className="left-6 top-3 sm:left-10" />
              <MountingPin className="right-6 top-3 sm:right-10" />

              <div className="flex items-center gap-3 pl-6 sm:pl-8">
                <span className="font-mono text-xs font-semibold tracking-wider text-[var(--color-accent)]">
                  02 / 02
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Living Pulse & Field Notes
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleFlip}
                className="flip-button inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[#fcfbf9] px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                aria-label="Flip whiteboard to view Story and Foundations"
              >
                <span>Back to Story</span>
                <RotateCw className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              </button>
            </div>

            {/* BACK CONTENT */}
            <div>{backContent}</div>

            {/* BOTTOM CORNER FLIP ACCENT */}
            <div className="flex justify-end border-t border-[var(--color-border)]/60 px-6 py-3 sm:px-10">
              <button
                type="button"
                onClick={onToggleFlip}
                className="group inline-flex items-center gap-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--color-accent)]"
              >
                <span>Flip to front face</span>
                <CornerRightUp className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
