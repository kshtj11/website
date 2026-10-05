"use client";

import { useEffect, useRef } from "react";

const CHARS = "!@#$%^&*()_+-;:,.<>?ADELPSTUadelpstu0123456789";

/** Decodes text through random glyphs when scrolled into view and on hover. */
export default function TextScramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const running = useRef(false);
  const textRef = useRef(text);
  textRef.current = text;

  const run = () => {
    const el = ref.current;
    if (!el || running.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running.current = true;

    const target = textRef.current;
    const queue = Array.from(target, (to) => {
      const start = Math.floor(Math.random() * 40);
      return { to, start, end: start + Math.floor(Math.random() * 40), char: "" };
    });

    let frame = 0;
    const update = () => {
      let done = 0;
      el.replaceChildren(
        ...queue.map((q) => {
          if (frame >= q.end) {
            done++;
            return document.createTextNode(q.to);
          }
          if (frame >= q.start) {
            if (!q.char || Math.random() < 0.28) q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const span = document.createElement("span");
            span.className = "text-zinc-300";
            span.textContent = q.char;
            return span;
          }
          return document.createTextNode(q.to);
        }),
      );
      if (done === queue.length) {
        running.current = false;
      } else {
        frame++;
        requestAnimationFrame(update);
      }
    };
    update();
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          setTimeout(run, 100);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render with fresh text when it changes (e.g. changelog date loads).
  useEffect(() => {
    if (ref.current && !running.current) ref.current.textContent = text;
  }, [text]);

  return (
    <p ref={ref} className={`${className ?? ""} cursor-pointer`} onMouseEnter={run}>
      {text}
    </p>
  );
}
