// Figma → website. Exports every frame on the "📤 Export" page of the design file as a 2× PNG:
//
//   Section "ek-time"            → media-src/projects/ek-time/<frame name>.png
//   Section "play/glazed tiles"  → media-src/experiments/glazed tiles/<frame name>.png
//   Frames named cover, 01, 02 … (frames starting with "_" or "📝" are skipped)
//
// Then run the image pipeline (npm run figma:export does both).
//
// One-time setup: Figma → Settings → Security → Personal access tokens → Generate
// (scope "File content: Read only"), then put it in website/.env.local:   FIGMA_TOKEN=figd_…
// .env.local is git-ignored, so the token never leaves this laptop.
//
// Usage:  npm run figma:export              all sections
//         npm run figma:export -- ek-time   one section
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const FILE_KEY = "npYpF5sdmcdMv1Ht3xl8zU";
const PAGE_NAME = "📤 Export";
const SCALE = 2;
const API = "https://api.figma.com/v1";

function token() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  if (existsSync(".env.local")) {
    const m = readFileSync(".env.local", "utf8").match(/^FIGMA_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  }
  console.error("figma-export: no FIGMA_TOKEN. Add FIGMA_TOKEN=… to website/.env.local (see the comment at the top of this script).");
  process.exit(1);
}
const headers = { "X-Figma-Token": token() };

async function api(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}\n${await res.text()}`);
  return res.json();
}

const only = process.argv[2];
const file = await api(`${API}/files/${FILE_KEY}?depth=3`);
const page = file.document.children.find((p) => p.name === PAGE_NAME);
if (!page) throw new Error(`No page called "${PAGE_NAME}" in the Figma file.`);

// section name → output folder
const target = (name) =>
  name.startsWith("play/")
    ? path.join("media-src/experiments", name.slice("play/".length).trim())
    : path.join("media-src/projects", name.trim());

const jobs = []; // { id, dir, file }
for (const section of page.children ?? []) {
  if (!["SECTION", "FRAME"].includes(section.type) || section.name.startsWith("📝")) continue;
  if (only && section.name !== only) continue;
  for (const frame of section.children ?? []) {
    if (!["FRAME", "COMPONENT", "INSTANCE", "GROUP"].includes(frame.type)) continue;
    if (/^[_📝]/u.test(frame.name)) continue;
    jobs.push({ id: frame.id, dir: target(section.name), file: `${frame.name.trim()}.png` });
  }
}
if (!jobs.length) {
  console.log(`figma-export: nothing to export${only ? ` in section "${only}"` : ""}.`);
  process.exit(0);
}

// Render in batches; very tall frames can exceed Figma's render limit at 2×, so retry those at 1×.
async function render(ids, scale) {
  const out = {};
  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40);
    const { images } = await api(`${API}/images/${FILE_KEY}?ids=${batch.join(",")}&format=png&scale=${scale}`);
    Object.assign(out, images);
  }
  return out;
}
const urls = await render(jobs.map((j) => j.id), SCALE);
const retry = jobs.filter((j) => !urls[j.id]).map((j) => j.id);
if (retry.length) Object.assign(urls, await render(retry, 1));

let saved = 0;
for (const j of jobs) {
  const url = urls[j.id];
  if (!url) {
    console.warn(`  ✗ ${j.dir}/${j.file}: Figma could not render it (too large?)`);
    continue;
  }
  const res = await fetch(url);
  await mkdir(j.dir, { recursive: true });
  await writeFile(path.join(j.dir, j.file), Buffer.from(await res.arrayBuffer()));
  console.log(`  ✓ ${j.dir}/${j.file}${retry.includes(j.id) ? " (1×)" : ""}`);
  saved++;
}
console.log(`figma-export: ${saved}/${jobs.length} frames saved. Run "npm run images" if you didn't use npm run figma:export.`);
