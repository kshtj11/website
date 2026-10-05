"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/content/types";
import { projectHref } from "@/content/projects";
import ProjectCard from "./ProjectCard";
import PreviewModal from "./PreviewModal";

const FEATURED_COUNT = 4;

/**
 * 2-column grid (gap-6, px-16) on desktop, single column (gap-8, px-6) on mobile.
 * Desktop click → preview popup with the URL updated in place; mobile click → full page.
 */
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<Project | null>(null);

  const handleOpen = useCallback(
    (project: Project) => {
      const href = projectHref(project);
      if (window.innerWidth < 768) {
        router.push(href);
        return;
      }
      setOpen(project);
      window.history.pushState(null, "", href);
    },
    [router],
  );

  // Browser back while the popup is open just closes it.
  useEffect(() => {
    const onPop = () => setOpen(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(null);
    window.history.back();
  }, []);

  return (
    <>
      <div className="relative hidden w-full shrink-0 grid-cols-2 gap-6 px-16 pb-2 pt-2.5 md:grid">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} onOpen={handleOpen} featured={i < FEATURED_COUNT} index={Math.floor(i / 2)} />
        ))}
      </div>
      <div className="relative flex w-full shrink-0 flex-col gap-8 px-6 py-4 md:hidden">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} onOpen={handleOpen} featured={i < FEATURED_COUNT} index={i} />
        ))}
      </div>

      {open && <PreviewModal key={open.slug} project={open} onClose={handleClose} />}
    </>
  );
}
