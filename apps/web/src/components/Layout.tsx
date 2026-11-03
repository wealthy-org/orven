import React from "react";
import { Header } from "./Header";
import { NetworkStatusBar } from "./NetworkStatusBar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <NetworkStatusBar />
      <main id="main" className="main-viewport">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
