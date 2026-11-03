import React, { useState } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { executeAITask } from "@/lib/api";

export default function AgentsPage() {
  const [testPrompt, setTestPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("orven-gpt-4o");
  const [isExecuting, setIsExecuting] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);

  const handleRunTask = async () => {
    if (!testPrompt.trim()) return;
    try {
      setIsExecuting(true);
      setAgentOutput("Connecting to Orven AI Gateway (Port 4020) & reserving credit...");
      const res = await executeAITask(testPrompt, selectedModel);
      setAgentOutput(res.output || JSON.stringify(res, null, 2));
    } catch (err: any) {
      setAgentOutput(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Agents · Orven</title>
        <meta
          name="description"
          content="Orven Agent Tooling: Connect autonomous AI agents to your vault using the local MCP server on Robinhood Chain."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Agents</span>
            </div>
            <h1>AI Agents & Local MCP</h1>
            <p>
              Connect autonomous AI agents to your Orven Vault on Robinhood Chain using the local{" "}
              <code>@orven/mcp</code> server over stdio. Agents can trade, shield notes, hire
              contributors, and pay for services with zero ETH.
            </p>
          </div>
        </div>

        <div className="layout">
          <div className="stack" style={{ minWidth: 0 }}>
            <section className="panel">
              <div className="panel-head">
                <h2>Quick Installation (stdio)</h2>
                <span className="mono" style={{ color: "#16a34a" }}>
                  Testnet Ready
                </span>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  Run Orven's MCP server locally on your machine. Keys and seeds remain stored locally
                  in your private environment:
                </p>
                <div
                  style={{
                    background: "var(--ink)",
                    color: "#fff",
                    padding: "14px 18px",
                    borderRadius: "6px",
                    fontFamily: "var(--mono)",
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <code style={{ wordBreak: "break-all" }}>npx @orven/mcp@testnet</code>
                  <span className="mono" style={{ color: "var(--faint)", fontSize: "11px" }}>
                    Chain ID 46630
                  </span>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>
                    Claude Desktop & Cursor Configuration
                  </h3>
                  <div
                    style={{
                      background: "var(--soft)",
                      padding: "14px 18px",
                      borderRadius: "6px",
                      fontFamily: "var(--mono)",
                      fontSize: "12px",
                      overflowX: "auto",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <pre style={{ margin: 0, overflowX: "auto" }}>{`{
  "mcpServers": {
    "orven": {
      "command": "npx",
      "args": ["-y", "@orven/mcp@testnet"]
    }
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Available Agent Tools (`@orven/mcp`)</h2>
              </div>
              <div className="table-container">
                <table className="trades">
                  <thead>
                    <tr>
                      <th>Tool Name</th>
                      <th>Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>open_vault</code>
                      </td>
                      <td>
                        <span className="mono">Vault</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Initialize post-quantum token vault on Robinhood Chain.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>balance</code>
                      </td>
                      <td>
                        <span className="mono">Vault</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Read spendable and private shielded USDG balance.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>orven_swap_quote</code>
                      </td>
                      <td>
                        <span className="mono">Trading</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Calculate optimal route, min-out, and slippage on Uniswap v3/v4.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>private_shield</code>
                      </td>
                      <td>
                        <span className="mono">Privacy</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Deposit USDG into STARK shielded note pool with local commitment.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>pad_search</code>
                      </td>
                      <td>
                        <span className="mono">Work</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Search active decentralized service offers on OrvenPad.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>pad_order</code>
                      </td>
                      <td>
                        <span className="mono">Work</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Fund on-chain escrow for autonomous work contracts.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>orven_ai</code>
                      </td>
                      <td>
                        <span className="mono">AI Gateway</span>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Execute metered inference tasks with atomic USDG payment.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="panel" aria-label="Agent Playground">
              <div className="panel-head">
                <h2>Agent AI Playground</h2>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  Simulate an autonomous agent invoking the <code>orven_ai</code> tool through the Orven
                  AI Gateway.
                </p>

                <div className="stack">
                  <div className="tp">
                    <span className="mono">Select Model</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "44px",
                        padding: "0 12px",
                        border: "1px solid var(--line-2)",
                        borderRadius: "6px",
                        fontFamily: "var(--sans)",
                        background: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      <option value="orven-gpt-4o">GPT-4o Omnimodel (0.005 USDG / 1k)</option>
                      <option value="orven-claude-3-5-sonnet">Claude 3.5 Sonnet (0.006 USDG / 1k)</option>
                      <option value="orven-flux-pro">Flux Pro Studio (0.04 USDG / img)</option>
                      <option value="orven-runway-gen3">Runway Gen-3 Video (0.25 USDG / 5s)</option>
                    </select>
                  </div>
                </div>

                <label className="field">
                  <span className="field-top">
                    <span className="mono">Task / Prompt</span>
                  </span>
                  <span className="field-row">
                    <input
                      placeholder="e.g. Analyze Robinhood Chain liquidity..."
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                    />
                  </span>
                </label>

                <button
                  className="pill block"
                  type="button"
                  disabled={isExecuting}
                  onClick={handleRunTask}
                >
                  {isExecuting ? "Executing AI Task..." : "Run Task via orven_ai"}
                </button>

                {agentOutput && (
                  <div
                    style={{
                      background: "var(--soft)",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid var(--line)",
                      fontSize: "12px",
                      fontFamily: "var(--mono)",
                      wordBreak: "break-all",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {agentOutput}
                  </div>
                )}

                <p className="note" style={{ fontSize: "12px", marginTop: "8px" }}>
                  Tasks are metered in micro-USDG and gas-sponsored by the Orven Relayer.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
