import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/journal"
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-medium text-gray-900">Journal</h2>
          <p className="text-sm text-gray-500">Manage journal entries</p>
        </Link>

        <Link
          href="/admin/projects"
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-medium text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">Manage project entries</p>
        </Link>

        <Link
          href="/admin/pages"
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-medium text-gray-900">Pages</h2>
          <p className="text-sm text-gray-500">Manage page entries</p>
        </Link>

        <Link
          href="/admin/about"
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-1 text-lg font-medium text-gray-900">About</h2>
          <p className="text-sm text-gray-500">Edit the about page</p>
        </Link>
      </div>
    </>
  );
}
