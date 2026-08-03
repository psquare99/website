import { ReactNode } from "react";

interface ProjectSectionProps {
  title: string;
  accentColor: string;
  children: ReactNode;
}

export default function ProjectSection({
  title,
  accentColor,
  children,
}: ProjectSectionProps) {
  return (
    <section className="mt-16">

    <div className="space-y-3">

        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {title}
        </h2>

        <div
  className="mt-4 h-1 w-16 rounded-full"
  style={{
    backgroundColor: accentColor,
  }}
/>

    </div>

    <div className="mt-8 text-lg leading-9 text-neutral-700">
        {children}
    </div>

</section>
  );
}