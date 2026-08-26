import { notFound } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDocument } from "@/lib/repository/documents";
import DocumentEditor from "@/components/admin/editor/DocumentEditor";

export default async function AdminDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { env } = getCloudflareContext();
  const document = await getDocument((env as CloudflareEnv).CONTENT_DB, id);

  if (!document) {
    notFound();
  }

  const listHref =
    document.contentType === "project"
      ? "/admin/projects"
      : document.contentType === "page"
        ? "/admin/pages"
        : "/admin/journal";

  const listLabel =
    document.contentType === "project"
      ? "Projects"
      : document.contentType === "page"
        ? "Pages"
        : "Journal";

  return (
    <>
      <div className="mb-6">
        <Link
          href={listHref}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          &larr; Back to {listLabel}
        </Link>
      </div>

      <DocumentEditor document={document} />
    </>
  );
}
