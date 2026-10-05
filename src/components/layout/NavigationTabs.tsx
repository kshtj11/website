"use client";

import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent, type TransitionEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { navTabs, type NavTabId } from "@/content/site";

/**
 * Work / Play / About pills with a frosted "glass" indicator.
 * On click the indicator glides to the new tab first (300ms), *then* the route changes,
 * so the motion reads as cause → effect. Modifier-clicks and reduced motion skip the glide.
 */
export default function NavigationTabs({ activeTab }: { activeTab: NavTabId }) {
  const router = useRouter();
  const [displayed, setDisplayed] = useState<NavTabId>(activeTab);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<NavTabId, HTMLAnchorElement | null>>>({});
  const pendingHref = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    pendingHref.current = null;
    setDisplayed(activeTab);
  }, [activeTab]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const tab = tabRefs.current[displayed];
    if (!container || !tab) return;
    const c = container.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    setBox({ left: t.left - c.left, top: t.top - c.top, width: t.width, height: t.height });
    if (!ready) requestAnimationFrame(() => setReady(true));
  }, [displayed, ready]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: NavTabId, href: string) => {
    if (id === displayed) {
      e.preventDefault();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    pendingHref.current = href;
    setDisplayed(id);
    // transitionend can be skipped (throttled/background tab), so never strand the click.
    setTimeout(go, 450);
  };

  const go = () => {
    const href = pendingHref.current;
    if (!href) return;
    pendingHref.current = null;
    router.push(href, { scroll: false });
  };

  const onIndicatorEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    go();
  };

  return (
    <nav className="relative flex w-full shrink-0 flex-col items-center pb-4 max-md:pb-2">
      <div className="w-full px-16 pt-4 max-md:px-6">
        <div ref={containerRef} className="relative flex items-start gap-1">
          <div
            aria-hidden="true"
            onTransitionEnd={onIndicatorEnd}
            className={clsx(
              "pointer-events-none absolute left-0 top-0 z-0 rounded-full border border-white/50 bg-zinc-200/60 shadow-glass md:backdrop-blur-md",
              ready && "transition-[transform,width] duration-300 ease-out motion-reduce:transition-none",
            )}
            style={{
              opacity: ready ? 1 : 0,
              transform: `translate3d(${box.left}px, ${box.top}px, 0)`,
              width: box.width,
              height: box.height,
            }}
          />
          {navTabs.map((tab) => {
            const active = displayed === tab.id;
            return (
              <Link
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                href={tab.href}
                scroll={false}
                aria-current={activeTab === tab.id ? "page" : undefined}
                onClick={(e) => onClick(e, tab.id, tab.href)}
                className="group relative z-10 flex shrink-0 items-center justify-center rounded-full border border-transparent px-3.5 pb-[4px] pt-[5px]"
              >
                {/* Static pill so the active tab is styled before JS measures the indicator */}
                {active && !ready && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full border border-white/50 bg-zinc-200/60 shadow-glass"
                  />
                )}
                <span
                  className={clsx(
                    "text-lg font-medium leading-normal tracking-[0.005em] transition-colors duration-200 ease-out",
                    active ? "text-[var(--ink-body)]" : "text-[var(--ink-subtle)] group-hover:text-[var(--ink-body)]",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="w-full px-16 pt-3 max-md:px-6">
        <div className="horizontal-line" />
      </div>
    </nav>
  );
}
