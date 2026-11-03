import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { NetworkProvider } from "@/lib/network";
import { WalletProvider } from "@/lib/wallet";
import { ToastProvider } from "@/lib/toast";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration failed:", err);
        });
      });
    }
  }, []);

  return (
    <NetworkProvider>
      <WalletProvider>
        <ToastProvider>
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <title>Orven · Post-Quantum Infrastructure</title>
          <meta
            name="description"
            content="Decentralized post-quantum vaults, zero-gas token swaps, and autonomous agent tooling on Robinhood Chain."
          />
          <meta property="og:title" content="Orven Protocol · Post-Quantum Infrastructure" />
          <meta
            property="og:description"
            content="Decentralized post-quantum vaults, zero-gas token swaps, and autonomous agent tooling on Robinhood Chain."
          />
          <meta property="og:url" content="https://useorvent.xyz" />
          <meta property="og:site_name" content="Orven Protocol" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Orven Protocol · Post-Quantum Infrastructure" />
          <meta
            name="twitter:description"
            content="Post-quantum token vaults, swaps, and agent tooling on Robinhood Chain."
          />
        </Head>
        <Component {...pageProps} />
      </ToastProvider>
    </WalletProvider>
  </NetworkProvider>
  );
}
