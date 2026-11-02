import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { FEE_TIERS } from "@orven/product-config";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";

export default function LockPage() {
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lockAmount, setLockAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault() || BrowserVaultManager.createVault();
    setVault(existing);
  }, []);

  const handleLock = () => {
    if (!vault) return;
    const amount = parseFloat(lockAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid ORVEN amount to lock");
      return;
    }

    try {
      setIsProcessing(true);
      const { vault: updated, txHash } = BrowserVaultManager.lockTokens(amount);
      setVault({ ...updated });
      setLockAmount("");
      setMessage(`Successfully locked ${amount.toLocaleString()} ORVEN for 7 days! Tx: ${txHash.slice(0, 10)}... (WOTS Key #${updated.currentKeyIndex - 1} retired)`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || "Lock failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const getActiveTier = () => {
    const locked = mounted && vault ? vault.lockedORVEN : 0;
    if (locked >= 500_000) return { tier: "Tier 3", fee: "0%", discount: "100% (Free)" };
    if (locked >= 250_000) return { tier: "Tier 2", fee: "0.10%", discount: "50%" };
    if (locked >= 100_000) return { tier: "Tier 1", fee: "0.15%", discount: "25%" };
    return { tier: "Tier 0", fee: "0.20%", discount: "0%" };
  };

  const currentTier = getActiveTier();

  return (
    <Layout>
      <Head>
        <title>Lock ORVEN · Orven</title>
        <meta
          name="description"
          content="Lock ORVEN tokens on Robinhood Chain to reduce your trading fees across all Orven swaps to as low as 0%."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Lock</span>
            </div>
            <h1>Lock ORVEN</h1>
            <p>
              Lock ORVEN tokens to receive substantial fee discounts across the entire Orven
              ecosystem, from public swaps to vault orders.
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: "12px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              marginBottom: "20px",
              borderRadius: "4px",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}

        <div className="layout">
          <div className="stack">
            <section className="panel">
              <div className="panel-head">
                <h2>Fee Discount Schedule</h2>
                <span className="mono" style={{ color: "#16a34a" }}>
                  Active Status: {currentTier.tier} ({currentTier.fee} Fee)
                </span>
              </div>
              <table className="trades">
                <thead>
                  <tr>
                    <th>ORVEN Locked</th>
                    <th>Effective Swap Fee</th>
                    <th>Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_TIERS.map((tier) => (
                    <tr
                      key={tier.label}
                      style={{
                        background:
                          currentTier.fee === tier.feePercent ? "rgba(217, 56, 30, 0.08)" : undefined,
                      }}
                    >
                      <td>
                        <b>{tier.label}</b>{" "}
                        {currentTier.fee === tier.feePercent && (
                          <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
                            (Current Tier)
                          </span>
                        )}
                      </td>
                      <td className="num">{tier.feePercent}</td>
                      <td>
                        {tier.feeBps === 0 ? (
                          <span style={{ color: "#16a34a", fontWeight: "700" }}>100% (Free)</span>
                        ) : (
                          `${((20 - tier.feeBps) / 20) * 100}%`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="panel-body">
                <p className="note">
                  Locked tokens are held in the OrvenLock contract for a minimum duration of 7 days.
                  Unlocking requires a cooling-off period before full withdrawal.
                </p>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="panel" aria-label="Lock Action">
              <div className="panel-head">
                <h2>Lock Tokens</h2>
              </div>
              <div className="panel-body stack">
                <div style={{ padding: "12px", background: "var(--soft)", borderRadius: "6px" }}>
                  <span className="mono" style={{ fontSize: "11px" }}>Currently Locked</span>
                  <div className="num" style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>
                    {mounted && vault ? vault.lockedORVEN.toLocaleString() : "0"} ORVEN{" "}
                    <span style={{ fontSize: "13px", color: "var(--mute)" }}>
                      ({currentTier.tier}: {currentTier.fee})
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: "11px", color: "var(--mute)", marginTop: "4px" }}>
                    Available: {mounted && vault ? vault.balanceORVEN.toLocaleString() : "0"} ORVEN
                  </div>
                </div>

                <label className="field">
                  <span className="field-top">
                    <span className="mono">Amount to Lock</span>
                  </span>
                  <span className="field-row">
                    <input
                      placeholder="e.g. 100000"
                      inputMode="decimal"
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                    />
                    <span className="unit">ORVEN</span>
                  </span>
                </label>

                <div style={{ display: "flex", gap: "6px" }}>
                  {[100_000, 250_000, 500_000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="pill small ghost"
                      onClick={() => setLockAmount(amt.toString())}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>

                <button
                  className="pill block"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleLock}
                >
                  {isProcessing ? "Broadcasting Lock Order..." : "Lock ORVEN (7 Days)"}
                </button>

                <p className="note">
                  Locking is an on-chain transaction. Gas fees are sponsored when locked from your
                  Orven Vault.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
