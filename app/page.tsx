import Container from "@/components/Container";

import Reflection from "@/components/Reflection";
import HomeHero from "@/components/HomeHero";
import { reflection } from "@/content/home/reflection";

export default function HomePage() {
  return (
    <Container>
  <main className="pt-12 pb-8">
    <HomeHero />
  </main>
</Container>
  );
}