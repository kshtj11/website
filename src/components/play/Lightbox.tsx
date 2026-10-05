"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { PlayPiece } from "@/content/play";
import { CloseIcon } from "../shared/icons";

const EXIT_MS = 200;

/**
 * Full-view of one piece. Frosted zinc-100/95 backdrop, image ≤ 75vh with radius 16 + elevated shadow,
 * caption underneath. Click outside / Esc / × closes. Enter: fade 200ms + scale 0.95 → 1 (280ms).
 */
export default function Lightbox({ piece, onClose }: { piece: PlayPiece | null; onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!piece) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  if (!piece?.src) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
      onClick={close}
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 sm:p-6",
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
      <figure
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "relative z-10 flex max-w-[min(96vw,1100px)] flex-col items-center gap-3",
          closing ? "scale-95 transition-transform duration-200" : "animate-[scaleIn_280ms_cubic-bezier(0.16,1,0.3,1)]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={piece.fullSrc ?? piece.src}
          alt={piece.title}
          className="max-h-[min(75vh,820px)] w-auto max-w-full rounded-2xl object-contain shadow-elevated"
        />
        <figcaption className="text-sm">
          <span className="text-zinc-600">{piece.title}</span>
          {piece.meta && <span className="ml-1.5 text-zinc-400">{piece.meta}</span>}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
