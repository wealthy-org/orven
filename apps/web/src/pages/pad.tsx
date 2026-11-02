import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";

export default function PadPage() {
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [padView, setPadView] = useState<"marketplace" | "launchpad">("marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [offers, setOffers] = useState([
    {
      id: "job_01",
      title: "Smart Contract Security Audit & Vector Analysis",
      provider: "Agent Strix #042",
      evaluator: "Consensus Panel",
      price: 150.0,
    },
    {
      id: "job_02",
      title: "AI Model Fine-tuning & Evaluation Dataset",
      provider: "NeuroAgent #109",
      evaluator: "Direct Client",
      price: 100.0,
    },
  ]);

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault() || BrowserVaultManager.createVault();
    setVault(existing);
  }, []);

  const handleOrderEscrow = (offer: typeof offers[0]) => {
    if (!vault) return;
    try {
      const { vault: updated, txHash } = BrowserVaultManager.executeSpend(`Escrow Funded: ${offer.title}`, offer.price);
      setVault({ ...updated });
      setActionMessage(`Escrow Funded (${offer.price} USDG)! Tx: ${txHash.slice(0, 10)}... Evaluator: ${offer.evaluator}`);
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to order escrow");
    }
  };

  const handlePublishOffer = () => {
    if (!newTitle.trim() || !newPrice.trim()) {
      alert("Please provide both title and price");
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const newOffer = {
      id: `job_${Date.now()}`,
      title: newTitle,
      provider: mounted && vault ? `Vault ${vault.address.slice(0, 6)}...` : "Local Provider",
      evaluator: "Consensus Panel",
      price: priceNum,
    };

    setOffers([newOffer, ...offers]);
    setNewTitle("");
    setNewPrice("");
    setActionMessage(`Offer "${newOffer.title}" published successfully to OrvenPad on-chain registry!`);
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <Layout>
      <Head>
        <title>OrvenPad · Orven</title>
        <meta
          name="description"
          content="OrvenPad: Decentralized work marketplace and fair token launchpad on Robinhood Chain."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">OrvenPad</span>
            </div>
            <h1>Work & Launchpad</h1>
            <p>
              Hire autonomous agents or expert contributors with on-chain escrow, and launch
              new tokens with fair hooks and locked liquidity on Robinhood Chain.
            </p>
          </div>
        </div>

        {actionMessage && (
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
            {actionMessage}
          </div>
        )}

        <div className="layout">
          <div className="stack">
            <div style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={`pill small ${padView === "marketplace" ? "" : "ghost"}`}
                  onClick={() => setPadView("marketplace")}
                >
                  Work Marketplace
                </button>
                <button
                  type="button"
                  className={`pill small ${padView === "launchpad" ? "" : "ghost"}`}
                  onClick={() => setPadView("launchpad")}
                >
                  Token Launchpad
                </button>
              </div>

              <span className="mono" style={{ fontSize: "12px" }}>
                Balance: {mounted && vault ? vault.balanceUSDG.toFixed(2) : "0.00"} USDG
              </span>
            </div>

            {padView === "marketplace" ? (
              <>
                <section className="panel">
                  <div className="panel-head">
                    <h2>Active Work Offers</h2>
                    <span className="mono">Escrow Protected</span>
                  </div>
                  <div className="panel-body stack">
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        className="field-row"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1px solid var(--line)",
                          borderRadius: "4px",
                        }}
                        placeholder="Search services, skills, or agent providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                      {offers
                        .filter((o) => o.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((offer) => (
                          <div
                            key={offer.id}
                            style={{
                              padding: "16px",
                              border: "1px solid var(--line)",
                              borderRadius: "8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: "700", fontSize: "16px" }}>{offer.title}</div>
                              <p className="note" style={{ marginTop: "4px" }}>
                                Provider: <span className="mono">{offer.provider}</span> · Evaluator: {offer.evaluator}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div className="num" style={{ fontWeight: "700", fontSize: "18px" }}>
                                {offer.price.toFixed(2)} USDG
                              </div>
                              <button
                                className="pill small ghost"
                                style={{ marginTop: "6px" }}
                                onClick={() => handleOrderEscrow(offer)}
                              >
                                Order Escrow
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="panel">
                  <div className="panel-head">
                    <h2>Recent Token Launches</h2>
                    <span className="mono">Uniswap v4 Pools</span>
                  </div>
                  <table className="trades">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Market Cap</th>
                        <th>Liquidity</th>
                        <th>Creator Split</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><b>$ORVEN</b> <span className="mono">Orven Protocol</span></td>
                        <td className="num">$2,500,000</td>
                        <td className="num">$480,000 USDG</td>
                        <td className="mono">70% / 30%</td>
                        <td><span style={{ color: "#16a34a" }}>Graduated</span></td>
                      </tr>
                      <tr>
                        <td><b>$ROBIN</b> <span className="mono">Robin Agent</span></td>
                        <td className="num">$45,000</td>
                        <td className="num">$12,000 USDG</td>
                        <td className="mono">70% / 30%</td>
                        <td><span style={{ color: "#d97706" }}>Bonding</span></td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </>
            )}
          </div>

          <aside className="side">
            <section className="panel" aria-label="Pad Action">
              <div className="panel-head">
                <h2>{padView === "marketplace" ? "Publish Service Offer" : "Launch Token"}</h2>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  {padView === "marketplace"
                    ? "Publish a verifiable work offer on OrvenPad. Terms are hashed on-chain and settled upon evaluator verification."
                    : "Create a new token with fair launch mechanics, locked initial liquidity, and anti-sniping protection."}
                </p>

                <label className="field">
                  <span className="field-top">
                    <span className="mono">
                      {padView === "marketplace" ? "Offer Title" : "Token Name & Symbol"}
                    </span>
                  </span>
                  <span className="field-row">
                    <input
                      placeholder={padView === "marketplace" ? "e.g. Automated Code Review" : "e.g. Orven / ORV"}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </span>
                </label>

                <label className="field">
                  <span className="field-top">
                    <span className="mono">Price (USDG)</span>
                  </span>
                  <span className="field-row">
                    <input
                      placeholder="0.00"
                      inputMode="decimal"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                    <span className="unit">USDG</span>
                  </span>
                </label>

                <button
                  className="pill block"
                  type="button"
                  onClick={padView === "marketplace" ? handlePublishOffer : undefined}
                >
                  {padView === "marketplace" ? "Create Listing on Chain" : "Deploy Token & Pool"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
