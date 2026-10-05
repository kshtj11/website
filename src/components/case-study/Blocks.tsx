import clsx from "clsx";
import type { Block, Media } from "@/content/types";
import MediaFrame from "../shared/MediaFrame";
import { ScrollReveal } from "../shared/ScrollReveal";

/*
 * Reading rhythm (from the reference):
 *   column     max-w-[800px], centered, px-8 inside
 *   blocks     py-10 for media, py-16 for chapter titles
 *   headings   t-block (Heading/Block, 24px SemiBold), zinc-900
 *   body       text-base, zinc-600, paragraphs 24px apart, max ~480px measure
 */

const IMAGE_WIDTH = {
  small: "max-w-[400px]",
  medium: "max-w-[600px]",
  large: "max-w-[800px]",
  full: "max-w-none",
  wide: "max-w-none",
} as const;

/** Breaks out of the 800px reading column to 1100px (never wider than the window minus 24px gutters). */
const WIDE = "relative left-1/2 w-[min(1100px,calc(100vw-48px))] -translate-x-1/2";

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-3 text-center text-sm leading-normal text-[var(--ink-subtle)]">{text}</p>;
}

function Figure({ media, aspect, className }: { media: Media; aspect?: string; className?: string }) {
  return (
    <figure className={clsx("w-full", className)}>
      <MediaFrame
        src={media.src}
        alt={media.alt}
        // Real pixel size wins, so documentation images keep their own ratio.
        aspect={media.width && media.height ? `${media.width}/${media.height}` : aspect ?? "16/10"}
        placeholderLabel={media.src ? undefined : media.caption ?? "image"}
      />
      <Caption text={media.src ? media.caption : undefined} />
    </figure>
  );
}

function Paragraphs({ body }: { body: string[] }) {
  return (
    <div className="flex flex-col gap-6 text-base leading-relaxed tracking-[0.005em] text-[var(--ink-body)]">
      {body.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "sectionTitle":
      return (
        <ScrollReveal variant="fade" className="flex w-full flex-col gap-3 px-8 py-16">
          {block.number && <p className="t-label text-[var(--ink-subtle)]">{block.number}</p>}
          <h2 className="t-title text-[var(--ink-strong)] max-md:text-3xl">{block.title}</h2>
          {block.subtitle && <p className="max-w-[480px] text-lg leading-normal text-[var(--ink-muted)]">{block.subtitle}</p>}
        </ScrollReveal>
      );

    case "text":
      return (
        <ScrollReveal
          variant="fade"
          className={clsx(
            "w-full px-8 py-10",
            block.heading && "grid grid-cols-[1fr_2fr] gap-10 max-md:flex max-md:flex-col max-md:gap-4",
          )}
        >
          {block.heading && <h3 className="t-block text-[var(--ink-strong)]">{block.heading}</h3>}
          <div className="max-w-[480px]">
            <Paragraphs body={block.body} />
          </div>
        </ScrollReveal>
      );

    case "image":
      return (
        <ScrollReveal className={clsx("flex flex-col items-center py-10", block.size === "wide" ? WIDE : "w-full px-8")}>
          <Figure media={block} aspect={block.aspect} className={IMAGE_WIDTH[block.size ?? "large"]} />
        </ScrollReveal>
      );

    case "gallery": {
      const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[block.columns ?? 3];
      return (
        <div className={clsx("grid grid-cols-2 gap-4 py-10", cols, block.wide ? WIDE : "w-full px-8")}>
          {block.images.map((m, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <Figure media={m} aspect={block.aspect ?? "1/1"} />
            </ScrollReveal>
          ))}
        </div>
      );
    }

    case "twoColumn":
      return (
        <ScrollReveal
          className={clsx(
            "flex w-full items-center gap-14 px-8 py-10 max-md:flex-col max-md:items-start max-md:gap-8",
            block.imageSide === "left" && "md:flex-row-reverse",
          )}
        >
          <div className="flex flex-1 flex-col gap-4">
            {block.heading && <h3 className="t-block text-[var(--ink-strong)]">{block.heading}</h3>}
            <Paragraphs body={block.body} />
          </div>
          <Figure media={block.image} aspect="4/5" className="flex-1" />
        </ScrollReveal>
      );

    case "quote":
      return (
        <ScrollReveal variant="fade" className="w-full px-8 py-10">
          <blockquote className="flex flex-col gap-4 rounded-3xl bg-zinc-50 px-10 py-10 max-md:px-6">
            <p className="t-block text-[var(--ink-strong)]">&ldquo;{block.quote}&rdquo;</p>
            {(block.author || block.role) && (
              <footer className="text-base text-[var(--ink-subtle)]">
                {block.author}
                {block.role && <span>, {block.role}</span>}
              </footer>
            )}
          </blockquote>
        </ScrollReveal>
      );

    case "video":
      return (
        <ScrollReveal className="w-full px-8 py-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-[26px] bg-[var(--placeholder)]">
            {block.youtubeId ? (
              <iframe
                className="absolute inset-0 size-full"
                src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}?rel=0`}
                title={block.caption ?? "Video"}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : block.src ? (
              <video className="absolute inset-0 size-full object-cover" src={block.src} autoPlay muted loop playsInline />
            ) : (
              <div className="absolute inset-0 animate-shimmer" />
            )}
          </div>
          <Caption text={block.caption} />
        </ScrollReveal>
      );

    case "embed":
      return (
        <ScrollReveal className="w-full px-8 py-10">
          <iframe
            src={block.url}
            title={block.caption ?? "Embedded project"}
            className="w-full rounded-[26px] border border-zinc-100"
            style={{ height: block.height ?? 560 }}
            loading="lazy"
          />
          <Caption text={block.caption} />
        </ScrollReveal>
      );

    case "learnings":
      return (
        <div className="flex w-full flex-col gap-6 px-8 py-10">
          {block.title && (
            <ScrollReveal variant="fade">
              <h3 className="t-block text-[var(--ink-strong)]">{block.title}</h3>
            </ScrollReveal>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {block.items.map((item, i) => (
              <ScrollReveal key={i} delay={i * 80} className="flex flex-col gap-3 rounded-3xl bg-zinc-50 px-6 py-6">
                <p className="text-base font-medium text-[var(--ink)]">{item.title}</p>
                <p className="text-base leading-relaxed text-[var(--ink-body)]">{item.body}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="w-full px-8 py-8">
          <div className="horizontal-line" />
        </div>
      );
  }
}

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}
