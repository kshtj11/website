import type { Block, Project, SizedImage } from "./types";
import { mediaBySlug, pic } from "./media";

/**
 * ALL PROJECTS LIVE HERE.
 *  - Order in this array = order on the grid.
 *  - The first 4 items of each section get the "featured" card (title pill on the image).
 *  - Put images in /public/projects/<slug>/ and reference them as "/projects/<slug>/cover.jpg".
 *
 * Every description/metadata value below is a PLACEHOLDER; replace it with your own copy.
 */

/** Default case-study skeleton so every page shows the full layout until you write it. */
function caseStudySkeleton(): Block[] {
  return [
    { type: "text", heading: "Overview", body: ["What the project is, who it was for, and the one-sentence outcome."] },
    { type: "image", size: "full", caption: "Hero shot / key screen" },
    { type: "sectionTitle", number: "01", title: "The problem", subtitle: "Context, constraints and why it mattered." },
    { type: "text", heading: "Research", body: ["Methods, what you learned, and the insight that changed direction."] },
    { type: "gallery", columns: 3, images: [{ caption: "Artifact" }, { caption: "Artifact" }, { caption: "Artifact" }] },
    { type: "sectionTitle", number: "02", title: "The solution" },
    {
      type: "twoColumn",
      heading: "Key interaction",
      body: ["Explain the decision, the alternatives you explored, and why this one won."],
      image: { caption: "Detail" },
    },
    { type: "quote", quote: "A line of feedback from a user, mentor or teammate.", author: "Name", role: "Role" },
    {
      type: "learnings",
      title: "Learnings",
      items: [
        { title: "Takeaway one", body: "One or two sentences." },
        { title: "Takeaway two", body: "One or two sentences." },
        { title: "Takeaway three", body: "One or two sentences." },
      ],
    },
  ];
}

