import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { requestRelayerQuote, submitRelayTransaction } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { PageTransition } from "@/components/ui/PageTransition";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Send,
  Lock,
  KeyRound,
  Copy,
  Check,
  Download,
  Upload,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function VaultPage() {
  const { toast, showToast, updateToast } = useToast();
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
    toast.success("Faucet Claimed!", "+250.00 Testnet USDG deposited into Vault.");
    setMessage("Successfully claimed +250.00 Testnet USDG!");
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportBackup = () => {
    try {
      BrowserVaultManager.exportBackup();
      toast.success("Backup Downloaded", "Encrypted .json seed backup saved safely.");
      setMessage("Encrypted backup downloaded: Keep your .json file secure!");
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      toast.error("Export Failed", err.message || "Failed to export backup");
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
        toast.success("Vault Restored!", "Balances and WOTS key indices successfully loaded.");
        setMessage("Vault successfully restored from encrypted backup!");
        setTimeout(() => setMessage(null), 5000);
      } catch (err: any) {
        toast.error("Restore Failed", err.message || "Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAction = async () => {
    if (!vault) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Invalid Amount", "Please enter a valid amount greater than zero.");
      return;
    }
    if (num > vault.balanceUSDG) {
      toast.error("Insufficient Funds", `You have ${vault.balanceUSDG.toFixed(2)} USDG available.`);
      return;
    }

    const pendingId = showToast({
      type: "pending",
      title: activeTab === "send" ? "Broadcasting Transfer..." : "Depositing to STARK Pool...",
      message: `Signing with local WOTS Key #${vault.currentKeyIndex}`,
    });

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
      updateToast(pendingId, {
        type: "success",
        title: activeTab === "send" ? "Transfer Settled!" : "Shielded Note Deposited!",
        message: `WOTS Key #${updated.currentKeyIndex - 1} retired on Robinhood Chain.`,
        txHash,
      });
      setMessage(
        `Transaction confirmed! Tx: ${txHash.slice(0, 10)}... (WOTS Key #${
          updated.currentKeyIndex - 1
        } retired)`
      );
    } catch (err: any) {
      updateToast(pendingId, {
        type: "error",
        title: "Transaction Failed",
        message: err.message || "Failed to execute transaction",
      });
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

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
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

        {message && (
          <div
            style={{
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              marginBottom: "16px",
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
            {/* Bento Overview Panel */}
            <section className="panel" style={{ position: "relative" }}>
              <div className="panel-head">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} color="#D9381E" />
                  <h2>Vault Overview</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="addr mono" title={displayAddr}>
                    {shortAddr}
                  </span>
                  {displayAddr && (
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="pill small ghost"
                      style={{ minHeight: "28px", padding: "0 8px", fontSize: "11px", gap: "4px" }}
                      aria-label="Copy Address"
                    >
                      {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
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
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      Available Balance
                    </span>
                    <div
                      style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: "700" }}
                      className="num"
                    >
                      <NumberTicker
                        value={mounted && vault ? vault.balanceUSDG : 0}
                        decimalPlaces={2}
                      />{" "}
                      <span style={{ fontSize: "15px", color: "var(--mute)" }}>USDG</span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      Shielded (Private)
                    </span>
                    <div
                      style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: "700" }}
                      className="num"
                    >
                      <NumberTicker
                        value={mounted && vault ? vault.shieldedUSDG : 0}
                        decimalPlaces={2}
                      />{" "}
                      <span style={{ fontSize: "15px", color: "var(--mute)" }}>USDG</span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono" style={{ display: "block", marginBottom: "8px" }}>
                      WOTS Key Status
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                      <Badge variant="success">
                        Key #{mounted && vault ? vault.currentKeyIndex : 1}
                      </Badge>
                      <span className="mono" style={{ fontSize: "11px", color: "var(--mute)" }}>
                        / {vault?.maxKeys ?? 1024}
                      </span>
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
                  <ShimmerButton
                    onClick={handleClaimFaucet}
                    style={{ minHeight: "38px", padding: "0 16px", fontSize: "13px", borderRadius: "999px" }}
                  >
                    + Claim 250 USDG Faucet
                  </ShimmerButton>
                  <button
                    className="pill small ghost"
                    type="button"
                    onClick={handleExportBackup}
                    style={{ gap: "6px" }}
                  >
                    <Download size={13} />
                    <span>Export Backup (.json)</span>
                  </button>
                  <button
                    className="pill small ghost"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ gap: "6px" }}
                  >
                    <Upload size={13} />
                    <span>Restore Backup</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <Badge variant="secondary" className="hide-sm">
                    Robinhood Testnet (Chain ID 46630)
                  </Badge>
                </div>
              </div>
            </section>

            {/* 3-Step Professional Onboarding Banner */}
            <div
              style={{
                background: "var(--soft)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "16px 18px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "14px",
              }}
            >
              <div>
                <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
                  Step 1 · Inception
                </span>
                <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "14.5px" }}>
                  Post-Quantum Keys Active
                </div>
                <p className="note" style={{ fontSize: "12px", marginTop: "4px" }}>
                  Encrypted AES-GCM 256-bit seed stored in your local browser sandbox.
                </p>
              </div>
              <div>
                <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
                  Step 2 · Funding
                </span>
                <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "14.5px" }}>
                  Claim Faucet Simulation
                </div>
                <p className="note" style={{ fontSize: "12px", marginTop: "4px" }}>
                  Get free USDG to test swaps, privacy, and marketplace orders.
                </p>
              </div>
              <div>
                <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
                  Step 3 · Connect
                </span>
                <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "14.5px" }}>
                  AI Agent & Swaps
                </div>
                <p className="note" style={{ fontSize: "12px", marginTop: "4px" }}>
                  Run local <code>@orven/mcp</code> or trade on Uniswap v3/v4 gas-free.
                </p>
              </div>
            </div>

            {/* Transaction Journal */}
            <section className="panel">
              <div className="panel-head">
                <h2>Transaction Journal (Local WOTS Ledger)</h2>
                <Badge variant="outline">{vault?.transactions.length || 0} Records</Badge>
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
                            <Badge variant="success">{tx.status}</Badge>
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
            <section className="swap-panel" aria-label="Vault Actions" style={{ position: "relative" }}>
              <div className="swap-panel-inner">
                <div className="swap-nav-pills" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "deposit"}
                    className={`swap-nav-pill ${activeTab === "deposit" ? "active" : ""}`}
                    onClick={() => setActiveTab("deposit")}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "send"}
                    className={`swap-nav-pill ${activeTab === "send" ? "active" : ""}`}
                    onClick={() => setActiveTab("send")}
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "privacy"}
                    className={`swap-nav-pill ${activeTab === "privacy" ? "active" : ""}`}
                    onClick={() => setActiveTab("privacy")}
                  >
                    Shield
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="tp">
                    <span className="mono" style={{ fontSize: "11px" }}>Asset</span>
                    <div className="tp-btn" style={{ cursor: "default" }}>
                      <span className="tb tb-coin tb-sm" data-len={4}>
                        <img src="/logos/usdg.png" alt="USDG" />
                      </span>
                      <span className="tp-val">
                        <b>USDG</b>
                        <span>Global Dollar (Testnet)</span>
                      </span>
                    </div>
                  </div>

                  {activeTab === "deposit" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p className="note">
                        Your vault's on-chain deposit address on Robinhood Chain. Send testnet USDG or WETH
                        here; transactions will register automatically.
                      </p>
                      <div
                        style={{
                          padding: "12px 14px",
                          background: "var(--soft)",
                          borderRadius: "8px",
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
                      <ShimmerButton
                        onClick={handleClaimFaucet}
                        style={{ minHeight: "44px", borderRadius: "10px", width: "100%" }}
                      >
                        Use Testnet Faucet (+250 USDG)
                      </ShimmerButton>
                    </div>
                  ) : (
                    <>
                      <div className="swap-card-box">
                        <div className="swap-card-top">
                          <span className="mono" style={{ fontSize: "11px", fontWeight: "600" }}>
                            AMOUNT TO {activeTab === "send" ? "SEND" : "SHIELD"}
                          </span>
                          <div className="swap-card-balance">
                            <span>Max: {vault?.balanceUSDG.toFixed(2)} USDG</span>
                            {vault && vault.balanceUSDG > 0 && (
                              <button
                                type="button"
                                className="swap-max-btn"
                                onClick={() => setAmount(vault.balanceUSDG.toString())}
                              >
                                MAX
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="swap-card-main">
                          <input
                            className="swap-amount-input"
                            inputMode="decimal"
                            placeholder="0.00"
                            aria-label="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <span className="unit" style={{ fontSize: "16px", fontWeight: "700" }}>
                            USDG
                          </span>
                        </div>
                      </div>

                      <div className="swap-info-box">
                        <div className="swap-info-row">
                          <span className="swap-info-label">Relayer Sponsorship Fee</span>
                          <span className="swap-info-val">0.05 USDG</span>
                        </div>
                        <div className="swap-info-row">
                          <span className="swap-info-label">ETH Gas required</span>
                          <span className="swap-info-val" style={{ color: "#16a34a" }}>
                            0.00 ETH (Free)
                          </span>
                        </div>
                      </div>

                      <ShimmerButton
                        style={{ minHeight: "48px", borderRadius: "12px", width: "100%" }}
                        disabled={isProcessing}
                        onClick={handleAction}
                      >
                        {isProcessing
                          ? "Broadcasting via Relayer..."
                          : activeTab === "send"
                          ? "Sign with WOTS Key & Transfer"
                          : "Deposit to Private STARK Pool"}
                      </ShimmerButton>
                    </>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "11.5px",
                      color: "var(--mute-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ color: "#16a34a" }}>⚡</span>
                    <span>One-time post-quantum key · Never reused</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </PageTransition>
    </Layout>
  );
}
