import WaypointComposition from "@/components/about/WaypointComposition";

interface WaypointClosingProps {
  eyebrow: string;
  heading: string;
  text: string;
  signature: string;
}

export default function WaypointClosing({
  eyebrow,
  heading,
  text,
  signature,
}: WaypointClosingProps) {
  if (!eyebrow && !heading && !text && !signature) return null;

  const contentNode = (
    <div className="space-y-6 text-center">
      {eyebrow && (
        <span className="block font-sans text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
          {eyebrow}
        </span>
      )}

      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h2>
      )}

      {text && (
        <div className="mx-auto max-w-lg space-y-5 text-lg leading-9 text-neutral-700">
          {text.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {signature && (
        <p
          className="pt-4 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-script)", color: "var(--color-accent)" }}
        >
          {signature}
        </p>
      )}
    </div>
  );

  // Closing sits on the right of the final marker as a thoughtful terminus, with
  // its text centred within the column. No image.
  return (
    <WaypointComposition content={contentNode} contentSide="right" />
  );
}
