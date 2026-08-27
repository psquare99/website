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
    <div className="inline-block w-full sm:w-auto">
      {/* a trail notebook / field-notes stop */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
        <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
          Right now
        </p>
        <dl className="grid gap-x-12 gap-y-5 text-left sm:grid-cols-2">
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <div key={index} className="flex items-start gap-3">
                {Icon ? (
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]"
                    strokeWidth={1.75}
                  />
                ) : (
                  <span
                    className="mt-0.5 block h-5 w-5 shrink-0 rounded-full bg-neutral-200"
                    aria-hidden="true"
                  />
                )}
                <div>
                  {item.label && (
                    <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                      {item.label}
                    </dt>
                  )}
                  {item.value && (
                    <dd className="mt-0.5 text-lg text-neutral-700">{item.value}</dd>
                  )}
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
