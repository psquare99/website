"use client";

import { useState, type ReactNode } from "react";

interface AboutSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function AboutSection({
  title,
  defaultOpen = true,
  children,
}: AboutSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-gray-100 px-5 py-5">{children}</div>}
    </div>
  );
}
