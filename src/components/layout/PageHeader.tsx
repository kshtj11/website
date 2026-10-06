import type { ReactNode } from "react";
import { site } from "@/content/site";
import HeaderTitle from "./HeaderTitle";

/**
 * Header shared by Work / Play / About.
 *   intro         Work: t-intro-deva (Hind Bold, gradient) + t-intro (Hanken ExtraBold), 48px / 36px mobile
 *                 Other tabs: `title` in t-intro (e.g. "Play", "About me"); `motion` = quadtree title (HeaderTitle)
 *   hero copy     t-hero (18px, 16px mobile), zinc-400, enters with projectCardEnter. Empty = the line's
 *                 height is still reserved, so every tab's header is the same height.
 * Horizontal gutter everywhere on the site: px-16 desktop / px-6 mobile.
 */
export default function PageHeader({
  children,
  variant,
  title,
  motion = false,
}: {
  children?: ReactNode;
  variant: string;
  /** Page title; omit for the नमस्कार intro */
  title?: string | null;
  /** Animated block title (arrival + click game) */
  motion?: boolean;
}) {
  return (
    <header className="relative z-[41] flex w-full shrink-0 flex-col items-start bg-[var(--background)]">
      <div className="relative z-[2] flex w-full flex-col items-start px-16 pb-10 pt-20 max-md:px-6 max-md:pb-6 max-md:pt-12">
        <HeaderTitle
          id={variant}
          title={title ?? null}
          motion={motion}
          greeting={site.intro.greeting}
          name={site.intro.name}
        />
        {/* key={variant} restarts the entrance when switching tabs */}
        <div
          key={variant}
          aria-hidden={children ? undefined : true}
          className="hero-copy mt-1 w-full whitespace-pre-wrap t-hero text-[var(--ink-subtle)]"
        >
          {children ?? " "}
        </div>
      </div>
    </header>
  );
}
