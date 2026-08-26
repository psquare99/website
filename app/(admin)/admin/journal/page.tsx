import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDocuments } from "@/lib/repository/documents";
import DocumentList from "../document-list";

export default async function AdminJournalPage() {
  const { env } = getCloudflareContext();
  const documents = await getDocuments(
    (env as CloudflareEnv).CONTENT_DB,
    "journal"
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Journal</h1>
        <Link
          href="/admin/documents/new?type=journal"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          New entry
        </Link>
      </div>
      <DocumentList documents={documents} contentType="journal" />
    </>
  );
}
