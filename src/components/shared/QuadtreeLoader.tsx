"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import quadtrees from "@/content/quadtrees.generated.json";

/**
 * Loading placeholder: the image's colour quadtree (made by scripts/process-images.mjs) plays
 * coarse → fine — big squares split into smaller ones, each level crossfading in over STEP_MS with
 * an ease — then fades out once the real image is in. Drawn on a tiny canvas (16 px per square)
 * scaled up with crisp pixels.
 */

const STEP_MS = 160;
const CELL = 16; // canvas pixels per root square (2^depth used by the pipeline)
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

type Node = { x: number; y: number; s: number; c: number[]; k?: Node[] };
type Tree = { cols: number; rows: number; roots: Node[]; depth: number };

const table = quadtrees as Record<string, string>;
const parsed = new Map<string, Tree>();

/** "/projects/x/01.card.webp" and "/projects/x/01.webp" share one quadtree. */
export function quadtreeFor(src?: string) {
  if (!src) return undefined;
  const key = src.replace(/(\.card)?\.(webp|gif)$/, "");
  return table[key] ? key : undefined;
}

function parse(key: string): Tree {
  const cached = parsed.get(key);
  if (cached) return cached;
  const qt = table[key];
  const cols = +qt[0];
  const rows = +qt[1];
  let i = 2;
  let depth = 0;
  const read = (x: number, y: number, s: number, d: number): Node => {
    depth = Math.max(depth, d);
    if (qt[i] === ".") {
      i++;
      const h = s / 2;
      const k = [read(x, y, h, d + 1), read(x + h, y, h, d + 1), read(x, y + h, h, d + 1), read(x + h, y + h, h, d + 1)];
      // A split cell's colour is the average of its four children (shown at coarser levels).
      return { x, y, s, k, c: [0, 1, 2].map((j) => k.reduce((a, n) => a + n.c[j], 0) / 4) };
    }
    const v = (B64.indexOf(qt[i]) << 6) | B64.indexOf(qt[i + 1]);
    i += 2;
    return { x, y, s, c: [((v >> 8) & 15) * 17, ((v >> 4) & 15) * 17, (v & 15) * 17] };
  };
  const roots: Node[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) roots.push(read(c * CELL, r * CELL, CELL, 0));
  const tree = { cols, rows, roots, depth };
  parsed.set(key, tree);
  return tree;
}

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

function draw(ctx: CanvasRenderingContext2D, n: Node, level: number, d = 0) {
  if (n.k && d < level) return n.k.forEach((k) => draw(ctx, k, level, d + 1));
  ctx.fillStyle = `rgb(${n.c.map(Math.round).join(",")})`;
  ctx.fillRect(n.x, n.y, n.s, n.s);
}

export default function QuadtreeLoader({
  qtKey,
  active,
  loaded,
}: {
  qtKey: string;
  /** start refining (the image has a src and is downloading) */
  active: boolean;
  /** the real image is ready → fade out after the last level */
  loaded: boolean;
}) {
  const tree = useMemo(() => parse(qtKey), [qtKey]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inView, setInView] = useState(false);
  const [finished, setFinished] = useState(false);

  // Only animate once on screen, so pieces further down still play when you get there.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && (setInView(true), io.disconnect()), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Level 0 (the big squares) until it's time to play.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) tree.roots.forEach((n) => draw(ctx, n, 0));
  }, [tree]);

  // Progress runs 0 → depth; at 1.4 the next level is 40% faded in over level 1.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!active || !inView || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || tree.depth === 0) {
      tree.roots.forEach((n) => draw(ctx, n, tree.depth));
      setFinished(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const p = Math.min(tree.depth, (now - start) / STEP_MS);
      const level = Math.floor(p);
      ctx.globalAlpha = 1;
      tree.roots.forEach((n) => draw(ctx, n, level));
      if (p < tree.depth) {
        ctx.globalAlpha = ease(p - level);
        tree.roots.forEach((n) => draw(ctx, n, level + 1));
        raf = requestAnimationFrame(frame);
      } else setFinished(true);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, inView, tree]);

  const done = loaded && finished;
  return (
    <canvas
      ref={canvasRef}
      width={tree.cols * CELL}
      height={tree.rows * CELL}
      aria-hidden="true"
      className={clsx(
        "pointer-events-none absolute inset-0 z-20 size-full transition-opacity duration-500 ease-out [image-rendering:pixelated]",
        done ? "opacity-0" : "opacity-100",
      )}
    />
  );
}
