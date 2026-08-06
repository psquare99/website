import Link from "next/link";

import Container from "@/components/Container";

export default function NotFound() {
  return (
    <Container>
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">

        <h1 className="text-6xl font-semibold tracking-tight text-neutral-900">
          Lost?
        </h1>

        <p className="mt-8 text-xl leading-9 text-neutral-600">
          It looks like this path doesn't lead anywhere.
        </p>

        <div className="mt-12 space-y-5 text-lg leading-9 text-neutral-700">

          <p>
            That's okay.
          </p>

          <p>
            Some roads aren't meant to be followed.
          </p>

          <p className="italic">
            Maybe it's time to take the long way home.
          </p>

        </div>

        <Link
          href="/"
          className="mt-16 rounded-full border border-neutral-300 px-6 py-3 font-medium transition-all duration-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
        >
          ← Return Home
        </Link>

      </main>
    </Container>
  );
}