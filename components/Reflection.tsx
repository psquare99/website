import type { Reflection } from "@/types/reflection";

interface ReflectionProps {
  reflection: Reflection;
}

export default function Reflection({
  reflection,
}: ReflectionProps) {
  return (
    <p className="max-w-lg text-lg leading-8 text-neutral-600 italic">
      {reflection.text}
    </p>
  );
}