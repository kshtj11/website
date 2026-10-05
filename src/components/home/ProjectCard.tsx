"use client";

import { memo } from "react";
import type { Project } from "@/content/types";
import MediaFrame from "../shared/MediaFrame";

type ProjectCardProps = {
  project: Project;
  onOpen: (project: Project) => void;
  /** Row index, staggers the entrance 60ms per row (capped at 300ms) */
  index?: number;
};

/**
 * Work card: square image left, then title → one-line summary → chips (what the project is about).
 *   card      zinc-50 fill, 1px zinc-100 border, radius 26, 12px padding; hover scales to 0.99
 *   image     1 : 1, radius 20, ~46% of the card width (full width + stacked on mobile)
 *   title     t-section (30 SemiBold) · summary t-card zinc-600 · chips pinned to the bottom
 */
const ProjectCard = memo(function ProjectCard({ project, onOpen, index = 0 }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
      className="project-card group flex w-full cursor-pointer gap-6 rounded-[26px] border border-[var(--line)] bg-zinc-50 p-3 text-left transition-transform duration-300 hover:scale-[0.99] max-md:flex-col max-md:gap-4"
    >
      <div className="w-[46%] shrink-0 max-md:w-full">
        <MediaFrame
          src={project.cover}
          videoSrc={project.coverVideo}
          alt={project.title}
          aspect="1/1"
          rounded="rounded-[20px]"
          placeholderLabel={project.cover ? undefined : "cover · 1:1"}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3 max-md:px-2 max-md:py-1">
        <h3 className="t-section text-[var(--ink-strong)]">{project.title}</h3>
        {project.status === "draft" && (
          <span className="t-micro mt-2 w-fit rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
            DRAFT · hidden on live site
          </span>
        )}
        <p className="t-card mt-3 text-[var(--ink-body)]">{project.description}</p>
        {project.tags?.length ? (
          <ul className="mt-auto flex flex-wrap gap-2 pt-6">
            {project.tags.map((tag) => (
              <li key={tag} className="t-label rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[var(--ink)]">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </button>
  );
});

export default ProjectCard;
