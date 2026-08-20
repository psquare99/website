import JournalImage from "@/components/JournalImage";
import type { ProjectBlock } from "@/types/project";

interface ProjectContentProps { blocks: ProjectBlock[]; }

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default function ProjectContent({ blocks }: ProjectContentProps) {
  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return <p key={block.id}>{stringValue(block.data.text)}</p>;
          case "heading": {
            const text = stringValue(block.data.text);
            return block.data.level === 3 ? (
              <h3 key={block.id} className="text-2xl font-semibold tracking-tight text-neutral-900">{text}</h3>
            ) : (
              <h2 key={block.id} className="text-3xl font-semibold tracking-tight text-neutral-900">{text}</h2>
            );
          }
          case "quote":
            return <blockquote key={block.id} className="border-l-4 border-neutral-200 pl-6 text-xl italic leading-8 text-neutral-600">{stringValue(block.data.text)}</blockquote>;
          case "image": {
            const src = stringValue(block.data.src);
            if (!src) return null;
            return <JournalImage key={block.id} src={src} alt={stringValue(block.data.alt)} />;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
