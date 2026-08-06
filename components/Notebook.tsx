"use client";
import { useMemo, useState } from "react";
import JournalCard from "./JournalCard";

import { journal } from "@/content/journal";

const categories = [
  { label: "All", value: "all" },
  { label: "Reflections", value: "reflection" },
  { label: "Books", value: "book" },
  { label: "Travel", value: "travel" },
  { label: "Movies", value: "movie" },
  { label: "Tech", value: "project" },
] as const;

export default function Notebook()

{
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
    <section className="mx-auto max-w-7xl py-20">

      <div className="mb-12 flex flex-wrap gap-8 text-lg">
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

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">

        {filteredJournal.map((entry) => (
          <JournalCard
            key={entry.slug}
            entry={entry}
          />
        ))}

      </div>

    </section>
  );
}