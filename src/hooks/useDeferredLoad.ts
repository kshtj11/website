"use client";

import { useEffect, useState, type RefObject } from "react";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * How early to start loading a heavy section, based on the visitor's connection:
 *   fast (4g / unknown)   start ~600px before it scrolls into view
 *   3g                    start ~1600px early, so slow downloads finish in time
 *   2g / data saver       never automatically — wait for a tap ("Load photos")
 */
function profile(): { margin: string; manual: boolean } {
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? "")) return { margin: "0px", manual: true };
  if (c?.effectiveType === "3g") return { margin: "1600px", manual: false };
  return { margin: "600px", manual: false };
}

/**
 * Keeps a section's images unloaded until the visitor scrolls near it.
 * Returns `ready` (load images now), `needsTap` (slow / data-saver connection: show a button) and `load()`.
 */
export function useDeferredLoad(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [ready, setReady] = useState(!enabled);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    if (!enabled || ready || !ref.current) return;
    const { margin, manual } = profile();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        if (manual) setNeedsTap(true);
        else setReady(true);
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, ready, ref]);

  return { ready, needsTap: needsTap && !ready, load: () => setReady(true) };
}
