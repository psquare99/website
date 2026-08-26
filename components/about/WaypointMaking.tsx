import Image from "next/image";
import Link from "next/link";

interface WaypointMakingProps {
  heading: string;
  text: string;
  image: string;
  imageAlt: string;
  linkLabel: string;
  linkUrl: string;
}

export default function WaypointMaking({
  heading,
  text,
  image,
  imageAlt,
  linkLabel,
  linkUrl,
}: WaypointMakingProps) {
  if (!heading && !text) return null;

  return (
    <div className="space-y-6">
      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h2>
      )}

      {text && (
        <div className="space-y-5 text-lg leading-9 text-neutral-700">
          {text.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {linkLabel && linkUrl && (
        <Link
          href={linkUrl}
          className="inline-block border-b border-neutral-300 pb-px text-sm font-medium text-neutral-900 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {linkLabel} →
        </Link>
      )}

      {image && (
        <div className="overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt={imageAlt || ""}
            width={600}
            height={400}
            className="h-auto w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
