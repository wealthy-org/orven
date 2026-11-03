import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { useToast } from "@/lib/toast";

export default function TidePage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [agentKeyInput, setAgentKeyInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault() || BrowserVaultManager.createVault();
    setVault(existing);
  }, []);

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

      <div className="wrap page">
        <div className="page-head">
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
                <h2>Epoch 1 Overview</h2>
                <span className="mono" style={{ color: "#16a34a" }}>
                  Active Epoch
                </span>
              </div>
              <div className="panel-body stack">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                    gap: "16px",
                  }}
                >
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "6px" }}>
                    <span className="mono">Your Points</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(22px, 3vw, 26px)",
                        fontWeight: "700",
                        marginTop: "4px",
                      }}
                    >
                      {isAgentLinked ? "2,130" : "1,420"}
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "6px" }}>
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
                      {isAgentLinked ? "1.5x (Agent)" : "1.0x (Standard)"}
                    </div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--soft)", borderRadius: "6px" }}>
                    <span className="mono">Epoch Ends In</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(22px, 3vw, 26px)",
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
                <h2>Weekly Activity Streak</h2>
                <span className="mono" style={{ color: "var(--red)" }}>
                  Streak Bonus: +20%
                </span>
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
            <section className="panel" aria-label="Agent Linking">
              <div className="panel-head">
                <h2>Link Autonomous Agent</h2>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  Link your local agent's MCP identity to your Orven Vault to attribute automated
                  trading and task points to your personal account.
                </p>

                {isAgentLinked ? (
                  <div
                    style={{
                      padding: "14px",
                      background: "var(--soft)",
                      borderRadius: "6px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span
                      className="mono"
                      style={{ color: "#16a34a", fontSize: "12px", display: "block" }}
                    >
                      ● Agent Verified & Linked
                    </span>
                    <div
                      className="mono"
                      style={{ fontSize: "11px", wordBreak: "break-all", marginTop: "6px" }}
                    >
                      {vault?.linkedAgent}
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="field">
                      <span className="field-top">
                        <span className="mono">Agent Public Key / Digest</span>
                      </span>
                      <span className="field-row">
                        <input
                          placeholder="e.g. 0x89ab...c102"
                          value={agentKeyInput}
                          onChange={(e) => setAgentKeyInput(e.target.value)}
                        />
                      </span>
                    </label>

                    <button
                      className="pill block"
                      type="button"
                      disabled={isLinking}
                      onClick={handleLinkAgent}
                    >
                      {isLinking ? "Verifying Agent Key..." : "Link Agent (1.5x Boost)"}
                    </button>
                  </>
                )}

                <p className="note" style={{ fontSize: "12px", marginTop: "8px" }}>
                  Autonomous agents query the local MCP server over stdio to settle trades and escrow
                  without user intervention.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
