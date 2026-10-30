"use client";
import { useState, type ImgHTMLAttributes } from "react";

export default function StudioImage(
  props: ImgHTMLAttributes<HTMLImageElement>,
) {
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
  return <img {...props} onError={() => setFailed(true)} />;
}
