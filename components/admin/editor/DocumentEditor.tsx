"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Document } from "@/lib/domain/document";
import { getSchema } from "@/lib/editor/schemas";
import { validateDocument, type ValidationError } from "@/lib/editor/validation";
import { useDocumentEditor } from "@/hooks/useDocumentEditor";
import { useAutosave } from "@/hooks/useAutosave";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { computeFingerprint } from "@/lib/editor/editor-types";
import EditorHeader from "./EditorHeader";
import MetadataEditor from "./MetadataEditor";
import ContentEditor from "./ContentEditor";
import PublishControls from "./PublishControls";
import PreviewPane from "./PreviewPane";
import RevisionList from "./RevisionList";
import DocumentActions from "@/app/(admin)/admin/documents/[id]/document-actions";

export default function DocumentEditor({
  document: initialDocument,
}: {
  document: Document;
}) {
  const router = useRouter();
  const [document, setDocument] = useState(initialDocument);
  const schema = getSchema(document.contentType);

  const editor = useDocumentEditor(document);

  useAutosave({
    state: editor.state,
    isDirty: editor.isDirty,
    saveStatus: editor.saveStatus,
    generationRef: editor.generationRef,
    onSaving: () => editor.setSaveStatus("saving"),
    onSaved: (fp) => editor.markSaved(fp),
    onError: () => editor.setSaveStatus("error"),
    save: editor.save,
  });

  useUnsavedChanges(editor.isDirty);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const errorsMap: Record<string, string> = {};
  for (const e of validationErrors) {
    errorsMap[e.field] = e.message;
  }

  const refreshDocument = useCallback(async () => {
    const res = await fetch(`/api/admin/documents/${document.id}`);
    if (res.ok) {
      const data = (await res.json()) as Document;
      setDocument(data);
    }
  }, [document.id]);

  const handlePublish = useCallback(async (): Promise<boolean> => {
    const errs = validateDocument(
      schema,
      editor.state.title,
      editor.state.slug,
      editor.state.metadata,
      editor.state.blocks
    );
    setValidationErrors(errs);
    if (errs.length > 0) return false;

    const flushed = await editor.flushSave();
    if (!flushed) return false;

    try {
      const res = await fetch(
        `/api/admin/documents/${document.id}/publish`,
        { method: "POST" }
      );
      if (res.ok) {
        setValidationErrors([]);
        return true;
      }
      const data = (await res.json()) as { error?: string };
      setValidationErrors([
        { field: "publish", message: data.error ?? "Publish failed" },
      ]);
      return false;
    } catch {
      setValidationErrors([
        { field: "publish", message: "Network error during publish" },
      ]);
      return false;
    }
  }, [schema, editor, document.id]);

  const handleUnpublish = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/admin/documents/${document.id}/publish`,
        { method: "DELETE" }
      );
      return res.ok;
    } catch {
      return false;
    }
  }, [document.id]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <EditorHeader
          document={document}
          title={editor.state.title}
          slug={editor.state.slug}
          saveStatus={editor.saveStatus}
          onTitleChange={editor.updateTitle}
          onSlugChange={editor.updateSlug}
          onSave={editor.save}
          titleError={errorsMap["title"]}
          slugError={errorsMap["slug"]}
        />

        <ContentEditor
          schema={schema}
          blocks={editor.state.blocks}
          onChange={editor.setBlocks}
        />

        {errorsMap["publish"] && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorsMap["publish"]}
          </div>
        )}

        <PreviewPane
          document={document}
          blocks={editor.state.blocks}
          title={editor.state.title}
          slug={editor.state.slug}
        />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={editor.save}
              disabled={!editor.isDirty || editor.saveStatus === "saving"}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {editor.saveStatus === "saving" ? "Saving..." : "Save"}
            </button>
            <PublishControls
              document={document}
              hasUnsavedChanges={editor.isDirty}
              flushAndPublish={handlePublish}
              unpublish={handleUnpublish}
              refreshDocument={refreshDocument}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Metadata</h2>
          <MetadataEditor
            schema={schema}
            metadata={editor.state.metadata}
            onChange={editor.updateMetadata}
            errors={errorsMap}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Revisions</h2>
          <RevisionList
            documentId={document.id}
            currentStatus={document.status}
            onRestore={refreshDocument}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Danger Zone</h2>
          <DocumentActions document={document} />
        </div>
      </div>
    </div>
  );
}
