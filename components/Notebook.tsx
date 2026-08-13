"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type { JournalEntry } from "@/types/journal";
import JournalCard from "./JournalCard";

const Masonry = dynamic(
  () =>
    import("masonic").then(
      (mod) => mod.Masonry
    ),
  {
    ssr: false,
  }
);

interface NotebookProps {
  journal: JournalEntry[];
}

function categoryLabel(category: string) {
  return category
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function Notebook({
  journal,
}: NotebookProps) {
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        journal
          .map((entry) => entry.category)
          .filter(Boolean)
      )
    );

    return [
      {
        label: "All",
        value: "all",
      },
      ...uniqueCategories.map(
        (category) => ({
          label: categoryLabel(category),
          value: category,
        })
      ),
    ];
  }, [journal]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const filteredJournal = useMemo(() => {
    if (selectedCategory === "all") {
      return journal;
    }

    return journal.filter(
      (entry) =>
        entry.category === selectedCategory
    );
  }, [selectedCategory, journal]);

  return (
    <section>
      <div className="flex flex-wrap gap-6">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() =>
              setSelectedCategory(
                category.value
              )
            }
            className={`border-b-2 pb-1 transition-colors ${
              selectedCategory ===
              category.value
                ? "border-[var(--color-accent)] text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <Masonry
        key={selectedCategory}
        items={filteredJournal}
        
        columnGutter={24}
        rowGutter={24}
        columnWidth={320}
        render={({ data }) => (
          <JournalCard
            entry={
              data as JournalEntry
            }
          />
        )}
      />
    </section>
  );
}