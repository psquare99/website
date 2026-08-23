import Link from "next/link";

import type { Heartbeat } from "@/types/heartbeat";

interface HeartbeatListProps {
  items: Heartbeat[];
}

export default function HeartbeatList({
  items,
}: HeartbeatListProps) {
  return (
    <ul className="space-y-8">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <li
            key={item.id}
            className="flex items-start gap-4"
          >
            <Icon
  className="mt-1 h-6 w-6 shrink-0 text-[var(--accent)]"
  strokeWidth={1.75}
/>

            {item.href ? (
              <Link
                href={item.href}
                className="
                  text-xl
                  transition-all
                  duration-200
                  hover:text-[var(--accent)]
                  hover:translate-x-1
                "
              >
                {item.text}
              </Link>
            ) : (
              <span className="text-xl">
                {item.text}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}