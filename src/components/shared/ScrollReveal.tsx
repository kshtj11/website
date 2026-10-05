"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "slide" | "fast" | "fade";

const VARIANT_CLASS: Record<Variant, string> = {
  slide: "scroll-reveal", // 20px rise, 500ms — cards, images
  fast: "scroll-reveal-fast", // 12px rise, 650ms
  fade: "scroll-reveal-fade", // 12px rise, 300ms — text
};

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  /** ms before the transition starts. Ignored for elements already on screen at mount unless preserveDelay. */
  delay?: number;
  preserveDelay?: boolean;
  as?: "div" | "section" | "span" | "li";
};

/**
 * Rises + fades its children in the first time they enter the viewport.
 * Pure CSS transition driven by one IntersectionObserver; no animation library.
 */
export function ScrollReveal({
  children,
  className,
  variant = "slide",
  delay = 0,
  preserveDelay = false,
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed");
      return;
    }

    // Above-the-fold content animates together instead of waiting on staggered delays.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40 && delay > 0 && !preserveDelay) {
      el.style.transitionDelay = "0ms";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestAnimationFrame(() => el.classList.add("revealed"));
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "40px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, preserveDelay]);

  return createElement(
    as,
    {
      ref,
      className: clsx(VARIANT_CLASS[variant], className),
      style: delay > 0 ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
