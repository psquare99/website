"use client";

import { usePathname } from "next/navigation";
import Container from "@/components/Container";

export default function Footer() {
  const pathname = usePathname();
  const isAboutPage = pathname === "/about";

  return (
    <footer className="mt-8 border-t border-[var(--color-border)]">
      <Container>
        <div className="py-8 text-center text-sm text-neutral-600">
          <p>© 2026 Prateek Pal</p>

          {!isAboutPage && (
            <p className="mt-2 italic">
              See you on the other side
            </p>
          )}
        </div>
      </Container>
    </footer>
  );
}