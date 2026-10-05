import type { ReactNode } from "react";
import type { NavTabId } from "@/content/site";
import { heroCopy } from "@/content/pages";
import PageHeader from "./PageHeader";
import NavigationTabs from "./NavigationTabs";
import Footer from "./Footer";

/** Shell for the three top-level tabs: gradient header → tabs → content → footer. */
export default function TabPage({ tab, children }: { tab: NavTabId; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white">
      <PageHeader variant={tab}>{heroCopy[tab]}</PageHeader>
      <NavigationTabs activeTab={tab} />
      {children}
      <Footer />
    </div>
  );
}
