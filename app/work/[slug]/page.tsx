import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { getProject, projectsIn } from "@/content/projects";
import { site } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

// Static export: one HTML page is generated per project at build time.
export const dynamicParams = false;
export function generateStaticParams() {
  return projectsIn("work").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject("work", (await params).slug);
  return project ? { title: `${project.title} | ${site.name}`, description: project.description } : {};
}

export default async function Page({ params }: Props) {
  const project = getProject("work", (await params).slug);
  if (!project) notFound();
  return <CaseStudyPage project={project} />;
}
