import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function PageLayout({ children, hideFooter }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
