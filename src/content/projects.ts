import type { Block, Project, SizedImage } from "./types";
import media from "./media.generated.json";

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
    slug: "ixt",
    section: "play",
    title: "IxT Project",
    year: "2025",
    description: "Placeholder: one-line summary.",
    blocks: caseStudySkeleton(),
  },
  {
    slug: "tiles-tool",
    section: "play",
    title: "Tiles Tool",
    year: "2025",
    description: "Placeholder: a pattern tool with strong visuals.",
    blocks: caseStudySkeleton(),
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

type MediaEntry = { cover: SizedImage | null; images: SizedImage[] };
const mediaBySlug = media as Record<string, MediaEntry>;

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
