import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import Logo from "../shared/Logo";

/**
 * Gradient hero shared by Work / Play / About.
 *   logo row      pt-8  pb-8 (mobile pb-4)
 *   name          text-4xl medium, zinc-700
 *   hero copy     text-lg (mobile base), zinc-400, enters with projectCardEnter
 * Horizontal gutter everywhere on the site: px-16 desktop / px-6 mobile.
 */
export default function PageHeader({ children, variant }: { children?: ReactNode; variant: string }) {
  return (
    <header className="relative z-[41] flex w-full shrink-0 flex-col items-start bg-[var(--background)]">

      <div className="relative z-[2] w-full px-16 pb-8 pt-8 max-md:px-6 max-md:pb-4">
        <Link href="/" aria-label={`${site.name} home`} className="inline-block transition-opacity hover:opacity-80">
          <Logo className="size-11 text-[28px]" />
        </Link>
      </div>

      <div className="relative z-[2] flex w-full flex-col items-start px-16 pt-14 max-md:min-h-[210px] max-md:px-6 max-md:pt-20 md:min-h-[176px]">
        {/* Intro (Figma "Frame 2"): Hind Bold greeting in the brand gradient + Hanken Grotesk ExtraBold name, 48px, 9px apart */}
        <h1 className="flex w-full flex-wrap items-baseline gap-x-[9px] text-[48px] leading-normal max-md:text-[36px]">
          <span lang="mr" className="text-brand-gradient font-[family-name:var(--font-intro-hi)] font-bold">
            {site.intro.greeting}
          </span>
          <span className="font-[family-name:var(--font-intro-en)] font-extrabold text-[var(--ink-strong)]">
            {site.intro.name}
          </span>
        </h1>
        {children && (
          // key={variant} restarts the entrance when switching tabs
          <div
            key={variant}
            className="hero-copy mt-1 w-full whitespace-pre-wrap text-lg leading-normal tracking-wide text-[var(--ink-subtle)] max-md:text-base"
          >
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
