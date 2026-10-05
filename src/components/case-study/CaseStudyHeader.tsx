"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import Logo from "../shared/Logo";

/**
 * Sticky top bar on case-study pages: logo + "Work / Project" breadcrumb.
 * Shrinks (44px → 28px logo, py-8 → py-4) once you scroll past 24px.
 */
export default function CaseStudyHeader({
  sectionLabel,
  sectionHref,
  title,
}: {
  sectionLabel: string;
  sectionHref: string;
  title: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={clsx(
        "z-30 flex w-full shrink-0 items-center gap-1.5 px-16 transition-all duration-300 ease-out max-md:px-6 md:sticky md:top-0",
        scrolled ? "py-4" : "py-8",
      )}
    >
      <Link href="/" aria-label="Home" className="transition-opacity hover:opacity-80">
        <Logo className={clsx("text-[24px] transition-all duration-300 ease-out", scrolled ? "size-7" : "size-8 md:size-11")} />
      </Link>
      <nav
        aria-label="Breadcrumb"
        className={clsx(
          "ml-2 flex items-center gap-1.5 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-base shadow-glass backdrop-blur-md transition-opacity duration-300",
        )}
      >
        <Link href={sectionHref} className="text-[var(--ink-subtle)] transition-colors hover:text-[var(--ink-body)]">
          {sectionLabel}
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-[var(--ink-body)]">{title}</span>
      </nav>
    </div>
  );
}
