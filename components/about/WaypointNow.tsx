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
} from "lucide-react";
import type { AboutWaypointNowItem } from "@/types/about";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
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

interface WaypointNowProps {
  items: AboutWaypointNowItem[];
}

export default function WaypointNow({ items }: WaypointNowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-8">
      {items.map((item, index) => {
        const Icon = ICON_MAP[item.icon];
        return (
          <div key={index} className="flex items-start gap-4">
            {Icon ? (
              <Icon
                className="mt-1 h-5 w-5 shrink-0 text-[var(--color-accent)]"
                strokeWidth={1.75}
              />
            ) : (
              <span className="mt-1 block h-5 w-5 shrink-0 rounded-full bg-neutral-200" aria-hidden="true" />
            )}
            <div>
              {item.label && (
                <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  {item.label}
                </span>
              )}
              {item.value && (
                <span className="mt-0.5 block text-lg text-neutral-700">{item.value}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
