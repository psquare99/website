import Link from "next/link";

export default function Brand() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="inline-flex items-start font-semibold tracking-tight text-stone-900 transition-colors hover:text-stone-700"
    >
      <span className="text-2xl">P</span>

      <sup className="-ml-0.5 text-xs font-medium relative -top-0.5">
        2
      </sup>
    </Link>
  );
}