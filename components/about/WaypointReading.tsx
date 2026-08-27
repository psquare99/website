import Image from "next/image";
import WaypointComposition from "@/components/about/WaypointComposition";

interface WaypointReadingProps {
  heading: string;
  text: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookCoverAlt: string;
}

export default function WaypointReading({
  heading,
  text,
  bookTitle,
  bookAuthor,
  bookCover,
  bookCoverAlt,
}: WaypointReadingProps) {
  if (!heading && !text && !bookTitle) return null;

  const imageNode = bookCover ? (
    <div className="flex justify-center">
      <div className="w-full max-w-[260px] overflow-hidden rounded-lg">
        <Image
          src={bookCover}
          alt={bookCoverAlt || bookTitle}
          width={100}
          height={150}
          className="h-auto w-full object-cover"
        />
      </div>
    </div>
  ) : null;

  const contentNode = (
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

      {bookTitle && (
        <div>
          <p className="font-serif text-lg font-semibold text-neutral-900">{bookTitle}</p>
          {bookAuthor && <p className="mt-1 text-sm text-neutral-500">{bookAuthor}</p>}
        </div>
      )}
    </div>
  );

  // Book image on the left, reading text + current book on the right.
  return (
    <WaypointComposition image={imageNode} content={contentNode} contentSide="right" />
  );
}
