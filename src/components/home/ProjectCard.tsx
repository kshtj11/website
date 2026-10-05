"use client";

import { memo } from "react";
import type { Project } from "@/content/types";
import MediaFrame from "../shared/MediaFrame";

type ProjectCardProps = {
  project: Project;
  onOpen: (project: Project) => void;
  /** Featured cards carry the title pill on the image (desktop) */
  featured?: boolean;
  /** Row index, staggers the entrance 60ms per row (capped at 300ms) */
  index?: number;
};

function TitleLine({ project }: { project: Project }) {
  return (
    <>
      <span>{project.title}</span>
      {project.tag && <span className="text-[var(--ink-subtle)]"> ({project.tag})</span>}
      <span className="text-[var(--ink-subtle)]"> • {project.year}</span>
    </>
  );
}

/**
 * Card sizing (from the reference):
 *   media      aspect 678 / 367.6, radius 26px, 1px zinc-100 inner border
 *   hover      media scales to 0.99 over 300ms; caption rises 8px + fades in
 *   caption    px-[13px], text-base, title zinc-900, meta zinc-400
 */
const ProjectCard = memo(function ProjectCard({ project, onOpen, featured = false, index = 0 }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
      className="project-card group relative flex w-full shrink-0 cursor-pointer flex-col items-start gap-3 text-left"
    >
      <div className="relative w-full overflow-clip rounded-[26px] transition-transform duration-300 group-hover:scale-[0.99]">
        <MediaFrame
          src={project.cover}
          videoSrc={project.coverVideo}
          alt={project.title}
          placeholderLabel={project.cover ? undefined : "cover · 1920 × 1040"}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[26px] border border-zinc-100" />
        {featured && (
          <div className="absolute bottom-0 left-0 hidden p-3 md:block">
            <div className="flex items-center justify-center rounded-full border border-[var(--line)] bg-white px-3 pb-[4.8px] pt-[5px]">
              <p className="text-base font-medium leading-snug tracking-[0.005em] text-[var(--ink-strong)]">
                <TitleLine project={project} />
              </p>
            </div>
          </div>
        )}
      </div>

      {featured ? (
        <>
          {/* Desktop: title lives in the pill, so only the description shows on hover */}
          <p className="project-hover-text -mb-0.5 -mt-1.5 hidden px-[13px] text-base leading-snug tracking-[0.005em] text-[var(--ink-subtle)] md:block">
            {project.description}
          </p>
          <div className="flex flex-col gap-1 px-[13px] text-base leading-snug tracking-[0.01em] md:hidden">
            <p className="text-[var(--ink-strong)]">
              <TitleLine project={project} />
            </p>
            <p className="leading-tight text-[var(--ink-subtle)]">{project.description}</p>
          </div>
        </>
      ) : (
        <p className="project-hover-text w-full px-[13px] text-base leading-snug tracking-[0.005em] text-[var(--ink-strong)] md:-mb-0.5 md:-mt-1.5">
          <TitleLine project={project} />
        </p>
      )}
    </button>
  );
});

export default ProjectCard;