const projectList: Project[] = [
  // ───────────────────────────── WORK ─────────────────────────────
  {
    slug: "mecha",
    section: "work",
    title: "Mecha",
    tag: "Internship",
    year: "2025",
    description: "Placeholder: one line on what you designed during the internship.",
    metadata: [
      { label: "Timeline", value: ["Placeholder"] },
      { label: "Role", value: ["Design Intern"] },
      { label: "Team", value: ["Placeholder"] },
      { label: "Tools", value: ["Figma"] },
    ],
    blocks: caseStudySkeleton(),
  },
  {
    slug: "p1-ai-literature-review",
    section: "work",
    title: "AI Literature Review Tool",
    tag: "P1",
    year: "2025",
    description: "Placeholder: an AI-assisted tool for reading and synthesising research papers.",
    metadata: [
      { label: "Timeline", value: ["Placeholder"] },
      { label: "Role", value: ["Placeholder"] },
      { label: "Course", value: ["P1, IDC"] },
      { label: "Tools", value: ["Figma"] },
    ],
    blocks: caseStudySkeleton(),
  },
  {
    slug: "ek-time",
    section: "work",
    title: "Ek-Time",
    year: "2024",
    description: "Placeholder: one-line summary.",
    links: [{ label: "View on Behance", href: "https://www.behance.net/" }], // PLACEHOLDER URL
    metadata: [
      { label: "Timeline", value: ["Placeholder"] },
      { label: "Role", value: ["Placeholder"] },
    ],
    blocks: caseStudySkeleton(),
  },
  {
    slug: "lenskart",
    section: "work",
    title: "Lenskart",
    year: "2024",
    description: "Placeholder: one-line summary.",
    links: [{ label: "View on Behance", href: "https://www.behance.net/" }], // PLACEHOLDER URL
    metadata: [
      { label: "Timeline", value: ["Placeholder"] },
      { label: "Role", value: ["Placeholder"] },
    ],
    blocks: caseStudySkeleton(),
  },
  {
    slug: "old-man-and-the-sea",
    section: "work",
    title: "The Old Man and the Sea",
    chip: { label: "Click to play", href: "https://kshtj11.github.io/old-man/" },
    year: "2024",
    description: "Placeholder: one-line summary.",
    links: [{ label: "View on Behance", href: "https://www.behance.net/" }], // PLACEHOLDER URL
    metadata: [
      { label: "Timeline", value: ["Placeholder"] },
      { label: "Role", value: ["Placeholder"] },
    ],
    blocks: caseStudySkeleton(),
  },

  // ───────────────────────────── PLAY ─────────────────────────────
  // These back the "Case study" links on the Play page (/play/<slug>/).
  // The Play page itself (sidebar + galleries) is laid out in src/content/play.ts.
  {
    slug: "tiles-mosaic-tool",
    section: "play",
    title: "Tiles Mosaic Tool",
    year: "2026",
    description: "A type + image mosaic tool that maps real glazed tiles onto anything, with quadtree or grid tiling.",
    chip: { label: "Click to play", href: "https://kshtj11.github.io/tiles-mosiac/" },
    links: [{ label: "View on GitHub", href: "https://github.com/kshtj11/tiles-mosiac" }],
    cover: pic("glazed-tiles", "Frame 28.png").src,
    metadata: [
      { label: "Type", value: ["Side project", "Web tool"] },
      { label: "Started from", value: ["Glazing course, Sem 4", "IDC School of Design"] },
      { label: "Built with", value: ["React 19 + Vite", "HTML5 Canvas"] },
      { label: "Thanks", value: ["Akash & Karthikay", "for the documentation"] },
    ],
    caseStudyImages: "blocks",
    blocks: [
      {
        type: "text",
        heading: "Where it started",
        body: [
          "I started out wanting to make a typeface from the glazed tiles we made in semester 4, in an epic glazing course at IDC. (Thank you Akash and Karthikay for the documentation.)",
          "Getting annoyed with OTF files, I vibe-coded a tool to map the tiles by colour and gradient instead… and then kept adding everything I was imagining. It became a much bigger thing than I had planned.",
        ],
      },
      { type: "image", size: "wide", ...pic("glazed-tiles", "glaze-type-hi", "The word hi built from glazed tiles, animating in"), caption: "Type mode: tiles fill the letterforms, and the whole thing animates." },
      {
        type: "gallery",
        columns: 3,
        wide: true,
        images: [
          { ...pic("glazed-tiles", "Frame 28.png", "I love glazing, set in script on a tiled panel"), caption: "“I love glazing”" },
          { ...pic("glazed-tiles", "Frame 33.png", "The word honk in bold tiles with a drop shadow"), caption: "honk, with a shadow" },
          { ...pic("glazed-tiles", "Frame 37.png", "The word serif in fine tiles"), caption: "serif, in small tiles" },
        ],
      },
      { type: "sectionTitle", number: "01", title: "Glaze types & mosaics", subtitle: "Images, gradients, animation, borders and what not." },
      {
        type: "text",
        heading: "How it maps",
        body: [
          "Every region of the input is matched to the closest real tile, either directly by colour or along a gradient line drawn across the 8 × 8 palette of glazes. A Bézier curve reshapes brightness before matching, and vibrant tiles can be pinned to exact spots on the gradient.",
          "Grid mode lays tiles out evenly. QuadTree mode splits the image by detail: small tiles where things are busy, big tiles where they’re flat, and it can scale them along a direction too.",
        ],
      },
      { type: "image", size: "wide", ...pic("glazed-tiles", "image 29.png", "An S.T.D. P.C.O. I.S.D. phone booth sign as a tile mosaic"), caption: "Image mode with QuadTree: detail where it matters, big tiles where it’s flat." },
      {
        type: "gallery",
        columns: 2,
        wide: true,
        images: [
          { ...pic("glazed-tiles", "image 66.png", "Devanagari lettering as a tile mosaic"), caption: "Devanagari lettering, tiled" },
          { ...pic("glazed-tiles", "image 70.png", "Devanagari letterform as a tile mosaic with a tiled border"), caption: "With a tiled border" },
        ],
      },
      {
        type: "gallery",
        columns: 2,
        wide: true,
        images: [
          { ...pic("glazed-tiles", "image 67.png", "Two figures in a framed scene rebuilt in glazed tiles"), caption: "A framed scene, rebuilt in glaze" },
          { ...pic("glazed-tiles", "Frame 39.png", "A painting re-tiled in warm glazes"), caption: "A painting, re-tiled" },
        ],
      },
      { type: "sectionTitle", number: "02", title: "Update: GIFs", subtitle: "tiles-mosiac now processes GIFs." },
      {
        type: "text",
        heading: "Frame by frame",
        body: [
          "Upload an animated GIF and every frame runs through the same mosaic pipeline, then exports as a new animated GIF. Wave, looping-gradient and resolution-zoom animations can be exported too.",
        ],
      },
      { type: "image", size: "wide", ...pic("glazed-tiles", "namaste.gif", "नमस्ते being built up from glazed tiles"), caption: "नमस्ते, frame by frame" },
      // Video (Sequence 01_1.mp4, 110 MB) is skipped for now; when compressed, add:
      // { type: "video", src: "/projects/glazed-tiles/pigeon.mp4", caption: "pigeon terrorizes 2 others, 2026 — live from Vadodara" },
      {
        type: "text",
        heading: "Play with it",
        body: [
          "It’s live at kshtj11.github.io/tiles-mosiac if you want to play. The UX is rough for now (I kept iterating as I wanted more features); I’ll make it more user-friendly later :>",
        ],
      },
    ],
  },
  {
    slug: "fractal-visualizer",
    section: "play",
    title: "Fractal Visualizer",
    year: "2025",
    description: "Placeholder: an interactive fractal explorer.",
    // When it's deployed, add an embed block so it runs inline:
    // { type: "embed", url: "https://…", height: 560 }
    blocks: caseStudySkeleton(),
  },
  // Photography and Fun don't need case studies; they live only in src/content/play.ts.
];


/** Projects with cover + popup images filled in from the image pipeline (hand-set values win). */
export const projects: Project[] = projectList.map((p) => {
  const m = mediaBySlug[p.slug];
  if (!m) return p;
  return {
    ...p,
    cover: p.cover ?? m.cover?.src,
    images: p.images ?? m.images.map((img, i) => ({ ...img, alt: `${p.title}, image ${i + 1}` })),
  };
});

export function projectsIn(section: Project["section"]) {
  return projects.filter((p) => p.section === section && !p.hidden);
}

export function getProject(section: Project["section"], slug: string) {
  return projects.find((p) => p.section === section && p.slug === slug);
}

export function projectHref(p: Pick<Project, "section" | "slug">) {
  return `/${p.section}/${p.slug}/`;
}
