import React, { useState } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { executeAITask } from "@/lib/api";
import { PageTransition } from "@/components/ui/PageTransition";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { Badge } from "@/components/ui/Badge";
import { Bot, Terminal, Cpu, Sparkles, Play, Code2, Copy, Check, Zap } from "lucide-react";

export default function AgentsPage() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("orven-gpt-4o");
  const [isExecuting, setIsExecuting] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("npx @orven/mcp@testnet");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleRunTask = async () => {
    if (!testPrompt.trim()) return;
    try {
      setIsExecuting(true);
      setAgentOutput("Connecting to Orven AI Gateway & reserving credit...");
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

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Terminal size={18} color="#D9381E" />
                  <h2>Quick Installation (stdio)</h2>
                </div>
                <Badge variant="success">Testnet Ready</Badge>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  Run Orven's MCP server locally on your machine. Keys and seeds remain stored locally
                  in your private environment:
                </p>
                <div className="code-snippet-bar">
                  <div className="code-snippet-cmd">
                    <span className="code-snippet-prompt">$</span>
                    <code style={{ color: "#F8FAFC" }}>npx @orven/mcp@testnet</code>
                    <Badge variant="secondary" size="sm" style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1", border: "0" }}>
                      Chain 46630
                    </Badge>
                  </div>
                  <button
                    type="button"
                    className="code-snippet-copy"
                    onClick={handleCopyCmd}
                    aria-label="Copy Command"
                  >
                    {copiedCmd ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    <span>{copiedCmd ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Code2 size={16} color="var(--mute-2)" />
                    <h3 style={{ fontSize: "14.5px" }}>
                      Claude Desktop & Cursor Configuration
                    </h3>
                  </div>
                  <div
                    style={{
                      background: "var(--soft)",
                      padding: "14px 18px",
                      borderRadius: "8px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Cpu size={18} color="#D9381E" />
                  <h2>Available Agent Tools (`@orven/mcp`)</h2>
                </div>
                <Badge variant="outline">7 Tools Registered</Badge>
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
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>open_vault</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Vault</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Initialize post-quantum token vault on Robinhood Chain.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>balance</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Vault</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Read spendable and private shielded USDG balance.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>orven_swap_quote</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Trading</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Calculate optimal route, min-out, and slippage on Uniswap v3/v4.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>private_shield</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Privacy</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Deposit USDG into STARK shielded note pool with local commitment.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>pad_search</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Work</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Search active decentralized service offers on OrvenPad.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>pad_order</code>
                      </td>
                      <td>
                        <Badge variant="secondary">Work</Badge>
                      </td>
                      <td style={{ whiteSpace: "normal" }}>
                        Fund on-chain escrow for autonomous work contracts.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code style={{ color: "var(--red-ink)", fontWeight: "600" }}>orven_ai</code>
                      </td>
                      <td>
                        <Badge variant="secondary">AI Gateway</Badge>
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
            <section className="swap-panel" aria-label="Agent Playground" style={{ position: "relative" }}>
              <div className="swap-panel-inner">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <Sparkles size={18} color="#D9381E" />
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>Agent AI Playground</div>
                </div>
                <div className="form-stack">
                  <p className="note" style={{ fontSize: "12.5px" }}>
                    Simulate an autonomous agent invoking the <code>orven_ai</code> tool through the Orven
                    AI Gateway.
                  </p>

                  <div className="form-group">
                    <label className="form-label">
                      <Cpu size={12} color="#D9381E" />
                      <span>Select Model</span>
                    </label>
                    <select
                      className="form-control"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <option value="orven-gpt-4o">GPT-4o Omnimodel (0.005 USDG / 1k)</option>
                      <option value="orven-claude-3-5-sonnet">Claude 3.5 Sonnet (0.006 USDG / 1k)</option>
                      <option value="orven-flux-pro">Flux Pro Studio (0.04 USDG / img)</option>
                      <option value="orven-runway-gen3">Runway Gen-3 Video (0.25 USDG / 5s)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label">
                        <Terminal size={12} color="#D9381E" />
                        <span>Prompt / Task</span>
                      </label>
                      <span className="mono" style={{ fontSize: "10.5px", color: "var(--mute-2)" }}>stdio</span>
                    </div>
                    <textarea
                      className="form-control form-textarea"
                      rows={3}
                      placeholder="Ask orven_ai to audit smart contracts, analyze liquidity pools, or execute tasks..."
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() => setTestPrompt("Analyze Robinhood Chain liquidity depth for ORVEN/USDG")}
                      >
                        + Liquidity Analysis
                      </button>
                      <button
                        type="button"
                        className="ai-chip-btn"
                        onClick={() => setTestPrompt("Audit WOTS signature verification and key monotonically")}
                      >
                        + Security Audit
                      </button>
                    </div>
                  </div>

                  <ShimmerButton
                    style={{ minHeight: "44px", borderRadius: "10px", width: "100%", marginTop: "2px" }}
                    disabled={isExecuting}
                    onClick={handleRunTask}
                  >
                    {isExecuting ? "Executing AI Task..." : "Run Task via orven_ai"}
                  </ShimmerButton>

                  {agentOutput && (
                    <div
                      style={{
                        background: "var(--soft)",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        fontSize: "12px",
                        fontFamily: "var(--mono)",
                        wordBreak: "break-all",
                        maxHeight: "220px",
                        overflowY: "auto",
                        lineHeight: 1.45,
                      }}
                    >
                      {agentOutput}
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "11px",
                      color: "var(--mute-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Zap size={12} color="#16a34a" />
                    <span>0.005 USDG / task · Sponsored gas via Relayer</span>
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
