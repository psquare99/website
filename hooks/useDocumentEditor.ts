"use client";

import { useCallback, useRef, useState } from "react";
import type { Document, DocumentBlock, DocumentMetadata } from "@/lib/domain/document";
import type { EditorState, SaveStatus } from "@/lib/editor/editor-types";
import { computeFingerprint } from "@/lib/editor/editor-types";

export function useDocumentEditor(document: Document) {
  const [state, setState] = useState<EditorState>({
    id: document.id,
    title: document.title,
    slug: document.slug,
    metadata: { ...document.metadata },
    blocks: Array.isArray(document.blocks)
      ? document.blocks.map((b) => ({ ...b, data: { ...b.data } }))
      : [],
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() =>
    computeFingerprint({
      id: document.id,
      title: document.title,
      slug: document.slug,
      metadata: document.metadata,
      blocks: document.blocks,
    })
  );

  const generationRef = useRef(0);

  const isDirty =
    computeFingerprint(state) !== lastSavedFingerprint;

  const updateTitle = useCallback((title: string) => {
    setState((s) => ({ ...s, title }));
  }, []);

  const updateSlug = useCallback((slug: string) => {
    setState((s) => ({ ...s, slug }));
  }, []);

  const updateMetadata = useCallback((key: string, value: unknown) => {
    setState((s) => ({
      ...s,
      metadata: { ...s.metadata, [key]: value } as DocumentMetadata,
    }));
  }, []);

  const setBlocks = useCallback((blocks: DocumentBlock[]) => {
    setState((s) => ({ ...s, blocks }));
  }, []);

  const markSaved = useCallback((fingerprint: string) => {
    setLastSavedFingerprint(fingerprint);
    setSaveStatus("saved");
  }, []);

  const incrementGeneration = useCallback(() => {
    generationRef.current += 1;
    return generationRef.current;
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setSaveStatus("saving");
    generationRef.current += 1;
    const gen = generationRef.current;

    try {
      const res = await fetch(`/api/admin/documents/${state.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.title,
          slug: state.slug,
          metadata: state.metadata,
          blocks: state.blocks,
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return false;
      }

      if (gen !== generationRef.current) {
        return false;
      }

      const fp = computeFingerprint(state);
      markSaved(fp);
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    }
  }, [state, markSaved]);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true;
    return save();
  }, [isDirty, save]);

  return {
    state,
    saveStatus,
    setSaveStatus,
    isDirty,
    updateTitle,
    updateSlug,
    updateMetadata,
    setBlocks,
    save,
    flushSave,
    markSaved,
    incrementGeneration,
    generationRef,
  };
}
