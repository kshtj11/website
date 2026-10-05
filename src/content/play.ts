/**
 * PLAY PAGE — sidebar + sectioned masonry gallery (same hierarchy as the reference's Art page).
 *
 *   Sidebar group  ("Experiments")           ← collapsible, expands while one of its sections is on screen
 *     └ Section    ("Tiles Tool"  6)         ← a header row + a gallery of pieces; count = pieces.length
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
  title: string;
  /** Grey text after the title: medium, year, tool… */
  meta?: string;
  /** width / height. 0.8 = 4:5 portrait (default), 1 = square, 1.5 = 3:2 landscape */
  aspect?: number;
};

export type PlaySection = {
  /** Anchor id, also used in the URL hash (#tiles-tool) */
  id: string;
  label: string;
  /** "plain" = inset grey label (reference: Painting) · "ruled" = label + hairline (reference: Sketchbook) */
  header?: "plain" | "ruled";
  /** Optional link at the right end of the header row (reference: "3D Gallery") */
  action?: { label: string; href: string };
  pieces: PlayPiece[];
};

export type PlayGroup = {
  id: string;
  label: string;
  sections: PlaySection[];
};

/** Placeholder pieces with a mix of aspect ratios so the masonry is visible. */
function placeholders(n: number, title = "Untitled"): PlayPiece[] {
  const aspects = [0.8, 1.25, 1, 0.75, 1.5, 0.8];
  return Array.from({ length: n }, (_, i) => ({
    title: `${title} ${i + 1}`,
    meta: "2025",
    aspect: aspects[i % aspects.length],
  }));
}

export const playGroups: PlayGroup[] = [
  {
    id: "experiments",
    label: "Experiments",
    sections: [
      {
        id: "ixt",
        label: "IxT Project",
        action: { label: "Case study", href: "/play/ixt/" },
        pieces: placeholders(5, "IxT"),
      },
      {
        id: "tiles-tool",
        label: "Tiles Tool",
        action: { label: "Case study", href: "/play/tiles-tool/" },
        pieces: placeholders(9, "Tile"),
      },
      {
        id: "fractal-visualizer",
        label: "Fractal Visualizer",
        action: { label: "Case study", href: "/play/fractal-visualizer/" },
        pieces: placeholders(6, "Fractal"),
      },
    ],
  },
  {
    id: "photography",
    label: "Photography",
    sections: [
      { id: "photo-series-1", label: "Series one", header: "ruled", pieces: placeholders(6, "Photo") },
      { id: "photo-series-2", label: "Series two", header: "ruled", pieces: placeholders(6, "Photo") },
    ],
  },
  {
    id: "fun",
    label: "Fun",
    sections: [{ id: "fun", label: "Fun", header: "ruled", pieces: placeholders(6, "Doodle") }],
  },
];

export const playSections = playGroups.flatMap((g) => g.sections);
