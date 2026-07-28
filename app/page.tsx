import Container from "@/components/layout/Container";

export default function HomePage() {
  return (
    <Container>
      <section className="flex min-h-[75vh] items-center justify-center">
        <div className="w-full max-w-lg">
          <p className="text-lg text-stone-600">Welcome</p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            Hi, I&apos;m Prateek.
          </h1>

          <div className="mt-10 space-y-3 text-3xl font-medium text-stone-800">
            <p>Curious Developer</p>

            <p>
              Mountains{" "}
              <span className="text-red-500" aria-label="heart">
                ❤️
              </span>
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}