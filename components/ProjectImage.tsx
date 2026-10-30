"use client";
import { useState } from "react";
import Image, { type ImageProps } from "next/image";
export default function ProjectImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        className={`media-fallback ${props.className || ""}`}
        role="img"
        aria-label={props.alt || "Image unavailable"}
        style={{ aspectRatio: `${props.width || 4} / ${props.height || 3}` }}
      >
        <span>Image unavailable</span>
        <p>{props.alt}</p>
      </div>
    );
  return <Image {...props} onError={() => setFailed(true)} />;
}
