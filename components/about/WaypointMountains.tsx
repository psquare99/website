import Image from "next/image";
import { MapPin } from "lucide-react";
import WaypointComposition from "@/components/about/WaypointComposition";

interface WaypointMountainsProps {
  heading: string;
  text: string;
  location: string;
  image: string;
  imageAlt: string;
}

export default function WaypointMountains({
  heading,
  text,
  location,
  image,
  imageAlt,
}: WaypointMountainsProps) {
  if (!heading && !text) return null;

  const imageNode = image ? (
    <div className="overflow-hidden rounded-2xl">
      <Image
        src={image}
        alt={imageAlt || ""}
        width={600}
        height={400}
        className="h-auto w-full object-cover"
      />
    </div>
  ) : null;

  const contentNode = (
    <div className="space-y-6">
      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h2>
      )}

      {location && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <MapPin className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.75} />
          <span>{location}</span>
        </div>
      )}

      {text && (
        <div className="space-y-5 text-lg leading-9 text-neutral-700">
          {text.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );

  // Text on the left, mountain image on the right — reverses the composition rhythm.
  return (
    <WaypointComposition image={imageNode} content={contentNode} contentSide="left" />
  );
}
