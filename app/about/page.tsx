import Container from "@/components/Container";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Container>
      <main className="mx-auto max-w-3xl py-20">

        <section>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-900">
            Hello!
          </h1>

          <div className="mt-12 space-y-6 text-lg leading-9 text-neutral-700">

            <p>
              Hi, I'm Prateek.
            </p>

            <p>
              Welcome to my small corner of the internet.
            </p>

            <p>
              I'm someone who enjoys making things—
              software, websites, little experiments and
              occasionally stories. Most of what you'll
              find here started as curiosity rather than
              a grand plan.
            </p>

            <p>
              By profession, I work somewhere. Outside
              work, I spend much of my time learning,
              reading and building projects one small
              step at a time.
            </p>

            <p>
              I don't consider myself an expert in any
              of these things, and that's perfectly okay.
              This website isn't a showcase of mastery.
              It's simply a record of progress.
            </p>

          </div>
        </section>
        <section className="my-24">
  <div className="overflow-hidden rounded-3xl">
    <Image
      src="/images/about/hero.jpg"
      alt="A quiet mountain landscape"
      width={1600}
      height={900}
      className="h-auto w-full object-cover"
      priority
    />
  </div>
</section>

        <section className="mt-24">

          <h2 className="text-3xl font-semibold tracking-tight">
            Why this website exists
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-9 text-neutral-700">

            <p>
              I wanted a place that belongs entirely to me.
            </p>

            <p>
              Not a social media profile.
            </p>

            <p>
              Not a portfolio made to impress people.
            </p>

            <p>
              Just a quiet place where I can collect the
              things I'm learning, the projects I'm
              building and the thoughts I don't want
              to lose.
            </p>

          </div>

        </section>

        <section className="mt-24">

          <h2 className="text-3xl font-semibold tracking-tight">
            Right now
          </h2>

          <div className="mt-8 space-y-6 text-lg leading-9 text-neutral-700">

            <p>
              At the moment I'm building Prime,
              this website, an Adi Kailash tourism
              platform and a small story-driven game
              inspired by the Himalayas.
            </p>

            <p>
              Every project teaches me something new.
            </p>

            <p>
              That's the part I enjoy the most.
            </p>

          </div>

        </section>

        <section className="mt-24 text-center">

          <p className="text-xl italic text-neutral-700">
            Thanks for stopping by.
          </p>

        </section>

      </main>
    </Container>
  );
}