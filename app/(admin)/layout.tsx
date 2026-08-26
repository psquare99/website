import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import LogoutButton from "./admin/logout-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/media", label: "Media" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSession(sessionToken);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-tight"
          >
            P<span className="align-super text-xs">2</span> Admin
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-3 py-3">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
