import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export function Header() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname.startsWith(path);

  return (
    <header className="bar">
      <div className="wrap bar-in">
        <Link href="/vault" className="brand" aria-label="Orven app, the vault">
          <svg width="26" height="26" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#15171A"
              strokeWidth="10"
              strokeDasharray="11.7 4"
              transform="rotate(-93.6 50 50)"
            ></circle>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#D9381E"
              strokeWidth="10"
              strokeDasharray="11.7 239.6"
              transform="rotate(-93.6 50 50)"
            ></circle>
            <circle cx="50" cy="50" r="9" fill="#15171A"></circle>
          </svg>
          orven<small>App</small>
        </Link>

        <nav className="nav" aria-label="Main">
          <Link href="/vault" className={isActive("/vault") ? "on" : ""}>
            Vault
          </Link>
          <Link href="/pad" className={isActive("/pad") ? "on" : ""}>
            OrvenPad
          </Link>
          <Link href="/tide" className={isActive("/tide") ? "on" : ""}>
            Tide
          </Link>
          <Link href="/swap" className={isActive("/swap") ? "on" : ""}>
            Swap
          </Link>
          <Link href="/lock" className={isActive("/lock") ? "on" : ""}>
            Lock
          </Link>
          <a href="/agents" target="_blank" rel="noreferrer">
            Agents
          </a>
          <a href="/docs" target="_blank" rel="noreferrer">
            Docs
          </a>
        </nav>

        <Link
          className={`pill small ghost vault-pill ${isActive("/vault") ? "on" : ""}`}
          href="/vault"
        >
          Vault
        </Link>

        <div className="wallet">
          <button
            className="pill small"
            type="button"
            onClick={() => setWalletConnected(!walletConnected)}
          >
            {walletConnected ? "0x7a3...4e19" : "Connect wallet"}
          </button>
        </div>

        <button
          type="button"
          className="mnav-btn"
          aria-expanded={mobileMenuOpen}
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="1.8"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
