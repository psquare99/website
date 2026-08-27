import Image from "next/image";

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
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
      {image && (
        <div className="shrink-0">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm">
            <Image
              src={image}
              alt={imageAlt || ""}
              width={600}
              height={750}
              className="h-auto w-full max-w-[220px] object-cover sm:max-w-[240px]"
              priority
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
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

        {!hasContent && !image && (
          <p className="italic text-neutral-400">Introduction coming soon.</p>
        )}
      </div>
    </div>
  );
}
