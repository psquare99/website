import Image from "next/image";

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

      {bookTitle && (
        <div className="flex items-start gap-6">
          {bookCover && (
            <div className="shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] shadow-sm">
              <Image
                src={bookCover}
                alt={bookCoverAlt || bookTitle}
                width={100}
                height={150}
                className="h-auto w-24 object-cover"
              />
            </div>
          )}
          <div className="pt-1">
            <p className="font-serif text-lg font-semibold text-neutral-900">{bookTitle}</p>
            {bookAuthor && <p className="mt-1 text-sm text-neutral-500">{bookAuthor}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
