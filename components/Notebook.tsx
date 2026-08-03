import JournalCard from "./JournalCard";

import { journal } from "@/content/journal";

export default function Notebook() {
  return (
    <section className="mx-auto max-w-7xl py-20">

      <div className="mb-12">

        <h2 className="text-3xl font-semibold tracking-tight text-[#2C2A28]">
          Notebook
        </h2>

        <p className="mt-3 text-[#6F665D]">
          Wander through ideas, stories and moments collected along the way.
        </p>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {journal.map((entry) => (
          <JournalCard
            key={entry.slug}
            entry={entry}
          />
        ))}

      </div>

    </section>
  );
}