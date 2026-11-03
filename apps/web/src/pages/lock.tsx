import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { FEE_TIERS } from "@orven/product-config";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { useToast } from "@/lib/toast";

export default function LockPage() {
  const { toast } = useToast();
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
      toast.error("Invalid Amount", "Please enter a valid ORVEN amount to lock.");
      return;
    }

    try {
      setIsProcessing(true);
      const { vault: updated, txHash } = BrowserVaultManager.lockTokens(amount);
      setVault({ ...updated });
      setLockAmount("");
      toast.success(
        "Tokens Locked Successfully!",
        `Locked ${amount.toLocaleString()} ORVEN for 7 days. Discount updated!`,
        txHash
      );
      setMessage(
        `Successfully locked ${amount.toLocaleString()} ORVEN for 7 days! Tx: ${txHash.slice(
          0,
          10
        )}... (WOTS Key #${updated.currentKeyIndex - 1} retired)`
      );
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      toast.error("Lock Order Failed", err.message || "Execution error");
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
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              margin: "20px 0",
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
                <h2>Fee Discount Schedule</h2>
                <span className="mono" style={{ color: "#16a34a" }}>
                  Active: {currentTier.tier} ({currentTier.fee} Fee)
                </span>
              </div>
              <div className="table-container">
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
                            currentTier.fee === tier.feePercent
                              ? "rgba(217, 56, 30, 0.08)"
                              : undefined,
                        }}
                      >
                        <td>
                          <b>{tier.label}</b>{" "}
                          {currentTier.fee === tier.feePercent && (
                            <span
                              className="mono"
                              style={{ color: "var(--red)", fontSize: "11px", marginLeft: "6px" }}
                            >
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
              </div>
              <div className="panel-body">
                <p className="note">
                  Locked tokens are held in the OrvenLock contract for a minimum duration of 7 days.
                  Unlocking requires a cooling-off period before full withdrawal.
                </p>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="swap-panel" aria-label="Lock Action">
              <div className="swap-panel-inner">
                <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "14px" }}>
                  Lock Tokens
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "14px", background: "var(--soft)", borderRadius: "8px" }}>
                    <span className="mono" style={{ fontSize: "11px" }}>Currently Locked</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(18px, 2.4vw, 22px)",
                        fontWeight: "700",
                        marginTop: "4px",
                      }}
                    >
                      {mounted && vault ? vault.lockedORVEN.toLocaleString() : "0"} ORVEN{" "}
                      <span style={{ fontSize: "13px", color: "var(--mute)" }}>
                        ({currentTier.tier}: {currentTier.fee})
                      </span>
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: "11px", color: "var(--mute)", marginTop: "4px" }}
                    >
                      Available: {mounted && vault ? vault.balanceORVEN.toLocaleString() : "0"} ORVEN
                    </div>
                  </div>

                  <div className="swap-card-box">
                    <div className="swap-card-top">
                      <span className="mono" style={{ fontSize: "11px", fontWeight: "600" }}>
                        AMOUNT TO LOCK
                      </span>
                      <div className="swap-card-balance">
                        {vault && vault.balanceORVEN > 0 && (
                          <button
                            type="button"
                            className="swap-max-btn"
                            onClick={() => setLockAmount(vault.balanceORVEN.toString())}
                          >
                            MAX
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="swap-card-main">
                      <input
                        className="swap-amount-input"
                        placeholder="e.g. 100000"
                        inputMode="decimal"
                        value={lockAmount}
                        onChange={(e) => setLockAmount(e.target.value)}
                      />
                      <span className="unit" style={{ fontSize: "15px", fontWeight: "700" }}>
                        ORVEN
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[100_000, 250_000, 500_000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="pill small ghost"
                        onClick={() => setLockAmount(amt.toString())}
                        style={{ flex: "1 1 70px", minHeight: "34px", fontSize: "12px" }}
                      >
                        +{amt / 1000}k
                      </button>
                    ))}
                  </div>

                  <button
                    className="pill block"
                    style={{ minHeight: "48px", borderRadius: "12px", marginTop: "4px" }}
                    type="button"
                    disabled={isProcessing}
                    onClick={handleLock}
                  >
                    {isProcessing ? "Broadcasting Lock Order..." : "Lock ORVEN (7 Days)"}
                  </button>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "11.5px",
                      color: "var(--mute-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ color: "#16a34a" }}>⚡</span>
                    <span>Locking is on-chain · Gas sponsored by Vault</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
