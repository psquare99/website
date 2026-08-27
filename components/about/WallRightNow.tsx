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
import type { AboutWaypointNowItem } from "@/types/about";
import WallNote from "@/components/about/WallNote";

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

interface WallRightNowProps {
  items: AboutWaypointNowItem[];
}

/**
 * The "Right Now" facts as a larger sheet of notes pinned to the wall.
 * Rendered from the existing D1 content; the icon map stays a fixed lookup.
 */
export default function WallRightNow({ items }: WallRightNowProps) {
  if (!items || items.length === 0) return null;

  return (
    <WallNote paper="notebook" rotate={-1} className="w-full sm:w-80">
      <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
        Right now
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] ?? ArrowRight;
          return (
            <li
              key={i}
              className="flex items-baseline gap-3 rounded-[2px] bg-white/70 px-2 py-1.5"
              style={{
                transform: `rotate(${i % 2 === 0 ? 0.3 : -0.3}deg)`,
              }}
            >
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
    </WallNote>
  );
}
