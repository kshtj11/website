"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import QuadtreeLoader, { quadtreeFor } from "./QuadtreeLoader";

type MediaFrameProps = {
  src?: string;
  /** mp4/webm clip; plays muted + looped once scrolled near, cover image shows until it's ready */
  videoSrc?: string;
  alt?: string;
  /** CSS aspect-ratio, e.g. "16/9". Card default matches the reference's 678 × 367.6 frame. */
  aspect?: string;
  rounded?: string;
  className?: string;
  /** Text shown inside the placeholder when there's no src yet */
  placeholderLabel?: string;
  eager?: boolean;
  /** Loading placeholder: grey shimmer (default) or the image's colour quadtree (Play grid) */
  loader?: "shimmer" | "quadtree";
  /** Quadtree loader only: image whose quadtree to show while there's no src yet (deferred sections) */
  qtSrc?: string;
};

export const CARD_ASPECT = "678/367.625";

/**
 * Fixed-aspect media box: shimmer (or, with loader="quadtree", the image's colour quadtree) while
 * loading, then image/video crossfade. Cached images skip the quadtree animation.
 * Without a src it stays a labelled placeholder, which keeps layouts honest while drafting.
 */
export default function MediaFrame({
  src,
  videoSrc,
  alt = "",
  aspect = CARD_ASPECT,
  rounded = "rounded-[26px]",
  className,
  placeholderLabel,
  eager = false,
  loader = "shimmer",
  qtSrc,
}: MediaFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [cached, setCached] = useState(false);
  const qtKey = loader === "quadtree" ? quadtreeFor(src ?? qtSrc) : undefined;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
      setCached(true);
    }
  }, [src]);

  useEffect(() => {
    if (!videoSrc || !boxRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [videoSrc]);

  const hasMedia = Boolean(src || videoSrc);
  const ready = src ? imgLoaded : videoLoaded;

  return (
    <div
      ref={boxRef}
      className={clsx(
        "relative isolate w-full shrink-0 overflow-hidden",
        // Grey only while empty/loading, so stacked slices never show hairline seams once loaded.
        !(hasMedia && ready) && "bg-[var(--placeholder)]",
        rounded,
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={clsx(
            "absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out",
            videoLoaded ? "opacity-0" : "opacity-100",
          )}
        />
      )}
      {videoSrc && nearViewport && (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      {qtKey && !cached ? (
        <QuadtreeLoader
          qtKey={qtKey}
          active={hasMedia}
          loaded={hasMedia && ready}
        />
      ) : (
        /* Shimmer covers progressive decode, then fades away */
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 z-20 animate-shimmer transition-opacity duration-500 ease-out",
            hasMedia && ready ? "opacity-0" : "opacity-100",
          )}
        />
      )}
      {!hasMedia && placeholderLabel && (
        <p className="absolute inset-0 z-30 flex items-center justify-center t-caption text-zinc-400">
          {placeholderLabel}
        </p>
      )}
    </div>
  );
}
