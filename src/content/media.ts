import type { SizedImage } from "./types";
import media from "./media.generated.json";

type MediaEntry = { cover: SizedImage | null; images: SizedImage[] };

/** Everything the image pipeline produced, keyed by slug (see scripts/process-images.mjs). */
export const mediaBySlug = media as Record<string, MediaEntry>;

/**
 * One processed image by its source file name, e.g. pic("glazed-tiles", "Frame 28.png").
 * Names are matched the way the pipeline renames them (lowercase, spaces → dashes, any extension).
 */
export function pic(slug: string, file: string, alt?: string): SizedImage {
  const base = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const entry = mediaBySlug[slug];
  const all = entry ? [...entry.images, ...(entry.cover ? [entry.cover] : [])] : [];
  const hit = all.find((img) => img.src.split("/").pop()?.replace(/\.[^.]+$/, "") === base);
  if (!hit) throw new Error(`pic(): no processed image "${file}" for "${slug}" — run npm run images`);
  return { ...hit, alt };
}
