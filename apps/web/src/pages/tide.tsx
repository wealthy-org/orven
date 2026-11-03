import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { useToast } from "@/lib/toast";
import { useNetwork } from "@/lib/network";
import { PageTransition } from "@/components/ui/PageTransition";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { Badge } from "@/components/ui/Badge";
import { Award, Zap, Calendar, Flame, Bot, KeyRound } from "lucide-react";

export default function TidePage() {
  const { toast } = useToast();
  const { isMainnet } = useNetwork();
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [agentKeyInput, setAgentKeyInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault(isMainnet) || BrowserVaultManager.createVault(isMainnet);
    setVault(existing);
  }, [isMainnet]);

  const handleLinkAgent = () => {
    if (!vault) return;
    if (!agentKeyInput.trim()) {
      toast.error("Invalid Input", "Please enter a valid agent public key or digest.");
      return;
    }

    try {
      setIsLinking(true);
      const { vault: updated, txHash } = BrowserVaultManager.linkAgent(agentKeyInput.trim());
      setVault({ ...updated });
      setAgentKeyInput("");
      toast.success(
        "Agent Linked Successfully!",
        "1.5x Rewards Multiplier activated on Robinhood Chain.",
        txHash
      );
      setMessage(
        `Agent successfully linked to Vault! Tx: ${txHash.slice(
          0,
          10
        )}... Multiplier 1.5x activated.`
      );
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      toast.error("Agent Linking Failed", err.message || "Execution error");
      alert(err.message || "Linking failed");
    } finally {
      setIsLinking(false);
    }
  };

  const isAgentLinked = mounted && vault && !!vault.linkedAgent;

  return (
    <Layout>
      <Head>
        <title>Orven Tide · Orven</title>
        <meta
          name="description"
          content="Orven Tide: The agent performance and liquidity rewards program on Robinhood Chain."
        />
      </Head>

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Orven Tide</span>
            </div>
            <h1>Tide Rewards</h1>
            <p>
              Earn points for active vault usage, payment channel routing, autonomous agent tasks,
              and liquidity provision on Robinhood Chain.
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
            {/* Epoch Overview Widget */}
            <section className="panel">
              <div className="panel-head">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={18} color="#D9381E" />
                  <h2>Epoch 1 Overview</h2>
                </div>
                <Badge variant="success">Active Epoch</Badge>
              </div>
              <div className="panel-body stack">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                    gap: "16px",
                  }}
                >
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <span className="mono">Your Points</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(22px, 3vw, 26px)",
                        fontWeight: "700",
                        marginTop: "4px",
                      }}
                    >
                      <NumberTicker
                        value={isAgentLinked ? 2130 : 1420}
                        decimalPlaces={0}
                      />
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <span className="mono">Multiplier</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(20px, 2.8vw, 24px)",
                        fontWeight: "700",
                        marginTop: "4px",
                        color: isAgentLinked ? "#16a34a" : undefined,
                      }}
                    >
                      {isAgentLinked ? (
                        <Badge variant="success" size="md">1.5x Boost Active</Badge>
                      ) : (
                        "1.0x Standard"
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <span className="mono">Epoch Ends In</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(20px, 2.6vw, 24px)",
                        fontWeight: "700",
                        marginTop: "4px",
                      }}
                    >
                      4d 18h
                    </div>
                  </div>
                </div>

                <p className="note" style={{ marginTop: "8px" }}>
                  Points are computed deterministically per epoch based on net fee volume, agent activity
                  frequency, and verifiable work completions. Rewards distribute directly to your linked
                  Orven Vault upon epoch finalization.
                </p>
              </div>
            </section>

            {/* 7-Day Activity Streak Widget */}
            <section className="panel">
              <div className="panel-head">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} color="#D9381E" />
                  <h2>Weekly Activity Streak</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Flame size={14} color="#D9381E" />
                  <Badge variant="destructive">Streak Bonus: +20%</Badge>
                </div>
              </div>
              <div className="panel-body stack" style={{ padding: "0 0 16px" }}>
                <ul className="tide-days">
                  <li className="on">
                    <span className="mono">Mon</span>
                    <b>120</b>
                    <span className="tide-day-st">Active</span>
                  </li>
                  <li className="on">
                    <span className="mono">Tue</span>
                    <b>140</b>
                    <span className="tide-day-st">Active</span>
                  </li>
                  <li className="on">
                    <span className="mono">Wed</span>
                    <b>190</b>
                    <span className="tide-day-st">Active</span>
                  </li>
                  <li className="on">
                    <span className="mono">Thu</span>
                    <b>210</b>
                    <span className="tide-day-st">Today</span>
                  </li>
                  <li>
                    <span className="mono">Fri</span>
                    <b>—</b>
                    <span className="tide-day-st">Pending</span>
                  </li>
                  <li>
                    <span className="mono">Sat</span>
                    <b>—</b>
                    <span className="tide-day-st">Pending</span>
                  </li>
                  <li>
                    <span className="mono">Sun</span>
                    <b>—</b>
                    <span className="tide-day-st">Pending</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Rules Table */}
            <section className="panel">
              <div className="panel-head">
                <h2>Point Distribution Rules</h2>
              </div>
              <div className="table-container">
                <table className="trades">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Points Awarded</th>
                      <th>Multiplier Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Vault Swap Volume</td>
                      <td className="num">100 pts / $1 USDG fee</td>
                      <td>Up to $20 fee/pair daily</td>
                    </tr>
                    <tr>
                      <td>Active Days Streak</td>
                      <td className="num">+20% / 3 days</td>
                      <td>Up to +50% at 7 consecutive days</td>
                    </tr>
                    <tr>
                      <td>Work Escrow Completion</td>
                      <td className="num">250 pts / job</td>
                      <td>Evaluator approved deliverables</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="swap-panel" aria-label="Agent Linking" style={{ position: "relative" }}>
              <div className="swap-panel-inner">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <Bot size={18} color="#D9381E" />
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>Link Autonomous Agent</div>
                </div>
                <div className="form-stack">
                  <p className="note" style={{ fontSize: "12.5px" }}>
                    Link your local agent's MCP identity to your Orven Vault to attribute automated
                    trading and task points to your personal account.
                  </p>

                  {isAgentLinked ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "var(--soft)",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }} />
                        <span className="mono" style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600" }}>
                          Agent Verified & Linked
                        </span>
                      </div>
                      <div
                        className="mono"
                        style={{ fontSize: "11px", wordBreak: "break-all", marginTop: "8px" }}
                      >
                        {vault?.linkedAgent}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          <KeyRound size={12} color="#D9381E" />
                          <span>Agent Public Key / Digest</span>
                        </label>
                        <input
                          className="form-control mono-input"
                          placeholder="0x89ab...c102 (minimum 8 characters)"
                          value={agentKeyInput}
                          onChange={(e) => setAgentKeyInput(e.target.value)}
                        />
                      </div>

                      <ShimmerButton
                        style={{ minHeight: "44px", borderRadius: "10px", width: "100%", marginTop: "2px" }}
                        disabled={isLinking}
                        onClick={handleLinkAgent}
                      >
                        {isLinking ? "Verifying Agent Key..." : "Link Agent (1.5x Boost)"}
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
                    <Zap size={12} color="#16a34a" />
                    <span>Autonomous agents query local MCP via stdio</span>
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
