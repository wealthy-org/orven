import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <span>
          Orven Protocol on Robinhood Chain (Testnet 46630). Prices and trades are read from the
          chain; simulation mode for development and testing.
        </span>
        <nav aria-label="Footer">
          <Link href="/docs">Docs</Link>
          <Link href="/security">Security</Link>
          <a href="https://github.com/orven-protocol" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a
            href="https://x.com/orven_14"
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            title="Follow Orven on X (@orven_14)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (@orven_14)</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
