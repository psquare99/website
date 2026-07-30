import Link from "next/link";

import Container from "@/components/Container";
import { navigation } from "@/content/site/navigation";

export default function Navbar() {
  return (
    <header>
      <Container>
        <nav className="flex items-center justify-between py-6">
          <span className="text-3xl font-bold tracking-tight">
  P<span className="align-super text-base">2</span>
</span>

          <ul className="flex items-center gap-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}