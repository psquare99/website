"use client";

import Image from "next/image";
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

          <ul className="flex items-center gap-6 sm:gap-8">
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
                        className="absolute -bottom-0 left-0 h-1 w-full rounded-full bg-[var(--accent)]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}

            <li>
              <Link
                href="/studio"
                aria-label="The Workshop"
                title="The Workshop"
                className="
                  group
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-visible
                  rounded-full
                  transition-transform
                  duration-300
                  hover:-translate-y-0.5
                  focus:outline-none
                "
              >
                <Image
                  unoptimized
                  src="/images/home/workshop-cabin-navbar.png"
                  alt=""
                  width={40}
                  height={40}
                  priority
                  className="
                    h-10
                    w-10
                    object-contain
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-11
                    whitespace-nowrap
                    rounded-full
                    bg-neutral-900
                    px-2.5
                    py-1
                    text-[10px]
                    font-medium
                    text-white
                    opacity-0
                    shadow-sm
                    transition-all
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:opacity-100
                  "
                >
                  The Workshop
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}