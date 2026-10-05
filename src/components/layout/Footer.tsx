"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navTabs, site } from "@/content/site";
import { ScrollReveal } from "../shared/ScrollReveal";
import TextScramble from "../shared/TextScramble";
import Logo from "../shared/Logo";
import { ArrowUpRight, MoonIcon, SunIcon } from "../shared/icons";

function useLocalTime(timezone: string) {
  const [state, setState] = useState<{ time: string; h24: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const [h, m] = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(new Date())
        .split(":");
      const h24 = parseInt(h, 10) % 24;
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
      setState({ time: `${h12}:${m} ${h24 >= 12 ? "PM" : "AM"}`, h24 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);
  return state;
}

function useChangelogDate() {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    fetch("/changelog.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.latestCommitDate && setDate(d.latestCommitDate))
      .catch(() => {});
  }, []);
  return date;
}

function LocalTime() {
  const t = useLocalTime(site.timezone);
  if (!t) return <span>&nbsp;</span>;
  const isDay = t.h24 >= 6 && t.h24 < 18;
  const Icon = isDay ? SunIcon : MoonIcon;
  const [hh, rest] = t.time.split(":");
  return (
    <>
      <Icon className="-mt-[2px] mr-1 inline-block h-[11px] w-[11px]" />
      {hh}
      <span className="animate-[blink_1.2s_ease-in-out_infinite]">:</span>
      {rest}
      {"  "}
      {site.city}
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 max-md:gap-2">
      <Logo className="size-7 text-[18px]" />
      <span className="text-3xl font-medium leading-normal text-[var(--ink)]">{site.name}</span>
    </Link>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    "text-base font-medium tracking-[0.005em] text-[var(--ink-subtle)] transition-colors duration-200 hover:text-[var(--brand-accent)]";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/**
 * 4-column footer on desktop (brand+clock | — | nav | contact+socials), stacked on mobile.
 */
export default function Footer() {
  const changelog = useChangelogDate();

  return (
    <footer className="relative w-full shrink-0">
      <div className="flex w-full flex-col items-center gap-16 px-16 pb-8 pt-8 max-md:px-6 max-md:pb-16 max-md:pt-4">
        <ScrollReveal className="flex w-full flex-col items-start gap-5">
          <div className="horizontal-line" />

          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-4 md:gap-5">
            <div className="flex flex-col items-start">
              <Brand />
              <p className="text-base leading-normal text-zinc-400">
                <LocalTime />
              </p>
            </div>

            <div className="hidden md:block" />

            <div className="flex flex-col items-start gap-2 max-md:order-last">
              {navTabs.map((t) => (
                <FooterLink key={t.id} href={t.href}>
                  {t.label}
                </FooterLink>
              ))}
            </div>

            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col text-base leading-normal text-zinc-400">
                <p>Let&apos;s work together!</p>
                <a
                  href={`mailto:${site.email}`}
                  className="group/email inline-flex items-center break-all font-medium text-zinc-600 transition-colors duration-200 hover:text-[var(--brand-accent)]"
                >
                  {site.email}
                  <span className="ml-1 inline-flex opacity-0 transition-opacity duration-150 group-hover/email:opacity-100">
                    <ArrowUpRight />
                  </span>
                </a>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {site.socials.map((s) => (
                  <FooterLink key={s.label} href={s.href} external>
                    {s.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={200} className="flex flex-col items-center gap-0.5">
          <p className="text-sm leading-relaxed text-zinc-400">Designed in Figma, built with Next.js.</p>
          <a href={site.repoUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-600">
            <TextScramble
              text={`CHANGELOG: ${changelog ?? "..."}`}
              className="text-nowrap text-xs leading-normal tracking-wider text-[var(--ink-subtle)]"
            />
          </a>
        </ScrollReveal>
      </div>
    </footer>
  );
}
