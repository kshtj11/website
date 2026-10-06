/**
 * Block-title engine — the site's quadtree motion language, with no React in it.
 *
 * A line of text is rendered into an offscreen mask and cut into a quadtree of solid blocks
 * (32 → 16 → 8 → 4 px, splitting only along letter edges). The engine draws those blocks on a
 * <canvas> placed exactly over the text. Steps are instant swaps; the holds between them shrink so
 * every sequence builds up speed. Colour is its own track: noise → नमस्कार gradient → ink.
 *
 * Spec + frame-by-frame reference: Figma page "🎞 Motion".
 */

/** All timings in ms. Change motion here, nowhere else. */
export const MOTION = {
  root: 32, // biggest block, px

  // Arriving on the page (intro)
  outMs: 260, // previous title slides away (CSS keyframes titleOut)
  noiseAt: 300, // blocks appear only after the previous title is fully gone
  flyInMs: 300, // noise flies in from the right
  flyInPx: 72,
  noiseFlickers: [95, 190], // re-roll the noise while the big blocks linger (after noiseAt)
  resolve: [280, 400, 500], // levels 1–3 (16, 8, 4 px), after noiseAt
  textAt: 600, // real text (in the gradient) replaces the blocks, after noiseAt
  inkDelay: 60, // then breathes into black, right → left (CSS .ink-sweep)
  inkMs: 900,

  // Click game
  clicksToResolve: 7, // 1st click crumbles, 2nd–6th shuffle, 7th resolves
  dissolve: [80, 145, 200], // 4px ink → 8px gradient → 16px half-noise → noise
  shuffle: [0, 75, 135, 180], // noise re-rolls
} as const;

// Coarse levels keep a block even when it only partly covers a letter, so shapes read chunky.
const KEEP = [-1, 0.22, 0.34, 0.45];
// How far each level's colour has settled from noise to the gradient.
const TO_BRAND = [0, 0.55, 0.85, 1];
const INK = [0x25, 0x25, 0x25];
// The नमस्कार gradient (same stops as --brand-gradient in globals.css).
const BRAND = [
  [0.031, [0xda, 0x35, 0x6c]], // rose
  [0.551, [0xcf, 0x32, 0x83]], // magenta
  [0.931, [0x9c, 0x1e, 0xaa]], // violet
] as const;

type RGB = number[];

function brandAt(t: number): RGB {
  if (t <= BRAND[0][0]) return [...BRAND[0][1]];
  for (let i = 1; i < BRAND.length; i++) {
    const [p1, c1] = BRAND[i];
    const [p0, c0] = BRAND[i - 1];
    if (t <= p1)
      return c0.map((v, j) => v + ((c1[j] - v) * (t - p0)) / (p1 - p0));
  }
  return [...BRAND[BRAND.length - 1][1]];
}

/** A vivid random colour (any hue). */
function noiseColour(): RGB {
  const h = Math.random() * 360;
  const s = 0.7 + Math.random() * 0.25;
  const l = 0.5 + Math.random() * 0.15;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))),
  );
}

