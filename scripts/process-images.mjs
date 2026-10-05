// Image pipeline: media-src/projects/<slug>/* → public/projects/<slug>/*.webp (GIFs copied as-is) + src/content/media.generated.json
//
//   media-src/projects/ek-time/cover.png   → card + popup cover
//   media-src/projects/ek-time/01.png …    → shown in order in the preview popup (natural sort)
//
// Originals stay out of git (media-src/ is ignored); the optimized WebP files and the manifest are committed.
// When media-src/ is missing (e.g. on CI) the script leaves existing output untouched.
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "media-src/projects";
const OUT = "public/projects";
const MANIFEST = "src/content/media.generated.json";
const MAX_WIDTH = 2800; // keep Behance-retina exports at full resolution
const QUALITY = 92; // high quality; with smartSubsample below, colour edges + small text stay crisp
const INPUT = /\.(png|jpe?g|webp|avif|tiff?|gif)$/i;

if (!existsSync(SRC)) {
  console.log(`process-images: no ${SRC}/ folder, keeping existing ${MANIFEST}`);
  process.exit(0);
}

const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const manifest = {};
let written = 0;
let skipped = 0;

/** Rebuild a manifest entry from already-processed files (used when the originals aren't on this machine). */
async function entryFromOutput(slug) {
  const outDir = path.join(OUT, slug);
  if (!existsSync(outDir) || !(await stat(outDir)).isDirectory()) return null;
  const entry = { cover: null, images: [] };
  for (const f of (await readdir(outDir)).filter((f) => /\.(webp|gif)$/.test(f)).sort(natural.compare)) {
    const meta = await sharp(path.join(outDir, f)).metadata();
    const item = { src: `/projects/${slug}/${f}`, width: meta.width, height: meta.pageHeight ?? meta.height };
    if (path.parse(f).name === "cover") entry.cover = item;
    else entry.images.push(item);
  }
  return entry.cover || entry.images.length ? entry : null;
}

const slugs = new Set([...(await readdir(SRC)), ...(existsSync(OUT) ? await readdir(OUT) : [])]);
for (const slug of [...slugs].sort(natural.compare)) {
  const srcDir = path.join(SRC, slug);
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
    // GIFs are copied untouched (animation + quality preserved); everything else becomes WebP.
    const isGif = /\.gif$/i.test(file);
    const outName = isGif ? `${base}.gif` : `${base}.webp`;
    const srcPath = path.join(srcDir, file);
    const outPath = path.join(outDir, outName);
    keep.add(outName);

    // Skip work when the output is newer than the source.
    const fresh = existsSync(outPath) && (await stat(outPath)).mtimeMs >= (await stat(srcPath)).mtimeMs;
    if (!fresh) {
      if (isGif) {
        await copyFile(srcPath, outPath);
      } else {
        await sharp(srcPath, { animated: false })
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: QUALITY, smartSubsample: true, effort: 5 })
          .toFile(outPath);
      }
      written++;
    } else {
      skipped++;
    }

    // For animated GIFs, pageHeight is one frame's height.
    const meta = await sharp(outPath).metadata();
    const width = meta.width;
    const height = meta.pageHeight ?? meta.height;
    const item = { src: `/projects/${slug}/${outName}`, width, height };
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
