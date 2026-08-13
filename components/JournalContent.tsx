import type { JournalDocument } from "@/types/journal-content";

interface JournalContentProps {
  document: JournalDocument;
}

export default function JournalContent({
  document,
}: JournalContentProps) {
  return (
    <>
      {document.content.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index}>
                {block.content.map((node, nodeIndex) => (
                  <span key={nodeIndex}>
                    {node.text}
                  </span>
                ))}
              </p>
            );

          default:
            return null;
        }
      })}
    </>
  );
}