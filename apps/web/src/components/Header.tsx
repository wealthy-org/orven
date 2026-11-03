import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWallet } from "@/lib/wallet";
import { ROBINHOOD_TESTNET } from "@orven/product-config";

export function Header() {
  const router = useRouter();
  const {
    address,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    ethBalance,
    currentBlock,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/vault") {
      return router.pathname === "/vault" || router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMobileMenuOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (mobileMenuOpen) {
        document.body.classList.add("mnav-open");
      } else {
        document.body.classList.remove("mnav-open");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("mnav-open");
      }
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
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
            <Link href="/agents" className={isActive("/agents") ? "on" : ""}>
              Agents
            </Link>
            <Link href="/docs" className={isActive("/docs") ? "on" : ""}>
              Docs
            </Link>
          </nav>

          <Link
            className={`pill small ghost vault-pill ${isActive("/vault") ? "on" : ""}`}
            href="/vault"
          >
            Vault
          </Link>

          <div className="wallet">
            {!isConnected ? (
              <button
                className="pill small"
                type="button"
                disabled={isConnecting}
                onClick={connect}
                aria-label="Connect Web3 Wallet"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
            ) : (
              <button
                className={`pill small ${!isCorrectNetwork ? "warn" : "ghost"}`}
                type="button"
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                aria-expanded={walletMenuOpen}
                aria-label="Wallet Menu"
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: isCorrectNetwork ? "#16a34a" : "var(--red)",
                    marginRight: "4px",
                    display: "inline-block",
                  }}
                />
                {shortAddr}
              </button>
            )}

            {walletMenuOpen && isConnected && (
              <div className="wallet-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="wallet-dropdown-header">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: "10.5px" }}>Connected Account</span>
                    <span className="mono" style={{ fontSize: "10px", color: "#16a34a" }}>● Live RPC</span>
                  </div>
                  <span className="addr" style={{ fontSize: "12px", fontWeight: "600", display: "block", marginTop: "2px" }}>
                    {address}
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "12px", color: "var(--mute-2)" }}>Balance:</span>
                    <span className="num" style={{ fontSize: "13px", fontWeight: "700" }}>{ethBalance} ETH</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                    <span style={{ fontSize: "11px", color: "var(--faint)" }}>Block:</span>
                    <span className="mono" style={{ fontSize: "10.5px", color: "var(--faint)" }}>#{currentBlock}</span>
                  </div>
                </div>

                {!isCorrectNetwork && (
                  <div style={{ padding: "8px 10px", background: "var(--red-soft)", color: "var(--red-ink)", fontSize: "11.5px", borderRadius: "6px" }}>
                    Wrong Network · Switch to Robinhood Chain
                    <button
                      type="button"
                      onClick={() => switchNetwork(ROBINHOOD_TESTNET.id)}
                      className="pill small warn"
                      style={{ minHeight: "26px", padding: "0 8px", fontSize: "11px", marginTop: "4px", width: "100%" }}
                    >
                      Switch to Testnet (46630)
                    </button>
                  </div>
                )}

                <div className="wallet-dropdown-actions">
                  <button type="button" onClick={handleCopy} className="wallet-dropdown-item">
                    <span>{copied ? "✔ Copied" : "Copy Address"}</span>
                  </button>
                  <a
                    href={`https://testnet.robinhoodchain.blockscout.com/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="wallet-dropdown-item"
                  >
                    <span>View on Explorer ↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      disconnect();
                      setWalletMenuOpen(false);
                    }}
                    className="wallet-dropdown-item"
                    style={{ color: "var(--red)" }}
                  >
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mnav-btn"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="4" x2="18" y2="18" />
                <line x1="18" y1="4" x2="4" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="1.8"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="mnav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="mnav" aria-label="Mobile Navigation Drawer">
            <div className="mnav-header">
              <span className="mono" style={{ color: "var(--mute-2)", fontSize: "11px" }}>
                MENU & ECOSYSTEM
              </span>
              <button
                type="button"
                className="mnav-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <ul className="mnav-list">
              <li>
                <Link
                  href="/vault"
                  aria-current={isActive("/vault") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Vault</span>
                  <small className="mono">01</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/swap"
                  aria-current={isActive("/swap") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Swap</span>
                  <small className="mono">02</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/pad"
                  aria-current={isActive("/pad") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>OrvenPad</span>
                  <small className="mono">03</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/tide"
                  aria-current={isActive("/tide") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Tide Rewards</span>
                  <small className="mono">04</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/lock"
                  aria-current={isActive("/lock") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Lock ORVEN</span>
                  <small className="mono">05</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  aria-current={isActive("/agents") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>AI Agents & MCP</span>
                  <small className="mono">06</small>
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  aria-current={isActive("/docs") ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Documentation</span>
                  <small className="mono">07</small>
                </Link>
              </li>
            </ul>

            <div className="mnav-footer">
              <div className="mnav-wallet-status">
                <span className="mono">Current Network</span>
                <b>Robinhood Testnet (Chain 46630)</b>
              </div>
              <div className="mnav-links">
                <a href="https://github.com/orven-protocol" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <span>·</span>
                <a href="https://x.com/orvenprotocol" target="_blank" rel="noreferrer">
                  Twitter/X
                </a>
                <span>·</span>
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)}>
                  API & Specs
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
