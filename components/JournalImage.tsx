interface JournalImageProps {
  src: string;
  alt?: string;
}

export default function JournalImage({
  src,
  alt = "",
}: JournalImageProps) {
  return (
    <figure className="journal-image">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}
