import React from "react";
import { Header } from "./Header";
import { NetworkStatusBar } from "./NetworkStatusBar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div id="__next">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <NetworkStatusBar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
