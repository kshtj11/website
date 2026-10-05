import type { Metadata } from "next";
import TabPage from "@/components/layout/TabPage";
import PlayPage from "@/components/play/PlayPage";
import { site } from "@/content/site";

export const metadata: Metadata = { title: `Play | ${site.fullName}` };

export default function Page() {
  return (
    <TabPage tab="play">
      <PlayPage />
    </TabPage>
  );
}
