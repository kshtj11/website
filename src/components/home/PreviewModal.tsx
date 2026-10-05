"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Project } from "@/content/types";
import { projectHref } from "@/content/projects";
import MediaFrame from "../shared/MediaFrame";
import { ArrowUpRight, CloseIcon, ExpandIcon } from "../shared/icons";
import { MetadataRow, ProjectChip, ProjectLinks } from "../case-study/CaseStudyHero";

const EXIT_MS = 300;

/**
 * Popup preview (desktop). Panel is 10/12 of the viewport wide, max 90vh, radius 26px.
 * Enter: fade + rise 32px → 0 (300ms ease-out). Exit: fade + drop to 16px.
 * The expand button / "Read case study" goes to the real full-page route.
 */
export default function PreviewModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const href = projectHref(project);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, EXIT_MS);
  };

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    closeRef.current?.focus({ preventScroll: true });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full navigation (not router.push) so the popup's history entry is replaced cleanly.
  const expand = () => window.location.replace(href);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" role="dialog" aria-modal="true" aria-label={project.title}>
      <div
        className={clsx("absolute inset-0 bg-zinc-900/20 transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")}
        onClick={close}
      />

      <div
        className={clsx(
          "relative flex max-h-[90vh] w-[calc(100%*10/12)] flex-col overflow-hidden rounded-[26px] bg-white transition-all duration-300 ease-out max-md:w-full",
          visible ? "translate-y-0 opacity-100" : closing ? "translate-y-4 opacity-0" : "translate-y-8 opacity-0",
        )}
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between px-6 pb-3 pt-6">
          <button
            type="button"
            onClick={expand}
            aria-label="Expand to full page"
            title="Expand"
            className="flex size-7 items-center justify-center rounded-lg text-[var(--ink-subtle)] transition-colors duration-200 hover:bg-zinc-100"
          >
            <ExpandIcon />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-lg text-[var(--ink-subtle)] transition-colors duration-200 hover:bg-zinc-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex w-full flex-col items-start gap-5 px-44 pb-10 pt-20 max-lg:px-16 max-md:px-8">
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="flex items-center gap-1.5 text-xl leading-normal text-[var(--ink-strong)]">
                  {project.title}
                  <span className="text-base font-medium text-[var(--ink-subtle)]">•</span>
                  <span className="text-[var(--ink-subtle)]">{project.year}</span>
                </p>
                <ProjectChip chip={project.chip} />
              </div>
              <p className="text-base leading-normal tracking-[0.005em] text-[var(--ink-muted)]">{project.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.blocks?.length ? (
                <button type="button" onClick={expand} className="button primary md">
                  Read case study <ArrowUpRight />
                </button>
              ) : null}
              <ProjectLinks links={project.links} />
            </div>

            {project.metadata && (
              <div className="flex w-full flex-col gap-4">
                <div className="horizontal-line" />
                <MetadataRow metadata={project.metadata} />
              </div>
            )}

            {!project.images?.length && (
              <MediaFrame
                src={project.cover}
                videoSrc={project.coverVideo}
                alt={project.title}
                aspect="1097/616"
                rounded="rounded-2xl"
                className="mt-3"
                placeholderLabel={project.cover ? undefined : "cover"}
                eager
              />
            )}
          </div>

          {project.images?.length ? (
            // Behance-style canvas, full panel width (outside the inset text column): slices sit
            // edge to edge with no gaps, so panels spanning several images stay continuous.
            // The panel's own rounded corners clip the bottom of the stack.
            <div className="flex w-full flex-col">
              {project.images.map((img, i) => (
                <MediaFrame
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  aspect={`${img.width}/${img.height}`}
                  rounded=""
                  eager={i === 0}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
