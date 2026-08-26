import type { DocumentBlock } from "@/lib/domain/document";

function generateBlockId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createBlock(type: DocumentBlock["type"]): DocumentBlock {
  switch (type) {
    case "paragraph":
      return { id: generateBlockId(), type: "paragraph", data: { text: "" } };
    case "heading":
      return {
        id: generateBlockId(),
        type: "heading",
        data: { text: "", level: 2 },
      };
    case "quote":
      return { id: generateBlockId(), type: "quote", data: { text: "" } };
    case "image":
      return { id: generateBlockId(), type: "image", data: { src: "", alt: "" } };
    default:
      return { id: generateBlockId(), type, data: {} };
  }
}

export function duplicateBlock(block: DocumentBlock): DocumentBlock {
  return {
    id: generateBlockId(),
    type: block.type,
    data: JSON.parse(JSON.stringify(block.data)) as Record<string, unknown>,
  };
}

export function moveBlockUp(
  blocks: DocumentBlock[],
  index: number
): DocumentBlock[] {
  if (index <= 0) return blocks;
  const next = [...blocks];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

export function moveBlockDown(
  blocks: DocumentBlock[],
  index: number
): DocumentBlock[] {
  if (index >= blocks.length - 1) return blocks;
  const next = [...blocks];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
}

export function insertBlock(
  blocks: DocumentBlock[],
  type: DocumentBlock["type"],
  afterIndex?: number
): DocumentBlock[] {
  const newBlock = createBlock(type);
  if (afterIndex === undefined || afterIndex < 0) {
    return [...blocks, newBlock];
  }
  const next = [...blocks];
  next.splice(afterIndex + 1, 0, newBlock);
  return next;
}

export function removeBlock(
  blocks: DocumentBlock[],
  id: string
): DocumentBlock[] {
  return blocks.filter((b) => b.id !== id);
}

export function updateBlockData(
  blocks: DocumentBlock[],
  id: string,
  data: Record<string, unknown>
): DocumentBlock[] {
  return blocks.map((b) =>
    b.id === id ? { ...b, data: { ...b.data, ...data } } : b
  );
}
