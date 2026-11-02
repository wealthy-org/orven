import React from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { ROBINHOOD_TESTNET, TOKENS, FEE_TIERS } from "@orven/product-config";

export default function DocsPage() {
  return (
    <Layout>
      <Head>
        <title>Docs · Orven Protocol</title>
        <meta
          name="description"
          content="Orven Protocol Documentation: Architecture, smart contracts, post-quantum vaults, and API specifications."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Documentation</span>
            </div>
            <h1>Orven Architecture & Guide</h1>
            <p>
              Complete technical specification for human users, agent developers, and node operators
              on Robinhood Chain.
            </p>
          </div>
        </div>

        <div className="layout">
          <div className="stack">
            <section className="panel">
              <div className="panel-head">
                <h2>1. Post-Quantum WOTS Vaults</h2>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  Orven vaults use <b>Winternitz One-Time Signatures (WOTS)</b> derived locally from a
                  32-byte master seed. The primary cryptographic invariant is:{" "}
                  <i>One WOTS key must never sign two different messages.</i>
                </p>
                <p className="note">
                  Every transaction increments the monotonic key index. If a transaction drops or reverts,
                  retry routines transmit the identical signed bytes to prevent catastrophic key reuse.
                </p>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>2. Network & Asset Specifications</h2>
              </div>
              <table className="trades">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Network</td>
                    <td><b>{ROBINHOOD_TESTNET.name}</b></td>
                    <td>Chain ID: <code>{ROBINHOOD_TESTNET.id}</code></td>
                  </tr>
                  <tr>
                    <td>Primary Currency</td>
                    <td><b>USDG</b> (Global Dollar)</td>
                    <td><code>{TOKENS.USDG.address}</code> (6 decimals)</td>
                  </tr>
                  <tr>
                    <td>Wrapped Ether</td>
                    <td><b>WETH</b></td>
                    <td><code>{TOKENS.WETH.address}</code> (18 decimals)</td>
                  </tr>
                  <tr>
                    <td>Relayer Fee</td>
                    <td className="num">0.05 USDG</td>
                    <td>Sponsored gas (~120k gas equivalent)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>3. Local Service Endpoints</h2>
              </div>
              <table className="trades">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Port</th>
                    <th>Health Endpoint</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Web Application</td>
                    <td><code>3000</code></td>
                    <td><a href="http://localhost:3000/vault" className="link">/vault</a></td>
                  </tr>
                  <tr>
                    <td>Application & Relayer API</td>
                    <td><code>4010</code></td>
                    <td><a href="http://localhost:4010/health" className="link">/health</a></td>
                  </tr>
                  <tr>
                    <td>AI Task Gateway</td>
                    <td><code>4020</code></td>
                    <td><a href="http://localhost:4020/health" className="link">/health</a></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <aside className="side">
            <section className="panel">
              <div className="panel-head">
                <h2>Navigation</h2>
              </div>
              <div className="panel-body stack">
                <a href="#section-1" className="link mono" style={{ display: "block" }}>
                  1. WOTS Vaults
                </a>
                <a href="#section-2" className="link mono" style={{ display: "block" }}>
                  2. Network & Tokens
                </a>
                <a href="#section-3" className="link mono" style={{ display: "block" }}>
                  3. Service Endpoints
                </a>
                <a href="/agents" className="link mono" style={{ display: "block", marginTop: "12px", color: "var(--red)" }}>
                  → Agent MCP Guide
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
