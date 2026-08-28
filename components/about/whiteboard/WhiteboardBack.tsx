import type { ComponentType } from "react";
import {
  Laptop,
  MapPin,
  BookOpen,
  Headphones,
  Coffee,
  Lightbulb,
  Compass,
  Gamepad2,
  Music,
  Camera,
  PenTool,
  Code,
  Globe,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import type { AboutData } from "@/types/about";
import { BoardEyebrow, BoardPhoto } from "./shared";

const ICON_MAP: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Laptop,
  MapPin,
  BookOpen,
  Headphones,
  Coffee,
  Lightbulb,
  Compass,
  Gamepad2,
  Music,
  Camera,
  PenTool,
  Code,
  Globe,
  Heart,
  Star,
};

interface WhiteboardBackProps {
  about: AboutData;
}

export default function WhiteboardBack({ about }: WhiteboardBackProps) {
  const { reading, now, closing } = about;

  return (
    <div className="space-y-12 p-6 sm:p-12 lg:p-16">
      {/* SECTION 1 & 2 GRID: READING & RIGHT NOW */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
        {/* READING SECTION */}
        <section aria-label="Reading" className="flex flex-col justify-between">
          <div>
            <BoardEyebrow>Reading</BoardEyebrow>
            {reading.heading && (
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-neutral-900">
                {reading.heading}
              </h2>
            )}
            {reading.text && (
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {reading.text.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-6">
            {reading.bookCover && (
              <BoardPhoto
                src={reading.bookCover}
                alt={reading.bookCoverAlt || reading.bookTitle || "Current book cover"}
                width={280}
                height={420}
                rotate={1.6}
                className="w-24 shrink-0 sm:w-28"
              />
            )}
            {(reading.bookTitle || reading.bookAuthor) && (
              <div className="rounded border border-[var(--color-border)] bg-[#f7f3e8] p-4 shadow-sm">
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Current book
                </p>
                {reading.bookTitle && (
                  <p className="mt-1 font-serif text-base font-semibold text-neutral-900">
                    {reading.bookTitle}
                  </p>
                )}
                {reading.bookAuthor && (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{reading.bookAuthor}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT NOW SECTION (RULED NOTEPAD) */}
        <section aria-label="Right now" className="flex flex-col">
          <BoardEyebrow>Right now</BoardEyebrow>
          <div
            className="relative mt-4 flex-1 rounded border border-[var(--color-border)] bg-[#fdfcf9] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 23px, var(--color-border) 23px, var(--color-border) 24px)",
            }}
          >
            <ul className="relative space-y-3">
              {now && now.map((item, i) => {
                const Icon = ICON_MAP[item.icon] ?? ArrowRight;
                return (
                  <li key={i} className="flex items-baseline gap-3">
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-[var(--color-accent)]"
                      strokeWidth={1.75}
                    />
                    <span className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      {item.label}
                    </span>
                    <span className="ml-auto text-sm font-normal text-neutral-800 sm:text-base">
                      {item.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      {/* SUBTLE PINNED DIVIDER */}
      <div className="relative border-t border-dashed border-[var(--color-border)]" aria-hidden="true" />

      {/* SECTION 3: CLOSING */}
      <section aria-label="Closing thoughts" className="mx-auto max-w-2xl text-center">
        {closing.eyebrow && <BoardEyebrow>{closing.eyebrow}</BoardEyebrow>}
        {closing.heading && (
          <h2 className="mt-4 font-serif text-2xl leading-tight tracking-tight text-neutral-900 sm:text-3xl">
            {closing.heading}
          </h2>
        )}
        {closing.text && (
          <div className="mx-auto mt-4 max-w-xl space-y-4 text-base leading-7 text-neutral-700">
            {closing.text.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        {closing.signature && (
          <p
            className="mt-6 text-3xl leading-none text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-script)" }}
          >
            {closing.signature}
          </p>
        )}
      </section>
    </div>
  );
}
