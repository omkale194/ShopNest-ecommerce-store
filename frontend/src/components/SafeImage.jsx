import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../config";
import { sizedImage } from "../utils/images";

/**
 * Photo that never shows a broken-image icon: a missing or failing link
 * is replaced by the neutral placeholder. `width` and `height` only reserve the aspect ratio.
 */
export default function SafeImage({ src, alt = "", width = 800, height = 1000, request = 800, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const url = !src || failed ? PLACEHOLDER_IMAGE : sizedImage(src, request);
  return (
    <img
      className={`photo ${className}`.trim()}
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
