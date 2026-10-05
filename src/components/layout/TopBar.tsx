import Link from "next/link";
import clsx from "clsx";
import { navTabs, site, type NavTabId } from "@/content/site";

/**
 * Top bar: name + role on the left, Work / Play / About / Resume right-aligned to the page gutter.
 *   active tab   bold, brand pink
 *   Resume       same grey as the other links, opens the Drive PDF in a new tab
 *   sticky       only on Play and About (Work scrolls away with the hero)
 * Desktop: links 32px apart. Mobile: name row, links row.
 */
export default function TopBar({ activeTab }: { activeTab: NavTabId }) {
  const sticky = activeTab !== "work";
  return (
    <div
      className={clsx(
        "z-50 w-full shrink-0 border-b border-[var(--line)] bg-[var(--background)]",
        sticky && "sticky top-0",
      )}
    >
      <div className="grid w-full grid-cols-1 items-center gap-y-3 px-16 py-5 max-md:px-6 max-md:py-4 md:grid-cols-[1fr_auto]">
        <Link href="/" className="flex flex-wrap items-baseline gap-x-3">
          <span className="t-strong text-[var(--ink-strong)]">{site.fullName}</span>
          <span className="t-card text-[var(--ink-subtle)]">{site.role}</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-8 max-md:gap-6">
          {navTabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "t-card transition-colors duration-200",
                  active ? "font-bold text-[var(--brand-accent)]" : "text-[var(--ink-muted)] hover:text-[var(--ink-strong)]",
                )}
              >
                {t.label}
              </Link>
            );
          })}
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="t-card text-[var(--ink-muted)] transition-colors duration-200 hover:text-[var(--ink-strong)]"
          >
            Resume
          </a>
        </nav>
      </div>
    </div>
  );
}
