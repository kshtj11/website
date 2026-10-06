"use client";

import { useLayoutEffect, useState } from "react";
import { heroTitle } from "@/content/pages";
import BlockTitle from "../motion/BlockTitle";

/** Remembers which header was showing, across client-side navigations (module state survives route changes). */
let lastHeader: string | undefined;

const INTRO_ROW = "flex-wrap items-baseline gap-x-[9px]";

/** "नमस्कार, I'm Kshitij Ghag" — Hind Bold greeting in the brand gradient + Hanken name, 9px apart. */
function Intro({ greeting, name }: { greeting: string; name: string }) {
  return (
    <>
      <span lang="mr" className="t-intro-deva text-brand-gradient">
        {greeting}
      </span>
      <span className="t-intro text-[var(--ink-strong)]">{name}</span>
    </>
  );
}

/**
 * The header's big title: the नमस्कार intro (title = null) or a page title. With `motion`, the
 * title is a BlockTitle — it plays the quadtree arrival when you come from another tab (never on a
 * first load or with reduced motion) and the click game. Everything it needs is measured from its
 * own text, so the header can be moved or restyled freely.
 */
export default function HeaderTitle({
  id,
  title,
  motion = false,
  greeting,
  name,
}: {
  /** Which header this is (the tab id); used to know where we came from */
  id: string;
  /** Page title; null = the नमस्कार intro */
  title: string | null;
  /** Quadtree arrival + click game */
  motion?: boolean;
  greeting: string;
  name: string;
}) {
  // Both decided on the very first render so the real text never flashes before the intro.
  const [previous] = useState(() => lastHeader);
  const [intro] = useState(
    () =>
      motion &&
      !!title &&
      !!previous &&
      previous !== id &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    lastHeader = id;
  }, [id]);

  if (!title) {
    return (
      <h1 className={`flex w-full ${INTRO_ROW}`}>
        <Intro greeting={greeting} name={name} />
      </h1>
    );
  }

  if (!motion)
    return <h1 className="t-intro text-[var(--ink-strong)]">{title}</h1>;

  const previousTitle = previous
    ? heroTitle[previous as keyof typeof heroTitle]
    : null;
  return (
    <h1 className="t-intro text-[var(--ink-strong)]">
      <BlockTitle
        text={title}
        intro={intro}
        previous={
          previousTitle ?? (
            <span className={`inline-flex ${INTRO_ROW}`}>
              <Intro greeting={greeting} name={name} />
            </span>
          )
        }
        interactive
      />
    </h1>
  );
}
