import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { useToast } from "@/lib/toast";
import { PageTransition } from "@/components/ui/PageTransition";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { MotionCard } from "@/components/ui/MotionCard";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, Rocket, Search, ShieldCheck, PlusCircle } from "lucide-react";

export default function PadPage() {
  const { toast } = useToast();
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

  const handleOrderEscrow = (offer: (typeof offers)[0]) => {
    if (!vault) return;
    try {
      const { vault: updated, txHash } = BrowserVaultManager.executeSpend(
        `Escrow Funded: ${offer.title}`,
        offer.price
      );
      setVault({ ...updated });
      toast.success(
        "Escrow Funded!",
        `${offer.price} USDG locked in escrow contract.`,
        txHash
      );
      setActionMessage(
        `Escrow Funded (${offer.price} USDG)! Tx: ${txHash.slice(0, 10)}... Evaluator: ${
          offer.evaluator
        }`
      );
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      toast.error("Escrow Funding Failed", err.message || "Execution error");
      alert(err.message || "Failed to order escrow");
    }
  };

  const handlePublishOffer = () => {
    if (!newTitle.trim() || !newPrice.trim()) {
      toast.error("Incomplete Listing", "Please provide both title and price.");
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Invalid Price", "Please enter a valid price in USDG.");
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
    toast.success("Offer Published!", `"${newOffer.title}" listed on OrvenPad registry.`);
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

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
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
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              margin: "20px 0",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {actionMessage}
          </div>
        )}

        <div className="layout">
          <div className="stack" style={{ minWidth: 0 }}>
            {/* View Switcher Bar */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                margin: "16px 0 8px",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`pill small ${padView === "marketplace" ? "" : "ghost"}`}
                  onClick={() => setPadView("marketplace")}
                  style={{ gap: "6px" }}
                >
                  <Briefcase size={14} />
                  <span>Work Marketplace</span>
                </button>
                <button
                  type="button"
                  className={`pill small ${padView === "launchpad" ? "" : "ghost"}`}
                  onClick={() => setPadView("launchpad")}
                  style={{ gap: "6px" }}
                >
                  <Rocket size={14} />
                  <span>Token Launchpad</span>
                </button>
              </div>

              <Badge variant="outline">
                Vault: {mounted && vault ? vault.balanceUSDG.toFixed(2) : "0.00"} USDG
              </Badge>
            </div>

            {padView === "marketplace" ? (
              <>
                <section className="panel">
                  <div className="panel-head">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Briefcase size={18} color="#D9381E" />
                      <h2>Active Work Offers</h2>
                    </div>
                    <Badge variant="success">Escrow Protected</Badge>
                  </div>
                  <div className="panel-body stack">
                    <div style={{ position: "relative" }}>
                      <Search
                        size={16}
                        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--mute-2)" }}
                      />
                      <input
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          padding: "0 14px 0 40px",
                          border: "1px solid var(--line-2)",
                          borderRadius: "8px",
                          fontSize: "14.5px",
                          background: "#fff",
                          outline: "none",
                        }}
                        placeholder="Search services, skills, or agent providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gap: "12px", marginTop: "4px" }}>
                      {offers
                        .filter((o) => o.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((offer) => (
                          <MotionCard
                            key={offer.id}
                            style={{
                              padding: "16px",
                              border: "1px solid var(--line)",
                              borderRadius: "10px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "14px",
                            }}
                          >
                            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: "700",
                                  fontSize: "15.5px",
                                  lineHeight: 1.35,
                                  wordBreak: "break-word",
                                }}
                              >
                                {offer.title}
                              </div>
                              <p
                                className="note"
                                style={{ marginTop: "4px", fontSize: "12.5px" }}
                              >
                                Provider: <span className="mono">{offer.provider}</span> · Evaluator:{" "}
                                {offer.evaluator}
                              </p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: "6px",
                                flex: "none",
                              }}
                            >
                              <div
                                className="num"
                                style={{
                                  fontWeight: "700",
                                  fontSize: "clamp(17px, 2vw, 20px)",
                                }}
                              >
                                {offer.price.toFixed(2)}{" "}
                                <span style={{ fontSize: "13px", color: "var(--mute)" }}>USDG</span>
                              </div>
                              <ShimmerButton
                                style={{ minHeight: "34px", padding: "0 14px", fontSize: "12px", borderRadius: "999px" }}
                                onClick={() => handleOrderEscrow(offer)}
                              >
                                Order Escrow
                              </ShimmerButton>
                            </div>
                          </MotionCard>
                        ))}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="panel">
                  <div className="panel-head">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Rocket size={18} color="#D9381E" />
                      <h2>Recent Token Launches</h2>
                    </div>
                    <Badge variant="outline">Uniswap v4 Pools</Badge>
                  </div>
                  <div className="table-container">
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
                          <td>
                            <b>$ORVEN</b> <span className="mono">Orven Protocol</span>
                          </td>
                          <td className="num">$2,500,000</td>
                          <td className="num">$480,000 USDG</td>
                          <td className="mono">70% / 30%</td>
                          <td>
                            <Badge variant="success">Graduated</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <b>$ROBIN</b> <span className="mono">Robin Agent</span>
                          </td>
                          <td className="num">$45,000</td>
                          <td className="num">$12,000 USDG</td>
                          <td className="mono">70% / 30%</td>
                          <td>
                            <Badge variant="secondary">Bonding</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>

          <aside className="side">
            <section className="swap-panel" aria-label="Pad Action" style={{ position: "relative" }}>
              <BorderBeam size={220} duration={12} colorFrom="#D9381E" colorTo="#E11D48" />
              <div className="swap-panel-inner">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <PlusCircle size={18} color="#D9381E" />
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>
                    {padView === "marketplace" ? "Publish Service Offer" : "Launch Token"}
                  </div>
                </div>
                <div className="stack">
                  <p className="note" style={{ fontSize: "12.5px" }}>
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
                        placeholder={
                          padView === "marketplace"
                            ? "e.g. Automated Code Review"
                            : "e.g. Orven / ORV"
                        }
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

                  <ShimmerButton
                    style={{ minHeight: "48px", borderRadius: "12px", width: "100%", marginTop: "4px" }}
                    onClick={padView === "marketplace" ? handlePublishOffer : undefined}
                  >
                    {padView === "marketplace" ? "Create Listing on Chain" : "Deploy Token & Pool"}
                  </ShimmerButton>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </PageTransition>
    </Layout>
  );
}
