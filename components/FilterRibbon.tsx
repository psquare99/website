interface FilterItem {
  label: string;
  color?: "green" | "yellow" | "red";
}

interface FilterRibbonProps {
  items: FilterItem[];
}

const dotColors = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

export default function FilterRibbon({
  items,
}: FilterRibbonProps) {
  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <button
          key={item.label}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-black"
        >
          {item.color && (
            <span
              className={`h-2 w-2 rounded-full ${dotColors[item.color]}`}
            />
          )}

          {item.label}
        </button>
      ))}
    </div>
  );
}