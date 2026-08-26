import Image from "next/image";
import Link from "next/link";

interface WaypointIntroProps {
  eyebrow: string;
  heading: string;
  text: string;
  signature: string;
  image: string;
  imageAlt: string;
}

export default function WaypointIntro({
  eyebrow,
  heading,
  text,
  signature,
  image,
  imageAlt,
}: WaypointIntroProps) {
  const hasContent = eyebrow || heading || text || signature;

  return (
    <div className="space-y-8">
      {eyebrow && (
        <span className="block font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
          {eyebrow}
        </span>
      )}

      {heading && (
        <h1 className="text-4xl font-normal tracking-tight text-neutral-900 sm:text-5xl">
          {heading}
        </h1>
      )}

      {text && (
        <div className="space-y-5 text-lg leading-9 text-neutral-700">
          {text.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {signature && (
        <p
          className="pt-2 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
        >
          {signature}
        </p>
      )}

      {image && (
        <div className="overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt={imageAlt || ""}
            width={600}
            height={750}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      )}

      {!hasContent && !image && (
        <p className="italic text-neutral-400">Introduction coming soon.</p>
      )}
    </div>
  );
}
