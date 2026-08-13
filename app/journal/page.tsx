import Container from "@/components/Container";
import Notebook from "@/components/Notebook";

import { journal } from "@/content/journal";
import { getPublishedJournal } from "@/lib/publishing/published-journal";

export default function JournalPage() {
  const publishedJournal =
    getPublishedJournal();

  const allJournal = [
    ...journal,
    ...publishedJournal,
  ];

  return (
    <Container>
      <Notebook
        journal={allJournal}
      />
    </Container>
  );
}