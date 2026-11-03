import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { requestRelayerQuote, submitRelayTransaction } from "@/lib/api";

export default function VaultPage() {
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "send" | "privacy">("deposit");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault();
    if (existing) {
      setVault(existing);
    } else {
      const created = BrowserVaultManager.createVault();
      setVault(created);
    }
  }, []);

  const handleCopyAddress = () => {
    if (vault?.address) {
      navigator.clipboard.writeText(vault.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimFaucet = () => {
    const updated = BrowserVaultManager.claimFaucet(250);
    setVault({ ...updated });
    setMessage("Successfully claimed +250.00 Testnet USDG!");
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportBackup = () => {
    try {
      BrowserVaultManager.exportBackup();
      setMessage("Encrypted backup downloaded: Keep your .json file secure!");
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to export backup");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const restored = BrowserVaultManager.restoreBackup(text);
        setVault({ ...restored });
        setMessage("Vault successfully restored from encrypted backup!");
        setTimeout(() => setMessage(null), 5000);
      } catch (err: any) {
        alert(err.message || "Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAction = async () => {
    if (!vault) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (num > vault.balanceUSDG) {
      alert(`Insufficient USDG balance. You have ${vault.balanceUSDG.toFixed(2)} USDG.`);
      return;
    }

    try {
      setIsProcessing(true);
      setMessage("Requesting Orven Relayer sponsorship...");

      const actionName = activeTab === "send" ? "vault_transfer" : "shield";
      const quote = await requestRelayerQuote(actionName, vault.address);

      setMessage(`Signing with local WOTS key #${vault.currentKeyIndex}...`);
      await new Promise((r) => setTimeout(r, 600));

      const { vault: updated, txHash } = BrowserVaultManager.executeSpend(
        activeTab === "send" ? "Vault Transfer" : "STARK Shield",
        num,
        activeTab === "privacy"
      );

      await submitRelayTransaction(quote.quoteId, "0x_mock_wots_signature_payload");

      setVault({ ...updated });
      setAmount("");
      setMessage(
        `Transaction confirmed! Tx: ${txHash.slice(0, 10)}... (WOTS Key #${
          updated.currentKeyIndex - 1
        } retired)`
      );
    } catch (err: any) {
      alert(err.message || "Failed to execute transaction");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const displayAddr = mounted && vault ? vault.address : "";
  const shortAddr = displayAddr
    ? `${displayAddr.slice(0, 6)}...${displayAddr.slice(-4)}`
    : "Connecting...";

  return (
    <Layout>
      <Head>
        <title>Vault · Orven</title>
        <meta
          name="description"
          content="Your Orven vault: USDG on Robinhood Chain under one-time post-quantum keys made in your browser."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Vault</span>
            </div>
            <h1>Your Orven vault</h1>
            <p>
              A vault of USDG on Robinhood Chain that only your one-time post-quantum keys can spend.
              Its keys are made and kept in this browser; every transaction goes through the Orven
              relayer, paid in USDG, so you never need ETH.
            </p>
          </div>
        </div>

        {/* 3-Step Professional Onboarding Banner */}
        <div
          style={{
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "18px 20px",
            margin: "24px 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
              Step 1 · Inception
            </span>
            <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "15px" }}>
              Post-Quantum Keys Active
            </div>
            <p className="note" style={{ fontSize: "12.5px", marginTop: "4px" }}>
              Encrypted AES-GCM 256-bit seed stored in your local browser sandbox.
            </p>
          </div>
          <div>
            <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
              Step 2 · Funding
            </span>
            <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "15px" }}>
              Claim Faucet Simulation
            </div>
            <p className="note" style={{ fontSize: "12.5px", marginTop: "4px" }}>
              Get free USDG to test swaps, privacy, and marketplace orders.
            </p>
          </div>
          <div>
            <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
              Step 3 · Connect
            </span>
            <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "15px" }}>
              AI Agent & Swaps
            </div>
            <p className="note" style={{ fontSize: "12.5px", marginTop: "4px" }}>
              Run local <code>@orven/mcp</code> or trade on Uniswap v3/v4 gas-free.
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              marginBottom: "20px",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        <div className="layout">
          <div className="stack" style={{ minWidth: 0 }}>
            <section className="panel">
              <div className="panel-head">
                <h2>Vault Overview</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="addr mono" title={displayAddr}>
                    {shortAddr}
                  </span>
                  {displayAddr && (
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="pill small ghost"
                      style={{ minHeight: "28px", padding: "0 8px", fontSize: "11px" }}
                      aria-label="Copy Address"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
              <div className="panel-body stack">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                    gap: "16px",
                  }}
                >
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px" }}>
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      Available Balance
                    </span>
                    <div
                      style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: "700" }}
                      className="num"
                    >
                      {mounted && vault ? vault.balanceUSDG.toFixed(2) : "0.00"}{" "}
                      <span style={{ fontSize: "15px", color: "var(--mute)" }}>USDG</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px" }}>
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      Shielded (Private)
                    </span>
                    <div
                      style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: "700" }}
                      className="num"
                    >
                      {mounted && vault ? vault.shieldedUSDG.toFixed(2) : "0.00"}{" "}
                      <span style={{ fontSize: "15px", color: "var(--mute)" }}>USDG</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px" }}>
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      WOTS Key Index
                    </span>
                    <div
                      style={{
                        fontSize: "clamp(18px, 2.4vw, 20px)",
                        fontWeight: "700",
                        color: "#16a34a",
                      }}
                      className="num"
                    >
                      Active: #{mounted && vault ? vault.currentKeyIndex : 0} /{" "}
                      {vault?.maxKeys ?? 1024}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button className="pill small" type="button" onClick={handleClaimFaucet}>
                    + Claim 250 USDG Faucet
                  </button>
                  <button className="pill small ghost" type="button" onClick={handleExportBackup}>
                    Export Backup (.json)
                  </button>
                  <button
                    className="pill small ghost"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Restore Backup
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <span className="mono" style={{ fontSize: "11px", color: "var(--mute)" }}>
                    Robinhood Testnet (Chain ID 46630)
                  </span>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Transaction Journal (Local WOTS Ledger)</h2>
                <span className="mono" style={{ fontSize: "11px" }}>
                  {vault?.transactions.length || 0} Records
                </span>
              </div>
              <div className="table-container">
                <table className="trades">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Asset</th>
                      <th>Amount</th>
                      <th>WOTS Key</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mounted &&
                      vault?.transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <span className="mono">{tx.type}</span>
                          </td>
                          <td>{tx.asset}</td>
                          <td className={`num ${tx.amount >= 0 ? "up" : "down"}`}>
                            {tx.amount >= 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                          </td>
                          <td>
                            <span className="mono">Key #{tx.wotsIndexUsed}</span>
                          </td>
                          <td>
                            <span style={{ color: "#16a34a", fontWeight: "600" }}>{tx.status}</span>
                          </td>
                        </tr>
                      ))}
                    {(!vault?.transactions || vault.transactions.length === 0) && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--mute)" }}>
                          No transactions signed yet. Claim the testnet faucet to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="panel" aria-label="Vault Actions">
              <div className="tabs">
                <button
                  type="button"
                  aria-pressed={activeTab === "deposit"}
                  onClick={() => setActiveTab("deposit")}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === "send"}
                  onClick={() => setActiveTab("send")}
                >
                  Send
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === "privacy"}
                  onClick={() => setActiveTab("privacy")}
                >
                  Shield
                </button>
              </div>

              <div className="panel-body stack">
                <div className="stack">
                  <div className="tp">
                    <span className="mono">Asset</span>
                    <div className="tp-btn" style={{ cursor: "default" }}>
                      <span className="tb tb-coin tb-sm" data-len="4">
                        <img src="/logos/usdg.png" alt="USDG" />
                      </span>
                      <span className="tp-val">
                        <b>USDG</b>
                        <span>Global Dollar (Testnet)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === "deposit" ? (
                  <div className="stack" style={{ padding: "12px 0" }}>
                    <p className="note">
                      Your vault's on-chain deposit address on Robinhood Chain. Send testnet USDG or WETH
                      here; transactions will register automatically.
                    </p>
                    <div
                      style={{
                        padding: "12px 14px",
                        background: "var(--soft)",
                        borderRadius: "6px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <span
                        className="mono"
                        style={{ fontSize: "11.5px", wordBreak: "break-all", display: "block" }}
                      >
                        {mounted && vault ? vault.address : "Loading address..."}
                      </span>
                    </div>
                    <button className="pill block" type="button" onClick={handleClaimFaucet}>
                      Use Testnet Faucet (+250 USDG)
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="field">
                      <span className="field-top">
                        <span className="mono">Amount to {activeTab === "send" ? "Send" : "Shield"}</span>
                        <span className="mono" style={{ fontSize: "11px" }}>
                          Max: {vault?.balanceUSDG.toFixed(2)} USDG
                        </span>
                      </span>
                      <span className="field-row">
                        <input
                          inputMode="decimal"
                          placeholder="0.00"
                          aria-label="Amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="unit">USDG</span>
                      </span>
                    </label>

                    <div className="quote num">
                      <div className="row">
                        <span>Relayer Sponsorship Fee</span>
                        <span>0.05 USDG</span>
                      </div>
                      <div className="row">
                        <span>ETH Gas required</span>
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>0.00 ETH (Free)</span>
                      </div>
                    </div>

                    <button
                      className="pill block"
                      type="button"
                      disabled={isProcessing}
                      onClick={handleAction}
                    >
                      {isProcessing
                        ? "Broadcasting via Relayer..."
                        : activeTab === "send"
                        ? "Sign with WOTS Key & Transfer"
                        : "Deposit to Private STARK Pool"}
                    </button>
                  </>
                )}

                <p className="note" style={{ fontSize: "12px", marginTop: "8px" }}>
                  One-time post-quantum signatures enforce that a key is never reused twice.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
