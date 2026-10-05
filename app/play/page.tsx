import type { Metadata } from "next";
import TabPage from "@/components/layout/TabPage";
import ProjectGrid from "@/components/home/ProjectGrid";
import { projectsIn } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Play | ${site.name}` };

export default function PlayPage() {
  return (
    <TabPage tab="play">
      <ProjectGrid projects={projectsIn("play")} />
    </TabPage>
  );
}
