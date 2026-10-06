// Image pipeline: media-src/{projects,experiments}/<folder>/* → public/projects/<slug>/*.webp (GIFs copied as-is)
//                 + src/content/media.generated.json
//
//   media-src/projects/ek-time/cover.png        → card + popup cover
//   media-src/projects/ek-time/01.png …         → shown in order in the preview popup (natural sort)
//   media-src/experiments/glazed tiles/*.png    → slug "glazed-tiles" (folder names are slugified)
//
// Originals stay out of git (media-src/ is ignored); the optimized WebP files and the manifest are committed.
// When media-src/ is missing (e.g. on CI) the script leaves existing output untouched.
import { existsSync, statSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC_ROOTS = ["media-src/projects", "media-src/experiments"];
const OUT = "public/projects";
const MANIFEST = "src/content/media.generated.json";
const MAX_WIDTH = 2800; // keep Behance-retina exports at full resolution
const QUALITY = 92; // high quality; with smartSubsample below, colour edges + small text stay crisp
const INPUT = /\.(png|jpe?g|webp|avif|tiff?|gif)$/i;
const BIG_GIF_BYTES = 8 * 1024 * 1024; // GIFs above this become animated WebP (smaller GIFs are copied untouched)
const ANIM_QUALITY = 88; // animated WebP quality (visually matches the source GIF)
const CARD_WIDTH = 720; // grid-thumbnail width (2x a ~354px masonry column)
// Collections shown in wider grids need bigger cards (2x a ~540px two-column cell).
const CARD_WIDTH_FOR = { photography: 1080 };
const CARD_QUALITY = 85;
// Quadtree loading placeholders (played by src/components/shared/QuadtreeLoader.tsx)
const QUADTREES = "src/content/quadtrees.generated.json";
const QT_DEPTH = 4; // root square → up to 16×16 cells
const QT_SPLIT = 20; // split a cell when its colour spread (std-dev, 0–255) is above this
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

if (!SRC_ROOTS.some((r) => existsSync(r))) {
  console.log(`process-images: no media-src/ folders, keeping existing ${MANIFEST}`);
  process.exit(0);
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const manifest = {};
let written = 0;
let skipped = 0;

// ── Quadtrees ───────────────────────────────────────────────────────────────
// Each image gets a tiny colour quadtree: the frame is cut into 1–6 big squares, and each square
// splits into four wherever it has detail, up to QT_DEPTH levels. Encoded as one short string:
//   "<cols><rows>" + per square, pre-order: "." = split into 4 (TL TR BL BR), else a 2-char 12-bit colour.
// The site plays it coarse → fine while the real image downloads.
const qtKey = (src) => src.replace(/(\.card)?\.(webp|gif)$/, "");
const oldQuadtrees = existsSync(QUADTREES) ? JSON.parse(await readFile(QUADTREES, "utf8")) : {};
const quadtrees = {};
let qtMade = 0;

async function quadtree(file) {
  const meta = await sharp(file).metadata();
  const aspect = meta.width / (meta.pageHeight ?? meta.height);
  const cols = aspect >= 1 ? Math.min(6, Math.max(1, Math.round(aspect))) : 1;
  const rows = aspect < 1 ? Math.min(6, Math.max(1, Math.round(1 / aspect))) : 1;
  const n = 2 ** QT_DEPTH;
  const W = cols * n;
  const data = await sharp(file, { limitInputPixels: false })
    .flatten({ background: "#ffffff" })
    .resize(W, rows * n, { fit: "fill" })
    .raw()
    .toBuffer();

  const node = (x, y, size, depth) => {
    const sum = [0, 0, 0];
    const sq = [0, 0, 0];
    for (let j = y; j < y + size; j++)
      for (let i = x; i < x + size; i++)
        for (let c = 0; c < 3; c++) {
          const v = data[(j * W + i) * 3 + c];
          sum[c] += v;
          sq[c] += v * v;
        }
    const count = size * size;
    const mean = sum.map((v) => v / count);
    const spread = Math.sqrt(sq.reduce((a, v, c) => a + v / count - mean[c] ** 2, 0) / 3);
    if (depth < QT_DEPTH && spread > QT_SPLIT) {
      const h = size / 2;
      return "." + node(x, y, h, depth + 1) + node(x + h, y, h, depth + 1) + node(x, y + h, h, depth + 1) + node(x + h, y + h, h, depth + 1);
    }
    const [r, g, b] = mean.map((v) => Math.round(v / 17));
    const v = (r << 8) | (g << 4) | b;
    return B64[v >> 6] + B64[v & 63];
  };

  let out = `${cols}${rows}`;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out += node(c * n, r * n, n, 0);
  return out;
}

/** Reuse last run's quadtree unless the image was just rewritten. */
async function addQuadtree(item, outDir, rewritten) {
  const key = qtKey(item.src);
  if (!rewritten && oldQuadtrees[key]) quadtrees[key] = oldQuadtrees[key];
  else {
    // The light card copy is quicker to read and has the same colours.
    quadtrees[key] = await quadtree(path.join(outDir, path.basename(item.card ?? item.src)));
    qtMade++;
  }
}

/** Rebuild a manifest entry from already-processed files (used when the originals aren't on this machine). */
async function entryFromOutput(slug) {
  const outDir = path.join(OUT, slug);
  if (!existsSync(outDir) || !(await stat(outDir)).isDirectory()) return null;
  const entry = { cover: null, images: [] };
  const all = await readdir(outDir);
  for (const f of all.filter((f) => /\.(webp|gif)$/.test(f) && !f.endsWith(".card.webp")).sort(natural.compare)) {
    const meta = await sharp(path.join(outDir, f)).metadata();
    const item = { src: `/projects/${slug}/${f}`, width: meta.width, height: meta.pageHeight ?? meta.height };
    const card = `${path.parse(f).name}.card.webp`;
    if (all.includes(card)) item.card = `/projects/${slug}/${card}`;
    await addQuadtree(item, outDir, false);
    if (path.parse(f).name === "cover") entry.cover = item;
    else entry.images.push(item);
  }
  return entry.cover || entry.images.length ? entry : null;
}

// slug → source folder, across every root ("glazed tiles" → "glazed-tiles"). Any other top-level
// folder in media-src/ (e.g. media-src/Sketchbook) is its own collection, slug = folder name.
const srcDirs = new Map();
const gridSlugs = new Set(); // shown in Play grids → every image also gets a light "card" copy
for (const root of SRC_ROOTS.filter((r) => existsSync(r))) {
  for (const folder of await readdir(root)) {
    srcDirs.set(slugify(folder), path.join(root, folder));
    if (root.endsWith("experiments")) gridSlugs.add(slugify(folder));
  }
}
if (existsSync("media-src")) {
  for (const folder of await readdir("media-src")) {
    const full = path.join("media-src", folder);
    if (SRC_ROOTS.includes(full.replace(/\\/g, "/")) || !(await stat(full)).isDirectory()) continue;
    srcDirs.set(slugify(folder), full);
    gridSlugs.add(slugify(folder));
  }
}
const slugs = new Set([...srcDirs.keys(), ...(existsSync(OUT) ? await readdir(OUT) : [])]);
for (const slug of [...slugs].sort(natural.compare)) {
  const srcDir = srcDirs.get(slug) ?? "";
  const files =
    existsSync(srcDir) && (await stat(srcDir)).isDirectory()
      ? (await readdir(srcDir)).filter((f) => INPUT.test(f)).sort(natural.compare)
      : [];
  if (!files.length) {
    // No originals here: keep whatever was processed before instead of dropping the project.
    const kept = await entryFromOutput(slug);
    if (kept) manifest[slug] = kept;
    continue;
  }

  const outDir = path.join(OUT, slug);
  await mkdir(outDir, { recursive: true });
  const entry = { cover: null, images: [] };
  const keep = new Set();

  for (const file of files) {
    const base = path.parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const srcPath = path.join(srcDir, file);
    const srcStat = await stat(srcPath);
    const isGif = /\.gif$/i.test(file);
    // GIFs are copied untouched (animation + quality preserved) unless they're huge; those become
    // animated WebP, which looks the same at a fraction of the size. Everything else becomes WebP.
    const bigGif = isGif && srcStat.size > BIG_GIF_BYTES;
    const outName = isGif && !bigGif ? `${base}.gif` : `${base}.webp`;
    const outPath = path.join(outDir, outName);
    // GIFs, and every image in a Play collection, also get a light "card" copy for grid thumbnails;
    // the full-quality file is what opens in the lightbox / case study.
    const cardName = isGif || gridSlugs.has(slug) ? `${base}.card.webp` : null;
    const cardPath = cardName ? path.join(outDir, cardName) : null;
    keep.add(outName);
    if (cardName) keep.add(cardName);

    // Skip work when the outputs are newer than the source.
    const isFresh = (p) => !p || (existsSync(p) && statSync(p).mtimeMs >= srcStat.mtimeMs);
    const rewrite = !isFresh(outPath) || !isFresh(cardPath);
    if (rewrite) {
      if (isGif && !bigGif) {
        await copyFile(srcPath, outPath);
      } else {
        await sharp(srcPath, { animated: isGif, limitInputPixels: false })
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp(isGif ? { quality: ANIM_QUALITY, smartSubsample: true, effort: 5 } : { quality: QUALITY, smartSubsample: true, effort: 5 })
          .toFile(outPath);
      }
      if (cardPath) {
        await sharp(srcPath, { animated: isGif, limitInputPixels: false })
          .rotate() // respect phone-photo orientation
          .resize({ width: CARD_WIDTH_FOR[slug] ?? CARD_WIDTH, withoutEnlargement: true })
          .webp({ quality: CARD_QUALITY, effort: 5 })
          .toFile(cardPath);
      }
      written++;
    } else {
      skipped++;
    }

    // For animated files, pageHeight is one frame's height.
    const meta = await sharp(outPath).metadata();
    const width = meta.width;
    const height = meta.pageHeight ?? meta.height;
    const item = { src: `/projects/${slug}/${outName}`, width, height };
    if (cardName) item.card = `/projects/${slug}/${cardName}`;
    await addQuadtree(item, outDir, rewrite);
    if (base === "cover") entry.cover = item;
    else entry.images.push(item);
  }

  // Remove outputs whose source was deleted.
  for (const f of await readdir(outDir)) {
    if (/\.(webp|gif)$/.test(f) && !keep.has(f)) await rm(path.join(outDir, f));
  }
  manifest[slug] = entry;
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(QUADTREES, JSON.stringify(quadtrees) + "\n");
const counts = Object.entries(manifest)
  .map(([s, e]) => `${s}: ${e.images.length}${e.cover ? " + cover" : ""}`)
  .join(", ");
console.log(`process-images: ${written} written, ${skipped} unchanged, ${qtMade} quadtrees made →${counts || "nothing"}`);
