import { mediaBySlug, pic } from "./media";
import { isVisible, type Status } from "./status";

/**
 * PLAY PAGE — sidebar + sectioned masonry gallery (same hierarchy as the reference's Art page).
 *
 *   Sidebar group  ("Experiments")           ← collapsible, expands while one of its sections is on screen
 *     └ Section    ("Tiles Mosaic Tool" 10) ← a header row + a gallery of pieces; count = pieces.length
 *         └ Piece  (one image + caption)     ← click opens the lightbox
 *
 * A group with a single section and no label of its own renders as a flat sidebar item.
 * Images go in /public/play/<section-id>/… ; omit `src` to get a sized placeholder.
 * All titles/captions below are PLACEHOLDERS.
 */

export type PlayPiece = {
  src?: string;
  /** Bigger file for the lightbox (optional; falls back to src) */
  fullSrc?: string;
  /** Caption under the piece; leave "" for no caption */
  title: string;
  /** Description for screen readers when there's no title */
  alt?: string;
  /** Grey text after the title: medium, year, tool… */
  meta?: string;
  /** width / height. 0.8 = 4:5 portrait (default), 1 = square, 1.5 = 3:2 landscape */
  aspect?: number;
};

export type PlaySection = {
  /** "draft" = visible locally only (see status.ts) */
  status?: Status;
  /** Anchor id, also used in the URL hash (#tiles-tool) */
  id: string;
  label: string;
  /** "plain" = inset grey label (reference: Painting) · "ruled" = label + hairline (reference: Sketchbook) */
  header?: "plain" | "ruled";
  /** Optional link at the right end of the header row (reference: "3D Gallery") */
  action?: { label: string; href: string };
  /** Masonry columns on desktop: 3 (default) or 2 for bigger pieces like photos */
  columns?: 2 | 3;
  /** Don't download images until the visitor scrolls near (connection-aware; tap-to-load on slow data) */
  deferred?: boolean;
  pieces: PlayPiece[];
};

export type PlayGroup = {
  id: string;
  label: string;
  sections: PlaySection[];
};

/** A real piece from the image pipeline (sized automatically, GIFs stay animated). */
function piece(slug: string, file: string, title: string, meta?: string): PlayPiece {
  const img = pic(slug, file, title);
  // Animated pieces show the light card copy in the grid and the full file in the lightbox.
  return { src: img.card ?? img.src, fullSrc: img.src, title, meta, aspect: img.width / img.height };
}

/**
 * Every processed image in a folder (e.g. media-src/Sketchbook → "sketchbook"), in file order.
 * Grid shows the light card copy; the lightbox opens the full-quality file.
 * `titles` maps a processed file name (lowercase, dashes, no extension) to a caption; others get none.
 */
function collection(slug: string, alt: string, titles: Record<string, string> = {}): PlayPiece[] {
  return (mediaBySlug[slug]?.images ?? []).map((img) => {
    const name = img.src.split("/").pop()!.replace(/\.[^.]+$/, "");
    return { src: img.card ?? img.src, fullSrc: img.src, title: titles[name] ?? "", alt, aspect: img.width / img.height };
  });
}

/** Placeholder pieces with a mix of aspect ratios so the masonry is visible. */
function placeholders(n: number, title = "Untitled"): PlayPiece[] {
  const aspects = [0.8, 1.25, 1, 0.75, 1.5, 0.8];
  return Array.from({ length: n }, (_, i) => ({
    title: `${title} ${i + 1}`,
    meta: "2025",
    aspect: aspects[i % aspects.length],
  }));
}

const allPlayGroups: PlayGroup[] = [
  {
    id: "experiments",
    label: "Experiments",
    sections: [
      {
        id: "tiles-mosaic-tool",
        label: "Tiles Mosaic Tool",
        action: { label: "Case study", href: "/play/tiles-mosaic-tool/" },
        pieces: [
          piece("glazed-tiles", "glaze-type-hi", "hi", "type, animated"),
          piece("glazed-tiles", "image 29.png", "S.T.D. P.C.O. I.S.D.", "quadtree"),
          piece("glazed-tiles", "Frame 28.png", "I love glazing", "type"),
          piece("glazed-tiles", "namaste.gif", "नमस्ते", "GIF"),
          piece("glazed-tiles", "image 66.png", "Devanagari", "image"),
          piece("glazed-tiles", "Frame 33.png", "honk", "type"),
          piece("glazed-tiles", "image 67.png", "Framed scene", "image"),
          piece("glazed-tiles", "Frame 37.png", "serif", "type"),
          piece("glazed-tiles", "image 70.png", "Letterform", "border"),
          piece("glazed-tiles", "Frame 39.png", "A painting, re-tiled", "image"),
        ],
      },
      {
        id: "fractal-visualizer",
        status: "draft",
        label: "Fractal Visualizer",
        action: { label: "Case study", href: "/play/fractal-visualizer/" },
        pieces: placeholders(6, "Fractal"),
      },
    ],
  },
  {
    // Single section with the same label → shows as one flat sidebar item.
    id: "sketchbook",
    label: "Sketchbook",
    sections: [
      {
        id: "sketchbook",
        label: "Sketchbook",
        header: "ruled",
        pieces: collection("sketchbook", "Sketchbook page", {
          "alain-de": "Alain de",
          frenchanda: "Frenchanda",
          iloveslugs: "I love slugs",
          "paar-e-taalab-1": "Paar-e-taalab",
          piercebanana: "Pierce banana",
        }),
      },
    ],
  },
  {
    id: "photography",
    label: "Photography",
    // Single section with the same label → one flat sidebar item. Lowest on the page, so it loads lazily.
    sections: [
      {
        id: "photography",
        label: "Photography",
        header: "ruled",
        columns: 2,
        deferred: true,
        pieces: collection("photography", "Photograph"),
      },
    ],
  },
];

/** Groups with draft sections removed (on the live site); empty groups disappear. */
export const playGroups: PlayGroup[] = allPlayGroups
  .map((g) => ({ ...g, sections: g.sections.filter(isVisible) }))
  .filter((g) => g.sections.length > 0);

export const playSections = playGroups.flatMap((g) => g.sections);
