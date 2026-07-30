import type { Hero } from "@/types/hero";

interface HeroProps {
  hero: Hero;
}

export default function Hero({ hero }: HeroProps) {
  return (
    <section className="max-w-3xl space-y-10">
  <h1 className="text-[4rem] font-bold tracking-tight">
    {hero.title}
  </h1>

  <div className="space-y-5 text-2xl text-neutral-700">
    <p>{hero.subtitle}</p>
    <p>{hero.tagline}</p>
  </div>
</section>
  );
}