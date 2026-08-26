"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SaveStatus } from "@/lib/editor/editor-types";
import { computeFingerprint, type EditorState } from "@/lib/editor/editor-types";

interface UseAutosaveOptions {
  state: EditorState;
  isDirty: boolean;
  saveStatus: SaveStatus;
  generationRef: React.MutableRefObject<number>;
  onSaving: () => void;
  onSaved: (fingerprint: string) => void;
  onError: () => void;
  save: () => Promise<boolean>;
  delay?: number;
}

export function useAutosave({
  state,
  isDirty,
  saveStatus,
  generationRef,
  onSaving,
  onSaved,
  onError,
  save,
  delay = 2000,
}: UseAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFingerprintRef = useRef(computeFingerprint(state));

  useEffect(() => {
    if (!isDirty || saveStatus === "saving") return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      const fp = computeFingerprint(state);
      if (fp === lastFingerprintRef.current) return;

      const success = await save();
      if (success) {
        lastFingerprintRef.current = fp;
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, isDirty, saveStatus, save, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
