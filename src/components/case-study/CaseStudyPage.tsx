import Link from "next/link";
import type { Project } from "@/content/types";
import { projectHref, projectsIn } from "@/content/projects";
import Footer from "../layout/Footer";
import MediaFrame from "../shared/MediaFrame";
import { ScrollReveal } from "../shared/ScrollReveal";
import Blocks from "./Blocks";
import CaseStudyHeader from "./CaseStudyHeader";
import CaseStudyHero from "./CaseStudyHero";

function MoreProjects({ current }: { current: Project }) {
  const others = projectsIn(current.section).filter((p) => p.slug !== current.slug).slice(0, 2);
  if (!others.length) return null;
  return (
    <section className="flex w-full flex-col gap-6 px-8 pt-16">
      <div className="horizontal-line" />
      <p className="t-hero text-[var(--ink-subtle)]">More {current.section}</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {others.map((p, i) => (
          <ScrollReveal key={p.slug} delay={i * 80}>
            <Link href={projectHref(p)} className="group flex flex-col gap-3">
              <div className="transition-transform duration-300 group-hover:scale-[0.99]">
                <MediaFrame src={p.cover} alt={p.title} placeholderLabel={p.cover ? undefined : "cover"} />
              </div>
              <p className="px-[13px] text-base leading-snug text-[var(--ink-strong)]">
                {p.title}
                <span className="text-[var(--ink-subtle)]"> • {p.year}</span>
              </p>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/** Full-page case study: sticky header, then everything in one centered 800px column. */
export default function CaseStudyPage({ project }: { project: Project }) {
  const sectionLabel = project.section === "work" ? "Work" : "Play";
  const sectionHref = project.section === "work" ? "/" : "/play/";

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <CaseStudyHeader sectionLabel={sectionLabel} sectionHref={sectionHref} title={project.title} />
      <main className="mx-auto flex w-full max-w-[800px] flex-col pb-16">
        <CaseStudyHero project={project} />
        {project.images?.length && project.caseStudyImages !== "blocks" ? (
          // Same pipeline images as the popup, so mobile (which skips the popup) sees them too.
          // Seamless stack (see PreviewModal): no gaps between slices, rounded outer corners only.
          <div className="w-full px-8 pb-10">
            <div className="flex w-full flex-col overflow-hidden rounded-2xl">
              {project.images.map((img) => (
                <MediaFrame key={img.src} src={img.src} alt={img.alt} aspect={`${img.width}/${img.height}`} rounded="" />
              ))}
            </div>
          </div>
        ) : null}
        {project.blocks && <Blocks blocks={project.blocks} />}
        <MoreProjects current={project} />
      </main>
      <Footer />
    </div>
  );
}
