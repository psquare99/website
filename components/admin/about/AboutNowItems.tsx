"use client";

import type { AboutWaypointNowItem } from "@/types/about";

const AVAILABLE_ICONS = [
  "Laptop",
  "MapPin",
  "BookOpen",
  "Headphones",
  "Coffee",
  "Lightbulb",
  "Compass",
  "Gamepad2",
  "Music",
  "Camera",
  "PenTool",
  "Code",
  "Globe",
  "Heart",
  "Star",
] as const;

interface AboutNowItemsProps {
  items: AboutWaypointNowItem[];
  onChange: (items: AboutWaypointNowItem[]) => void;
}

export default function AboutNowItems({ items, onChange }: AboutNowItemsProps) {
  function addItem() {
    onChange([...items, { icon: "", label: "", value: "" }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof AboutWaypointNowItem, value: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded border border-gray-200 p-3 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 gap-2">
            <select
              value={item.icon}
              onChange={(e) => updateItem(index, "icon", e.target.value)}
              className="w-36 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-500"
            >
              <option value="">Icon…</option>
              {AVAILABLE_ICONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(index, "label", e.target.value)}
              placeholder="Label"
              className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-500"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateItem(index, "value", e.target.value)}
              placeholder="Value"
              className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-500"
            />
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => moveItem(index, -1)}
              disabled={index === 0}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30"
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, 1)}
              disabled={index === items.length - 1}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30"
              title="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-600"
              title="Remove"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="text-xs text-gray-500 hover:text-gray-900"
      >
        + Add item
      </button>
    </div>
  );
}
