"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { JournalEntry } from "@/types/journal";
import JournalCard from "./JournalCard";
import { journal } from "@/content/journal";

const Masonry = dynamic(
  () => import("masonic").then((mod) => mod.Masonry),
  {
    ssr: false,
  }
);

const categories = [
  { label: "All", value: "all" },
  { label: "Reflections", value: "reflection" },
  { label: "Books", value: "book" },
  { label: "Travel", value: "travel" },
  { label: "Movies", value: "movie" },
  { label: "Tech", value: "project" },
] as const;

export default function Notebook() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]["value"]>("all");

  const filteredJournal = useMemo(() => {
    if (selectedCategory === "all") {
      return journal;
    }

    return journal.filter(
      (entry) => entry.category === selectedCategory
    );
  }, [selectedCategory]);

  return (
    <section>
      <div className="flex flex-wrap gap-6">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`border-b-2 pb-1 transition-colors ${
              selectedCategory === category.value
                ? "border-[var(--color-accent)] text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <Masonry
  items={filteredJournal}
  columnGutter={24}
  rowGutter={24}
  columnWidth={320}
  render={({ data }) => (
    <JournalCard
      entry={data as JournalEntry}
    />
  )}
/>
    </section>
  );
}