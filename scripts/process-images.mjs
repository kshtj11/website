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
import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
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

if (!SRC_ROOTS.some((r) => existsSync(r))) {
  console.log(`process-images: no media-src/ folders, keeping existing ${MANIFEST}`);
  process.exit(0);
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const manifest = {};
let written = 0;
let skipped = 0;

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
    if (!isFresh(outPath) || !isFresh(cardPath)) {
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
const counts = Object.entries(manifest)
  .map(([s, e]) => `${s}: ${e.images.length}${e.cover ? " + cover" : ""}`)
  .join(", ");
console.log(`process-images: ${written} written, ${skipped} unchanged → ${counts || "nothing"}`);
