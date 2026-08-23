import Hero from "@/components/Hero";
import HeartbeatList from "@/components/HeartbeatList";
import Reflection from "@/components/Reflection";
import { reflection } from "@/content/home/reflection";
import { hero } from "@/content/home/hero";
import { heartbeats } from "@/content/home/heartbeats";

export default function HomeHero() {
  return (
    <section className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1.4fr_0.8fr] lg:gap-20">
      <div className="space-y-12">
        <Hero hero={hero} />
        <Reflection reflection={reflection} />
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-neutral-500">
          These days
        </h2>

        <HeartbeatList items={heartbeats} />
      </div>
    </section>
  );
}