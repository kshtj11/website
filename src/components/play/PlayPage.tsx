"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playGroups, playSections, type PlayPiece } from "@/content/play";
import Sidebar from "./Sidebar";
import PlaySectionView from "./PlaySectionView";
import Lightbox from "./Lightbox";

/** A section counts as "current" once its top passes this line (px from viewport top). */
const SPY_LINE = 250;

/**
 * Play tab body: 202px sticky sidebar + content column (gap-4 between), sections 48px apart.
 * Sidebar sticks below the sticky top bar (top-24); hidden below lg (1024px); the page is then one long scroll.
 */
export default function PlayPage() {
  const [activeId, setActiveId] = useState(playSections[0]?.id ?? "");
  const [openPiece, setOpenPiece] = useState<PlayPiece | null>(null);
  const clickLock = useRef<number | null>(null);

  // Scroll spy: the last section whose top is above the spy line wins.
  useEffect(() => {
    const onScroll = () => {
      if (clickLock.current !== null) return;
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-play-section]"));
      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= SPY_LINE) current = el.id;
      }
      // At the very bottom, the last section wins even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = els[els.length - 1]?.id ?? current;
      }
      if (current) setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    // Hold the highlight on the clicked item while the smooth scroll passes other sections.
    if (clickLock.current) window.clearTimeout(clickLock.current);
    clickLock.current = window.setTimeout(() => (clickLock.current = null), 800);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <div className="relative flex w-full shrink-0 flex-col items-start gap-4 px-16 pt-2 max-md:px-6 lg:flex-row">
      <aside className="z-30 hidden w-[202px] shrink-0 pb-8 lg:sticky lg:top-24 lg:block">
        <Sidebar groups={playGroups} activeId={activeId} onSelect={handleSelect} />
      </aside>

      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-12 pb-8">
        {playSections.map((section) => (
          <PlaySectionView key={section.id} section={section} onOpen={(p) => p.src && setOpenPiece(p)} />
        ))}
      </div>

      <Lightbox piece={openPiece} onClose={() => setOpenPiece(null)} />
    </div>
  );
}
