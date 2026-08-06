"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

import Container from "@/components/Container";
import { navigation } from "@/content/site/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header>
      <Container>
        <nav className="flex items-center justify-between py-6">
          <Link
  href="/"
  aria-label="Go to homepage"
  className="
text-3xl
font-bold
tracking-tight
transition-all
duration-300
hover:scale-105
active:scale-95
focus:outline-none
"
>
  P
<span className="align-super text-lg text-[var(--accent-soft)]">
  2
</span>
</Link>

          <ul className="flex items-center gap-8">
            {navigation.map((item) => {
  const isActive = pathname === item.href;

  return (
    <li key={item.href}>
      <Link
        href={item.href}
        className={`relative pb-1 transition-colors duration-200 focus:outline-none ${
          isActive
            ? "text-black dark:text-white"
            : "text-neutral-400 hover:text-black dark:hover:text-white"
        }`}
      >
        {item.label}

        {isActive && (
          <span
            className="absolute left-0 -bottom-0 h-1 w-full rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
        )}
      </Link>
    </li>
  );
})}
          </ul>
        </nav>
      </Container>
    </header>
  );
}