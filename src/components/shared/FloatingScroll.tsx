"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import clsx from "clsx";

const INSET = 10; // gap between the thumb's travel and the container's top/bottom edge
const MIN_THUMB = 40;

/**
 * Scroll area with a minimal floating scrollbar: no track, no arrows — just a dark-grey pill
 * that sits over the content (so full-bleed images reach the edge). Draggable; hidden when
 * there's nothing to scroll. The native scrollbar is hidden but wheel/touch/keyboard scrolling work.
 */
export default function FloatingScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0 });
  const drag = useRef<{ y: number; scroll: number } | null>(null);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) return setThumb({ top: 0, height: 0 });
    const track = clientHeight - INSET * 2;
    const height = Math.max(MIN_THUMB, (track * clientHeight) / scrollHeight);
    const top = INSET + ((track - height) * scrollTop) / (scrollHeight - clientHeight);
    setThumb({ top, height });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    // Content grows as images load, so re-measure whenever anything inside resizes.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [update]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, scroll: ref.current.scrollTop };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current) return;
    const track = el.clientHeight - INSET * 2 - thumb.height;
    const ratio = (el.scrollHeight - el.clientHeight) / Math.max(track, 1);
    el.scrollTop = drag.current.scroll + (e.clientY - drag.current.y) * ratio;
  };
  const onPointerUp = () => (drag.current = null);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={ref} onScroll={update} className={clsx("no-scrollbar min-h-0 flex-1 overflow-y-auto", className)}>
        {children}
      </div>
      {thumb.height > 0 && (
        // 16px-wide hit area; the visible pill is 6px.
        <div
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="group absolute right-1 z-30 flex w-4 cursor-grab justify-center active:cursor-grabbing"
          style={{ top: thumb.top, height: thumb.height }}
        >
          <div className="h-full w-1.5 rounded-full bg-zinc-700/55 transition-colors duration-150 group-hover:bg-zinc-700/80" />
        </div>
      )}
    </div>
  );
}
