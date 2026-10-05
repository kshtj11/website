import Link from "next/link";
import type { PlayPiece, PlaySection } from "@/content/play";
import MediaFrame from "../shared/MediaFrame";
import { ScrollReveal } from "../shared/ScrollReveal";
import { ArrowUpRight } from "../shared/icons";

function SectionHeader({ section }: { section: PlaySection }) {
  const action = section.action && (
    <Link
      href={section.action.href}
      className="inline-flex shrink-0 items-center gap-1 pr-2.5 text-base text-zinc-500 transition-colors hover:text-blue-400"
    >
      {section.action.label}
      <ArrowUpRight />
    </Link>
  );

  if (section.header === "ruled") {
    // Label + full-width hairline (reference: Sketchbook / Murals)
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center gap-3">
          <p className="flex-1 text-base leading-normal tracking-wide text-zinc-400">{section.label}</p>
          {action}
        </div>
        <div className="horizontal-line" />
      </div>
    );
  }

  // Inset label, no rule (reference: Painting)
  return (
    <div className="flex w-full items-center gap-3">
      <p className="ml-2 flex-1 text-base leading-normal tracking-wide text-zinc-400">{section.label}</p>
      {action}
    </div>
  );
}

function PieceCard({ piece, onOpen }: { piece: PlayPiece; onOpen: (p: PlayPiece) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(piece)}
      className="group flex w-full cursor-pointer flex-col items-start gap-2 text-left"
    >
      <div className="w-full transition-transform duration-300 group-hover:scale-[0.99]">
        <MediaFrame
          src={piece.src}
          alt={piece.title}
          aspect={String(piece.aspect ?? 0.8)}
          rounded="rounded-2xl"
          placeholderLabel={piece.src ? undefined : `${piece.aspect ?? 0.8} ratio`}
        />
      </div>
      <p className="px-2 text-sm leading-snug">
        <span className="text-zinc-600">{piece.title}</span>
        {piece.meta && <span className="ml-1.5 text-zinc-400">{piece.meta}</span>}
      </p>
    </button>
  );
}

/**
 * One section: header row, 12px gap, then the gallery.
 * Gallery: 2-column grid below lg, 3-column CSS masonry (columns-3) at lg+, 16px gutters.
 */
export default function PlaySectionView({
  section,
  onOpen,
}: {
  section: PlaySection;
  onOpen: (p: PlayPiece) => void;
}) {
  return (
    <section id={section.id} data-play-section className="flex w-full scroll-mt-8 flex-col items-start gap-3">
      <ScrollReveal variant="fade" className="w-full">
        <SectionHeader section={section} />
      </ScrollReveal>
      <div className="grid w-full grid-cols-2 items-start gap-4 lg:block lg:columns-3">
        {section.pieces.map((piece, i) => (
          <ScrollReveal key={i} className="break-inside-avoid lg:mb-4">
            <PieceCard piece={piece} onOpen={onOpen} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