/** Quadtree of the element's letterforms, from its text rendered into an offscreen mask. */
function buildLevels(el: HTMLElement, text: string) {
  const ROOT = MOTION.root;
  const cs = getComputedStyle(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const cols = Math.ceil(w / ROOT);
  const rows = Math.ceil(h / ROOT);
  const W = cols * ROOT;
  const H = rows * ROOT;

  const mask = document.createElement("canvas");
  mask.width = W;
  mask.height = H;
  const m = mask.getContext("2d", { willReadFrequently: true })!;
  m.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  if ("letterSpacing" in m)
    (m as { letterSpacing: string }).letterSpacing = cs.letterSpacing;
  const met = m.measureText(text);
  const asc = met.fontBoundingBoxAscent;
  const desc = met.fontBoundingBoxDescent;
  m.fillText(text, 0, (h - (asc + desc)) / 2 + asc); // same baseline as the line box

  // Summed-area table → ink coverage of any square in O(1).
  const a = m.getImageData(0, 0, W, H).data;
  const sat = new Float32Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++)
    for (let x = 0, row = 0; x < W; x++) {
      row += a[(y * W + x) * 4 + 3] / 255;
      sat[(y + 1) * (W + 1) + x + 1] = sat[y * (W + 1) + x + 1] + row;
    }
  const cover = (x: number, y: number, s: number) =>
    (sat[(y + s) * (W + 1) + x + s] -
      sat[y * (W + 1) + x + s] -
      sat[(y + s) * (W + 1) + x] +
      sat[y * (W + 1) + x]) /
    (s * s);

  const levels = KEEP.map((_, level) => {
    const blocks: [number, number, number][] = [];
    const walk = (x: number, y: number, s: number, d: number) => {
      const c = cover(x, y, s);
      if (level > 0 && c < 0.02) return;
      if (c > 0.92 || d === level) {
        if (c > KEEP[level]) blocks.push([x, y, s]);
        return;
      }
      const k = s / 2;
      walk(x, y, k, d + 1);
      walk(x + k, y, k, d + 1);
      walk(x, y + k, k, d + 1);
      walk(x + k, y + k, k, d + 1);
    };
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) walk(c * ROOT, r * ROOT, ROOT, 0);
    return blocks;
  });
  return { W, H, cols, rows, levels };
}

export type BlockEngine = {
  /** Draw a fresh noise layout */
  noise: () => void;
  /** Draw a resolve level (1 = 16px … 3 = 4px) */
  resolve: (level: number) => void;
  /** 1st click: the text crumbles into noise (MOTION.dissolve) */
  dissolve: () => void;
  /** Later clicks: a few quick noise re-rolls (MOTION.shuffle) */
  shuffle: () => void;
  /** Cancel any pending steps */
  dispose: () => void;
};

/** Sizes `canvas` to cover `textEl` and returns its drawing modes. */
export function createBlockEngine(
  textEl: HTMLElement,
  canvas: HTMLCanvasElement,
  text: string,
): BlockEngine {
  const ROOT = MOTION.root;
  const { W, H, cols, rows, levels } = buildLevels(textEl, text);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let timers: number[] = [];

  const paint = (x: number, y: number, s: number, c: RGB) => {
    ctx.fillStyle = `rgb(${c.map(Math.round).join(",")})`;
    ctx.fillRect(x, y, s, s);
  };
  /** Run drawing steps at the given times; a new run cancels the previous one. */
  const steps = (list: [number, () => void][]) => {
    timers.forEach(clearTimeout);
    timers = list.map(([t, fn]) => window.setTimeout(fn, t));
  };

  const noise = () => {
    ctx.clearRect(0, 0, W, H);
    const split = (x: number, y: number, s: number, d: number) => {
      if (d < 2 && Math.random() < (d === 0 ? 0.55 : 0.3)) {
        const k = s / 2;
        split(x, y, k, d + 1);
        split(x + k, y, k, d + 1);
        split(x, y + k, k, d + 1);
        split(x + k, y + k, k, d + 1);
      } else paint(x, y, s, noiseColour());
    };
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) split(c * ROOT, r * ROOT, ROOT, 0);
  };
  /** A letter level, coloured `t` of the way from `from` to the brand gradient. */
  const level = (lv: number, t: number, from: () => RGB = noiseColour) => {
    ctx.clearRect(0, 0, W, H);
    for (const [x, y, s] of levels[lv]) {
      const g = brandAt((x + s / 2) / W);
      const f = from();
      paint(
        x,
        y,
        s,
        f.map((v, j) => v + (g[j] - v) * t),
      );
    }
  };

  return {
    noise,
    resolve: (lv) => level(lv, TO_BRAND[lv]),
    dissolve() {
      level(3, 0, () => INK); // 4px ink blocks: looks like the text itself
      const [a, b, c] = MOTION.dissolve;
      steps([
        [a, () => level(2, 1)],
        [b, () => level(1, 0.5)],
        [c, noise],
      ]);
    },
    shuffle: () => steps(MOTION.shuffle.map((t) => [t, noise])),
    dispose: () => timers.forEach(clearTimeout),
  };
}
