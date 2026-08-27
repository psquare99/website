import type { ReactNode } from "react";
import Image from "next/image";
import WallPin from "@/components/about/WallPin";

interface WallPhotoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  rotate?: number;
  /** Optional extra node rendered beneath the photo, e.g. a location tag. */
  children?: ReactNode;
  className?: string;
  /** Optional deterministic size helper applied to the frame. */
  frameClassName?: string;
}

/**
 * A physical photograph pinned to the workshop wall: white/off-white border,
 * subtle shadow, slight rotation and a small green pin. Holds itself upright
 * with explicit dimensions so layout stays stable (no random rotation).
 */
export default function WallPhoto({
  src,
  alt,
  width,
  height,
  rotate = 0,
  children,
  className = "",
  frameClassName = "",
}: WallPhotoProps) {
  return (
    <div className={`relative ${className}`}>
      <WallPin />
      <figure
        className="inline-block bg-white p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, transformOrigin: "top center" }}
      >
        <div className="overflow-hidden rounded-[2px]">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`h-auto w-full object-cover ${frameClassName}`}
          />
        </div>
      </figure>
      {children}
    </div>
  );
}
