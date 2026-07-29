import Container from "@/components/layout/Container";
import Thread from "@/components/ui/Thread";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <Container>
      <section className="flex min-h-[60vh] items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-5">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <p className="mb-6 text-lg text-stone-500">
              Welcome
            </p>

            <h1 className="mb-10 text-6xl font-bold tracking-tight">
              Hi, I'm Prateek.
            </h1>

            <div className="space-y-4 text-3xl">
              <p>Curious Developer</p>

              <p>
                Mountains{" "}
                <span className="text-red-500">
                  ❤️
                </span>
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-2 lg:pt-16">
            {Object.values(site.threads).map((item) => (
              <Thread
  key={item.value}
  icon={item.icon}
  label={item.label}
  value={item.value}
  href={item.href}
/>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}