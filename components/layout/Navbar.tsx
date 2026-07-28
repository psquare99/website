import Link from "next/link";

import Container from "./Container";
import Brand from "./Brand";

export default function Navbar() {
  return (
    <header className="border-b border-stone-200">
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Brand />

          <div className="flex items-center gap-6">
            <Link
              href="/journal"
              className="text-stone-700 transition-colors hover:text-stone-900"
            >
              Journal
            </Link>

            <Link
              href="/projects"
              className="text-stone-700 transition-colors hover:text-stone-900"
            >
              Projects
            </Link>

            <Link
              href="/about"
              className="text-stone-700 transition-colors hover:text-stone-900"
            >
              About
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}