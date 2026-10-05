/**
 * Content model for projects and case studies.
 * Media `src` paths are relative to /public, e.g. "/projects/mecha/cover.jpg".
 * Leave `src` out and a shimmer placeholder renders at the right size instead.
 */

export type Media = {
  src?: string;
  alt?: string;
  caption?: string;
  /** Pixel size (from pic()); when set, the box uses the image's own ratio */
  width?: number;
  height?: number;
};

/** An image whose pixel size is known, so its box can be reserved before it loads. */
export type SizedImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  /** Small animated copy for grid thumbnails (made by the pipeline for GIFs) */
  card?: string;
};

/** Building blocks for a case study page, rendered top to bottom. */
export type Block =
  /** Big numbered chapter title, e.g. "01 — Research" */
  | { type: "sectionTitle"; number?: string; title: string; subtitle?: string }
  /** Heading on the left, paragraphs on the right (stacks on mobile) */
  | { type: "text"; heading?: string; body: string[] }
  /** One image. size: small 400px · medium 600px · large 800px · full = edge of the 800px column ·
   *  wide = breaks out of the column to 1100px (documentation shots) */
  | ({ type: "image"; size?: "small" | "medium" | "large" | "full" | "wide"; aspect?: string } & Media)
  /** Grid of images, 2–4 columns on desktop, 2 on mobile. wide = 1100px instead of the 800px column */
  | { type: "gallery"; columns?: 2 | 3 | 4; images: Media[]; aspect?: string; wide?: boolean }
  /** Copy beside an image */
  | { type: "twoColumn"; heading?: string; body: string[]; image: Media; imageSide?: "left" | "right" }
  /** Pull quote / testimonial */
  | { type: "quote"; quote: string; author?: string; role?: string }
  /** Video file in /public, or a YouTube id */
  | { type: "video"; src?: string; youtubeId?: string; caption?: string }
  /** Live iframe embed, for interactive work (visualizers, prototypes) */
  | { type: "embed"; url: string; height?: number; caption?: string }
  /** Key takeaways as cards */
  | { type: "learnings"; title?: string; items: { title: string; body: string }[] }
  | { type: "divider" };

export type ProjectSection = "work" | "play";

export type Project = {
  /** URL id: /work/<slug>/ or /play/<slug>/ */
  slug: string;
  section: ProjectSection;
  title: string;
  year: string;
  /** One line under the card and in the preview popup */
  description: string;
  /** Small label after the title, e.g. "Internship" */
  tag?: string;
  /** Chips on the Work card: what the project is about (UI/UX, Research, Game design…) */
  tags?: string[];
  /** Card + hero image (16:9-ish, ~1920px wide) */
  cover?: string;
  /** Optional muted looping clip that replaces the cover on cards (mp4) */
  coverVideo?: string;
  /** Square logo/icon shown above the case-study title (160×160) */
  logo?: string;
  /** Pink pill next to the title (popup + case-study hero), e.g. "Click to play" → a live build */
  chip?: { label: string; href: string };
  /** Buttons in the popup + case-study hero (Behance, live site, repo…) */
  links?: { label: string; href: string }[];
  /** Hero facts row: Timeline, Role, Team, Tools… */
  metadata?: { label: string; value: string[] }[];
  /** Images shown stacked in the preview popup after the facts row. Filled automatically
   *  from media-src/projects/<slug>/ by `npm run images`; set by hand only to override. */
  images?: SizedImage[];
  /** "stack" (default) shows images as a seamless Behance-style stack under the case-study hero;
   *  "blocks" skips it because the case study places images itself via blocks. */
  caseStudyImages?: "stack" | "blocks";
  /** Case study body. Empty/omitted = popup only shows the summary. */
  blocks?: Block[];
  /** "draft" = visible locally only, never built for the live site (default "published") */
  status?: import("./status").Status;
  /** Hide everywhere, even locally, without deleting */
  hidden?: boolean;
};
