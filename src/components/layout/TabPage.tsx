import type { ReactNode } from "react";
import type { NavTabId } from "@/content/site";
import { heroCopy, heroTitle } from "@/content/pages";
import PageHeader from "./PageHeader";
import TopBar from "./TopBar";
import Footer from "./Footer";

/** Shell for the three top-level tabs: top bar → header (नमस्कार intro on Work, page title elsewhere) → content → footer. */
export default function TabPage({ tab, children }: { tab: NavTabId; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white">
      <TopBar activeTab={tab} />
      <PageHeader variant={tab} title={heroTitle[tab]}>
        {heroCopy[tab]}
      </PageHeader>
      {children}
      <Footer />
    </div>
  );
}
