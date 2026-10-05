import type { Metadata } from "next";
import TabPage from "@/components/layout/TabPage";
import MediaFrame from "@/components/shared/MediaFrame";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { about } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `About | ${site.name}` };

/**
 * Layout mirrors the reference: photo + bio side by side (stacked on mobile),
 * then sections with a heading on the left half and content on the right half.
 * Sections are gap-20 apart.
 */
export default function AboutPage() {
  return (
    <TabPage tab="about">
      <div className="flex w-full flex-col items-start gap-20 px-16 pb-8 pt-2 max-md:px-6">
        <section className="flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
          <ScrollReveal delay={100} className="w-72 shrink-0 md:w-76">
            <MediaFrame src={about.photo} alt={site.name} aspect="4/5" rounded="rounded-3xl" placeholderLabel="photo · 4:5" eager />
            {about.photoCaption && (
              <p className="mt-3 text-sm leading-normal text-[var(--ink-subtle)]">{about.photoCaption}</p>
            )}
          </ScrollReveal>

          <div className="flex max-w-xl flex-1 flex-col gap-6 md:pt-8">
            <ScrollReveal variant="fade" delay={150}>
              <h2 className="text-3xl font-medium text-[var(--ink-body)]">{about.greeting}</h2>
            </ScrollReveal>
            <ScrollReveal variant="fade" delay={200}>
              <div className="flex flex-wrap gap-2 text-base tracking-[0.005em] text-[var(--ink-subtle)] md:gap-6">
                {about.facts.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fade" delay={250}>
              <div className="flex flex-col gap-4 text-base leading-relaxed tracking-[0.005em] text-[var(--ink-body)]">
                {about.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="flex w-full flex-col gap-16 md:flex-row md:justify-between md:gap-0">
          <ScrollReveal variant="fade">
            <h2 className="text-3xl font-medium leading-normal text-[var(--ink)]">Experience</h2>
          </ScrollReveal>
          <div className="flex flex-col gap-10 md:w-1/2 md:shrink-0 md:gap-12 md:pt-1.5">
            {about.experience.map((e, i) => (
              <ScrollReveal key={e.org + e.years} delay={i * 80}>
                <p className="text-base font-medium tracking-[0.005em] text-[var(--ink)] md:text-lg">
                  {e.role}, {e.org}
                  <span className="font-normal text-[var(--ink-subtle)]">, {e.years}</span>
                </p>
                {e.note && <p className="mt-1 text-base text-[var(--ink-body)]">{e.note}</p>}
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </TabPage>
  );
}
