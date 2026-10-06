"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { createBlockEngine, MOTION, type BlockEngine } from "./blockEngine";

/**
 * A line of text that can build itself out of quadtree blocks (see blockEngine.ts for the engine and
 * the 🎞 Motion page in Figma for the spec). Self-contained: it measures only its own text, so it
 * works wherever it's placed. Inherits font, size and colour from its parent / className.
 *
 *   intro        on mount: `previous` slides off left → noise flies in → resolves into `text` in
 *                the brand gradient → breathes into ink, right → left
 *   interactive  click game: 1st click crumbles into noise, 2nd–6th shuffle, 7th resolves again
 *
 * Phases: idle · intro · noise (waiting for clicks) · resolve · ink (gradient → black)
 */
type Phase = "idle" | "intro" | "noise" | "resolve" | "ink";

export default function BlockTitle({
  text,
  intro = false,
  previous,
  interactive = false,
  className,
}: {
  text: string;
  /** Play the arrival sequence on mount (decide this before the first render) */
  intro?: boolean;
  /** What was here before; slides away during the intro */
  previous?: ReactNode;
  /** Enable the click game */
  interactive?: boolean;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>(intro ? "intro" : "idle");
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<BlockEngine | null>(null);
  const clicks = useRef(0);
  const blocks = phase === "intro" || phase === "noise" || phase === "resolve";

  useEffect(() => {
    const el = textRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    /** Noise lingers, then the quadtree resolves into the gradient text (times from `start`). */
    const sequence = (e: BlockEngine, start: number) => {
      MOTION.noiseFlickers.forEach((t) => at(start + t, e.noise));
      MOTION.resolve.forEach((t, i) => at(start + t, () => e.resolve(i + 1)));
      at(start + MOTION.textAt, () => setPhase("ink"));
    };

    if (phase === "ink")
      at(MOTION.inkDelay + MOTION.inkMs + 50, () => setPhase("idle"));
    else if (phase === "resolve" && engine.current) sequence(engine.current, 0);
    else if ((phase === "intro" || phase === "noise") && el && canvas)
      document.fonts.ready.then(() => {
        if (cancelled) return;
        engine.current?.dispose();
        const e = createBlockEngine(el, canvas, text);
        engine.current = e;
        if (phase === "noise") return e.dissolve(); // 1st click: crumble, then wait for clicks
        e.noise();
        canvas.animate(
          [
            { transform: `translateX(${MOTION.flyInPx}px)`, opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { transform: "translateX(0)", opacity: 1 },
          ],
          {
            duration: MOTION.flyInMs,
            delay: MOTION.noiseAt,
            fill: "backwards",
            easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          },
        );
        sequence(e, MOTION.noiseAt);
      });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase, text]);

  // Stop any pending block steps when leaving the page.
  useEffect(() => () => engine.current?.dispose(), []);

  const onClick = () => {
    if (phase === "intro" || phase === "resolve") return;
    if (phase !== "noise") {
      clicks.current = 1;
      setPhase("noise");
      return;
    }
    clicks.current += 1;
    if (clicks.current >= MOTION.clicksToResolve) {
      clicks.current = 0;
      setPhase("resolve");
    } else engine.current?.shuffle();
  };

  return (
    <span
      className={clsx(
        "relative inline-block",
        interactive && "cursor-pointer select-none",
        className,
      )}
      onClick={interactive ? onClick : undefined}
    >
      {/* Real text. While breathing it's two layers: gradient text underneath, ink text on top
          revealed by a soft-edged mask sweeping right → left (.ink-sweep in globals.css). */}
      <span
        ref={textRef}
        className={clsx(
          "relative inline-block",
          blocks && "opacity-0",
          phase === "ink" && "text-brand-gradient",
        )}
      >
        {text}
        {phase === "ink" && (
          <span
            aria-hidden="true"
            className="ink-sweep absolute inset-0 text-[var(--ink-strong)]"
            style={{
              animationDuration: `${MOTION.inkMs}ms`,
              animationDelay: `${MOTION.inkDelay}ms`,
            }}
          >
            {text}
          </span>
        )}
      </span>
      {phase === "intro" && previous && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap"
          style={{
            animation: `titleOut ${MOTION.outMs}ms cubic-bezier(0.55, 0, 0.75, 0) both`,
          }}
        >
          {previous}
        </span>
      )}
      {blocks && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
        />
      )}
    </span>
  );
}
