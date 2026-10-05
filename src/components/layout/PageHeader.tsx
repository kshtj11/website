import type { ReactNode } from "react";
import { site } from "@/content/site";

/**
 * Header shared by Work / Play / About.
 *   intro         t-intro-deva (Hind Bold, gradient) + t-intro (Hanken ExtraBold), 48px / 36px mobile
 *   hero copy     t-hero (18px, 16px mobile), zinc-400, enters with projectCardEnter
 * Horizontal gutter everywhere on the site: px-16 desktop / px-6 mobile.
 */
export default function PageHeader({ children, variant }: { children?: ReactNode; variant: string }) {
  return (
    <header className="relative z-[41] flex w-full shrink-0 flex-col items-start bg-[var(--background)]">

      <div className="relative z-[2] flex w-full flex-col items-start px-16 pb-10 pt-20 max-md:px-6 max-md:pb-6 max-md:pt-12">
        {/* Intro (Figma "Frame 2"): Hind Bold greeting in the brand gradient + Hanken Grotesk ExtraBold name, 48px, 9px apart */}
        <h1 className="flex w-full flex-wrap items-baseline gap-x-[9px]">
          <span lang="mr" className="t-intro-deva text-brand-gradient">
            {site.intro.greeting}
          </span>
          <span className="t-intro text-[var(--ink-strong)]">
            {site.intro.name}
          </span>
        </h1>
        {children && (
          // key={variant} restarts the entrance when switching tabs
          <div
            key={variant}
            className="hero-copy mt-1 w-full whitespace-pre-wrap t-hero text-[var(--ink-subtle)]"
          >
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
