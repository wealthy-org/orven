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
          <a href="https://x.com/orvenprotocol" target="_blank" rel="noreferrer">
            X
          </a>
        </nav>
      </div>
    </footer>
  );
}
