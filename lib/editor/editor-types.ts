import type { DocumentBlock, DocumentMetadata } from "@/lib/domain/document";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

export interface EditorState {
  id: string;
  title: string;
  slug: string;
  metadata: DocumentMetadata;
  blocks: DocumentBlock[];
}

export function computeFingerprint(state: EditorState): string {
  return JSON.stringify({
    title: state.title,
    slug: state.slug,
    metadata: state.metadata,
    blocks: state.blocks,
  });
}
