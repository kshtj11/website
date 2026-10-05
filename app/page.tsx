import TabPage from "@/components/layout/TabPage";
import ProjectGrid from "@/components/home/ProjectGrid";
import { projectsIn } from "@/content/projects";

export default function WorkPage() {
  return (
    <TabPage tab="work">
      <ProjectGrid projects={projectsIn("work")} />
    </TabPage>
  );
}
