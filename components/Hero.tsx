import type { Hero } from "@/types/hero";

interface HeroProps {
  hero: Hero;
}

export default function Hero({ hero }: HeroProps) {
  return (
    <section className="max-w-3xl space-y-10">
  <h1 className="text-[4rem] font-normal tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
  {hero.title}{" "}
  <span style={{ fontFamily: "var(--font-script)", color: "var(--accent)" }} className="font-semibold">
    {hero.name}
  </span>
</h1>

  <div className="space-y-5 text-2xl text-neutral-700">
    <p>{hero.subtitle}</p>
    <p>{hero.tagline}</p>
  </div>
</section>
  );
}