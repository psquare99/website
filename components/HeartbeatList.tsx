import type { Heartbeat } from "@/types/heartbeat";

interface HeartbeatListProps {
  items: Heartbeat[];
}

export default function HeartbeatList({
  items,
}: HeartbeatListProps) {
  return (
    <ul className="space-y-8">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-4">
          <span className="text-2xl leading-none">
  {item.icon}
</span>

          {item.href ? (
            <a href={item.href}>{item.text}</a>
          ) : (
            <span className="text-xl">
  {item.text}
</span>
          )}
        </li>
      ))}
    </ul>
  );
}