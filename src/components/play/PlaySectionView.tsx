"use client";

import { useRef } from "react";
import Link from "next/link";
import type { PlayPiece, PlaySection } from "@/content/play";
import { useDeferredLoad } from "@/hooks/useDeferredLoad";
import MediaFrame from "../shared/MediaFrame";
import { ScrollReveal } from "../shared/ScrollReveal";
import { ArrowUpRight } from "../shared/icons";

function SectionHeader({ section }: { section: PlaySection }) {
  const action = section.action && (
    <Link
      href={section.action.href}
      className="inline-flex shrink-0 items-center gap-1 pr-2.5 text-base text-zinc-500 transition-colors hover:text-[var(--brand-accent)]"
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
          <p className="flex-1 t-card text-zinc-400">{section.label}</p>
          {action}
        </div>
        <div className="horizontal-line" />
      </div>
    );
  }

  // Inset label, no rule (reference: Painting)
  return (
    <div className="flex w-full items-center gap-3">
      <p className="ml-2 flex-1 t-card text-zinc-400">{section.label}</p>
      {action}
    </div>
  );
}

function PieceCard({ piece, onOpen, loaded = true }: { piece: PlayPiece; onOpen: (p: PlayPiece) => void; loaded?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(piece)}
      className="group flex w-full cursor-pointer flex-col items-start gap-2 text-left"
    >
      <div className="w-full transition-transform duration-300 group-hover:scale-[0.99]">
        {/* Until a deferred section is ready, only the sized shimmer box renders (no download). */}
        <MediaFrame
          src={loaded ? piece.src : undefined}
          alt={piece.alt ?? piece.title}
          aspect={String(piece.aspect ?? 0.8)}
          rounded="rounded-2xl"
          placeholderLabel={piece.src ? undefined : `${piece.aspect ?? 0.8} ratio`}
        />
      </div>
      {(piece.title || piece.meta) && (
        <p className="px-2 text-sm leading-snug">
          <span className="text-zinc-600">{piece.title}</span>
          {piece.meta && <span className="ml-1.5 text-zinc-400">{piece.meta}</span>}
        </p>
      )}
    </button>
  );
}

/**
 * One section: header row, 12px gap, then the gallery (16px gutters).
 *   columns 3 (default): 2-column grid below lg, 3-column CSS masonry at lg+
 *   columns 2 (photos):  1 column below lg, 2-column masonry at lg+
 * deferred: images don't download until the visitor scrolls near (see useDeferredLoad).
 */
export default function PlaySectionView({
  section,
  onOpen,
}: {
  section: PlaySection;
  onOpen: (p: PlayPiece) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const { ready, needsTap, load } = useDeferredLoad(ref, !!section.deferred);
  const two = section.columns === 2;
  return (
    <section ref={ref} id={section.id} data-play-section className="flex w-full scroll-mt-24 flex-col items-start gap-3">
      <ScrollReveal variant="fade" className="w-full">
        <SectionHeader section={section} />
      </ScrollReveal>
      {needsTap && (
        <button type="button" onClick={load} className="button secondary md">
          Load {section.pieces.length} photos
        </button>
      )}
      <div
        className={
          two
            ? "grid w-full grid-cols-1 items-start gap-4 lg:block lg:columns-2"
            : "grid w-full grid-cols-2 items-start gap-4 lg:block lg:columns-3"
        }
      >
        {section.pieces.map((piece, i) => (
          <ScrollReveal key={i} className="break-inside-avoid lg:mb-4">
            <PieceCard piece={piece} onOpen={onOpen} loaded={ready} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
