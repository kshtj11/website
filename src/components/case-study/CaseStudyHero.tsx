import type { Project } from "@/content/types";
import MediaFrame from "../shared/MediaFrame";
import { ScrollReveal } from "../shared/ScrollReveal";
import { ArrowUpRight } from "../shared/icons";

export function MetadataRow({ metadata }: { metadata: NonNullable<Project["metadata"]> }) {
  return (
    <div className="flex w-full items-start gap-5 max-md:grid max-md:grid-cols-2 max-md:gap-4">
      {metadata.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-1 flex-col gap-3 text-base leading-normal">
          <p className="font-medium text-[var(--ink-subtle)]">{item.label}</p>
          <p className="text-zinc-700">
            {item.value.map((v, i) => (
              <span key={i} className="block">
                {v}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Pink pill beside the title linking to a live/playable build. Tint at rest, solid brand on hover. */
export function ProjectChip({ chip }: { chip?: Project["chip"] }) {
  if (!chip) return null;
  return (
    <a
      href={chip.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--brand-accent)] transition-colors duration-200 hover:bg-[var(--brand-accent)] hover:text-white"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2 1.2v7.6a.5.5 0 0 0 .76.43l6.1-3.8a.5.5 0 0 0 0-.86L2.76.77A.5.5 0 0 0 2 1.2Z" fill="currentColor" />
      </svg>
      {chip.label}
    </a>
  );
}

export function ProjectLinks({ links }: { links?: Project["links"] }) {
  if (!links?.length) return null;
  return (
    <>
      {links.map((l) => (
        <a key={l.href + l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="button secondary md">
          {l.label}
          <ArrowUpRight />
        </a>
      ))}
    </>
  );
}

/**
 * Case-study hero inside the 800px reading column:
 *   logo 80×80 → title t-title → facts row (gap-5) → links → hairline → cover.
 * Each step fades in 80ms after the last.
 */
export default function CaseStudyHero({ project }: { project: Project }) {
  return (
    <div className="flex w-full flex-col items-start justify-center gap-8 px-8 pb-16 pt-1">
      {project.logo && (
        <ScrollReveal variant="fade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.logo} alt="" className="size-20 rounded-2xl object-cover" />
        </ScrollReveal>
      )}

      <div className="flex w-full flex-col items-start gap-10">
        <ScrollReveal variant="fade" delay={80}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="t-title text-[var(--ink-strong)]">{project.title}</h1>
            <ProjectChip chip={project.chip} />
          </div>
          <p className="t-hero mt-2 text-[var(--ink-subtle)]">{project.description}</p>
        </ScrollReveal>

        {project.metadata && (
          <ScrollReveal variant="fade" delay={160} className="w-full">
            <MetadataRow metadata={project.metadata} />
          </ScrollReveal>
        )}

        {project.links?.length ? (
          <ScrollReveal variant="fade" delay={200} className="flex flex-wrap gap-2">
            <ProjectLinks links={project.links} />
          </ScrollReveal>
        ) : null}
      </div>

      <div className="horizontal-line" />

      <ScrollReveal delay={240} className="w-full">
        <MediaFrame
          src={project.cover}
          videoSrc={project.coverVideo}
          alt={project.title}
          aspect="16/9"
          placeholderLabel={project.cover ? undefined : "hero · 1920 × 1080"}
          eager
        />
      </ScrollReveal>
    </div>
  );
}
