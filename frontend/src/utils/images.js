/** Adds width, quality and crop to Unsplash links that do not have them yet. Other links pass through. */
export function sizedImage(url, width = 800) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname === "images.unsplash.com" && !u.searchParams.has("w")) {
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", "80");
      return u.toString();
    }
  } catch {
    /* relative path or invalid URL: use as given */
  }
  return url;
}
