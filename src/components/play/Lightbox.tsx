"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { PlayPiece } from "@/content/play";
import { ChevronLeft, ChevronRight, CloseIcon } from "../shared/icons";

const EXIT_MS = 200;
const SWIPE_PX = 50;

/**
 * Full-view of one piece, with ‹ › to step through the rest of its section (wraps around).
 * Frosted zinc-100/95 backdrop, caption underneath. The image scales with the screen, not to a
 * fixed pixel size: as big as fits in 80% of the height (minus the caption) and the width left
 * between the arrows, so it fills a laptop and a 4K monitor alike. Radius 16 + elevated shadow.
 * Keys: ← → step, Esc closes. Touch: swipe left/right. Click outside / × closes.
 * Enter: fade 200ms + scale 0.95 → 1 (280ms); each step fades the new piece in (200ms).
 */
export default function Lightbox({
  pieces,
  index,
  onIndexChange,
  onClose,
}: {
  pieces: PlayPiece[];
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const touchX = useRef<number | null>(null);
  const piece = index === null ? null : pieces[index];
  const many = pieces.length > 1;

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, EXIT_MS);
  };
  const step = (d: number) => index !== null && many && onIndexChange((index + d + pieces.length) % pieces.length);

  useEffect(() => {
    if (!piece) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    // Warm up the neighbours so stepping feels instant.
    if (many && index !== null)
      for (const d of [1, -1]) {
        const n = pieces[(index + d + pieces.length) % pieces.length];
        const src = n.fullSrc ?? n.src;
        if (src) new Image().src = src;
      }
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  if (!piece?.src) return null;

  // Size the box from the piece's ratio so it grows with the screen (a plain <img> would stop
  // at the light grid copy's own pixel size). --lb-w = width left over beside the arrows.
  const hasCaption = Boolean(piece.title || piece.meta);
  const maxH = hasCaption ? "(80dvh - 32px)" : "80dvh";
  const box = piece.aspect
    ? { aspectRatio: String(piece.aspect), width: `min(var(--lb-w), calc(${maxH} * ${piece.aspect}))` }
    : undefined;

  const arrow =
    "fixed top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-100/70 text-zinc-500 backdrop-blur-sm transition-colors hover:bg-zinc-200 hover:text-zinc-700";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.alt ?? piece.title}
      onClick={close}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
      }}
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 [--lb-w:94vw] sm:p-6",
        many && "sm:[--lb-w:calc(100vw-144px)]",
        closing ? "opacity-0" : "animate-[fadeIn_200ms_ease-out]",
      )}
    >
      <div className="absolute inset-0 bg-zinc-100/95" />
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="fixed right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200"
      >
        <CloseIcon size="14px" />
      </button>
      {many && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => (e.stopPropagation(), step(-1))}
            className={clsx(arrow, "left-4")}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => (e.stopPropagation(), step(1))}
            className={clsx(arrow, "right-4")}
          >
            <ChevronRight />
          </button>
        </>
      )}
      <figure
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "relative z-10 flex max-w-[var(--lb-w)] flex-col items-center gap-3",
          closing ? "scale-95 transition-transform duration-200" : "animate-[scaleIn_280ms_cubic-bezier(0.16,1,0.3,1)]",
        )}
      >
        {/* The grid's light copy shows first and the full-quality file fades in on top once it
            arrives. Keyed by piece so each step fades in fresh. */}
        <div key={piece.src} className="relative animate-[fadeIn_200ms_ease-out]" style={box}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piece.src}
            alt={piece.alt ?? piece.title}
            className={clsx(
              "rounded-2xl object-contain shadow-elevated",
              box ? "size-full" : "max-h-[80dvh] w-auto max-w-full",
            )}
          />
          {piece.fullSrc && piece.fullSrc !== piece.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={piece.fullSrc}
              alt=""
              aria-hidden="true"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
              style={{ opacity: 0 }}
              className="absolute inset-0 size-full rounded-2xl object-contain transition-opacity duration-300"
            />
          )}
        </div>
        {hasCaption && (
          <figcaption className="text-sm">
            <span className="text-zinc-600">{piece.title}</span>
            {piece.meta && <span className="ml-1.5 text-zinc-400">{piece.meta}</span>}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body,
  );
}
