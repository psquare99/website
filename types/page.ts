import { ReactNode } from "react";

/**
 * Public Page type — the public-facing model for published pages.
 * A Page is a standalone routable page (/about, /now, /uses, etc.).
 *
 * This is intentionally minimal. Pages are content, not structured data.
 * Navigation is presentation — the Page model does NOT assume every page
 * appears in the Navbar.
 */
export interface Page {
  slug: string;

  title: string;

  description?: string;

  content: ReactNode;

  publishedAt: string;
}
