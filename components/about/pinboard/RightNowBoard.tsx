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
import Pinboard from "@/components/about/Pinboard";
import { BoardEyebrow } from "./shared";
import type { AboutWaypointNowItem } from "@/types/about";

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

interface RightNowBoardProps {
  items: AboutWaypointNowItem[];
}

/**
 * BOARD 05 — Right Now.
 * The most notebook-like board: a smaller ruled notebook sheet pinned to the
 * larger board, each fact with its Lucide icon, driven from the D1 `now` array.
 */
export default function RightNowBoard({ items }: RightNowBoardProps) {
  if (!items || items.length === 0) return null;

  return (
    <Pinboard label="Right now" rotate={-0.5} className="w-full p-6 sm:p-10">
      <div className="mx-auto max-w-md">
        <BoardEyebrow>Right now</BoardEyebrow>
        <div className="relative mt-4 bg-[#fcfbf7] px-5 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.10)]"
          style={{ backgroundImage: "linear-gradient(to bottom, transparent 23px, var(--color-border) 23px, var(--color-border) 24px)" }}
        >
          <ul className="relative space-y-3">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] ?? ArrowRight;
              return (
                <li key={i} className="flex items-baseline gap-3">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 translate-y-px text-[var(--color-accent)]"
                    strokeWidth={1.75}
                  />
                  <span className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    {item.label}
                  </span>
                  <span className="ml-auto text-base text-neutral-800">{item.value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Pinboard>
  );
}
