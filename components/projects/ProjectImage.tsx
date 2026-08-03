import Image from "next/image";

interface ProjectImageProps {
  src: string;
  alt: string;
}

export default function ProjectImage({
  src,
  alt,
}: ProjectImageProps) {
  return (
    <div className="relative aspect-[10/16] overflow-hidden rounded-2xl">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
      />
    </div>
  );
}