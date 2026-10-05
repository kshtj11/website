import type { ReactNode } from "react";
import type { NavTabId } from "@/content/site";
import { heroCopy } from "@/content/pages";
import PageHeader from "./PageHeader";
import TopBar from "./TopBar";
import Footer from "./Footer";

/** Shell for the three top-level tabs: top bar → नमस्कार header → content → footer. */
export default function TabPage({ tab, children }: { tab: NavTabId; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white">
      <TopBar activeTab={tab} />
      <PageHeader variant={tab}>{heroCopy[tab]}</PageHeader>
      {children}
      <Footer />
    </div>
  );
}
