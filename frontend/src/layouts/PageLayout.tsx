import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DemoBanner from "@/components/DemoBanner";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

interface PageLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function PageLayout({ children, hideFooter }: PageLayoutProps) {
  return (
    <div
      className="min-h-screen bg-bg-base flex flex-col"
      style={isDemoMode ? ({ "--demo-offset": "36px" } as React.CSSProperties) : undefined}
    >
      {isDemoMode && <DemoBanner />}
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
