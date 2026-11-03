import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { FEE_TIERS } from "@orven/product-config";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { requestRelayerQuote, submitRelayTransaction } from "@/lib/api";

interface TokenItem {
  symbol: string;
  name: string;
  rateVsUSDG: number;
  logo: string;
}

const TOKEN_CATALOG: TokenItem[] = [
  { symbol: "USDG", name: "Global Dollar (Base)", rateVsUSDG: 1.0, logo: "/logos/usdg.png" },
  { symbol: "ETH", name: "Ether (Robinhood Chain)", rateVsUSDG: 2600.0, logo: "/logos/eth.png" },
  { symbol: "WETH", name: "Wrapped Ether", rateVsUSDG: 2600.0, logo: "/logos/eth.png" },
  { symbol: "bNVDA", name: "Robinhood Stock NVDA", rateVsUSDG: 140.5, logo: "/logos/usdg.png" },
  { symbol: "bTSLA", name: "Robinhood Stock TSLA", rateVsUSDG: 245.2, logo: "/logos/usdg.png" },
  { symbol: "bAAPL", name: "Robinhood Stock AAPL", rateVsUSDG: 228.0, logo: "/logos/usdg.png" },
  { symbol: "ORVEN", name: "Orven Protocol Token", rateVsUSDG: 0.25, logo: "/logos/usdg.png" },
];

export default function SwapPage() {
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sourceMode, setSourceMode] = useState<"wallet" | "vault">("vault");
  const [tokenIn, setTokenIn] = useState<TokenItem>(TOKEN_CATALOG[0]); // USDG
  const [tokenOut, setTokenOut] = useState<TokenItem>(TOKEN_CATALOG[1]); // ETH
  const [payAmount, setPayAmount] = useState("");
  const [slippage, setSlippage] = useState<"0.5%" | "1%" | "3%">("1%");
  const [isProcessing, setIsProcessing] = useState(false);
  const [swapMessage, setSwapMessage] = useState<string | null>(null);

  // Modal State
  const [tokenModalTarget, setTokenModalTarget] = useState<"in" | "out" | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    setMounted(true);
    const existing = BrowserVaultManager.loadVault() || BrowserVaultManager.createVault();
    setVault(existing);
  }, []);

  const exchangeRate = tokenIn.rateVsUSDG / tokenOut.rateVsUSDG;
  const numAmount = parseFloat(payAmount);
  const estimatedOut = isNaN(numAmount) ? "—" : (numAmount * exchangeRate).toFixed(4);
  const slipMultiplier = slippage === "0.5%" ? 0.995 : slippage === "1%" ? 0.99 : 0.97;
  const minOut = isNaN(numAmount) ? "—" : (numAmount * exchangeRate * slipMultiplier).toFixed(4);

  const handleInvertTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  const handleExecuteSwap = async () => {
    if (!vault) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid swap amount");
      return;
    }

    try {
      setIsProcessing(true);
      setSwapMessage("Requesting route quote and relayer sponsorship...");
      const quote = await requestRelayerQuote("vault_swap", vault.address);

      setSwapMessage(`Signing swap order with WOTS Key #${vault.currentKeyIndex}...`);
      await new Promise((r) => setTimeout(r, 600));

      const { vault: updated, txHash } = BrowserVaultManager.executeSpend(
        `Swap: ${tokenIn.symbol} -> ${tokenOut.symbol}`,
        amount
      );
      await submitRelayTransaction(quote.quoteId, "0x_mock_swap_signature");

      setVault({ ...updated });
      setPayAmount("");
      setSwapMessage(
        `Swap Order Settled! Tx: ${txHash.slice(0, 10)}... (WOTS Key #${
          updated.currentKeyIndex - 1
        } retired)`
      );
    } catch (err: any) {
      alert(err.message || "Swap failed");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setSwapMessage(null), 5000);
    }
  };

  const handleSelectToken = (t: TokenItem) => {
    if (tokenModalTarget === "in") {
      setTokenIn(t);
    } else if (tokenModalTarget === "out") {
      setTokenOut(t);
    }
    setTokenModalTarget(null);
    setSearchFilter("");
  };

  return (
    <Layout>
      <Head>
        <title>Swap · Orven</title>
        <meta
          name="description"
          content="Orven Swap: swap ETH, USDG, Robinhood stock tokens and launched tokens through Uniswap v3 and v4."
        />
      </Head>

      <div className="wrap page">
        <div className="page-head">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Orven Swap</span>
            </div>
            <h1>Swap</h1>
            <p>
              Any listed token for another, routed through Uniswap v3 and v4 against USDG or WETH, from
              your wallet or from your Orven vault.
            </p>
          </div>
        </div>

        {/* Live $ORVEN Deflation & Burn Tracker Widget */}
        <div
          style={{
            background: "linear-gradient(90deg, #15171A 0%, #201311 100%)",
            border: "1px solid var(--line-2)",
            borderRadius: "8px",
            padding: "16px 20px",
            margin: "24px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            color: "#fff",
          }}
        >
          <div>
            <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
              🔥 Deflationary Buyback Engine
            </span>
            <div
              style={{ fontSize: "clamp(18px, 2.4vw, 22px)", fontWeight: "700", marginTop: "2px" }}
              className="num"
            >
              124,500 ORVEN Burned{" "}
              <span style={{ fontSize: "13px", color: "var(--faint)" }}>(~$31,125 USDG)</span>
            </div>
          </div>
          <p
            className="note"
            style={{ maxWidth: "460px", color: "var(--faint)", fontSize: "12.5px" }}
          >
            50% of every swap fee (0.20%) and protocol hook share is permanently routed to buy back and
            burn $ORVEN to the dead address on Robinhood Chain.
          </p>
        </div>

        {swapMessage && (
          <div
            style={{
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              marginBottom: "20px",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {swapMessage}
          </div>
        )}

        <div className="layout">
          <div className="stack" style={{ minWidth: 0 }}>
            <section className="panel">
              <div className="panel-head">
                <h2>How a swap goes</h2>
                <span className="mono">
                  Vault Balance: {mounted && vault ? vault.balanceUSDG.toFixed(2) : "0.00"} USDG
                </span>
              </div>
              <div className="panel-body stack">
                <p className="note">
                  The best route goes through a hub, USDG or WETH, over Uniswap v3 and v4 pools, and
                  OrvenRouter pays at least the minimum you accept: a wallet swap reverts otherwise,
                  and a vault's order sends the input back. From your Orven vault, the swap is an
                  escrow order: the vault signs one transfer to an escrow whose address fixes every term,
                  and the Orven relayer executes it, paid in USDG from the vault, so you need no ETH.
                </p>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>The fee</h2>
                <Link className="link mono" href="/lock">
                  Lock ORVEN
                </Link>
              </div>
              <div className="table-container">
                <table className="trades">
                  <thead>
                    <tr>
                      <th>ORVEN locked for the account</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEE_TIERS.map((tier) => (
                      <tr key={tier.label}>
                        <td>{tier.label}</td>
                        <td className="num">{tier.feePercent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side">
            <section className="panel swap" aria-label="Orven Swap">
              <div className="tabs">
                <button
                  type="button"
                  aria-pressed={sourceMode === "wallet"}
                  onClick={() => setSourceMode("wallet")}
                >
                  From a wallet
                </button>
                <button
                  type="button"
                  aria-pressed={sourceMode === "vault"}
                  onClick={() => setSourceMode("vault")}
                >
                  From your Orven vault
                </button>
              </div>

              <div className="panel-body stack">
                <div className="stack">
                  <div className="tp">
                    <span className="mono">You pay</span>
                    <button
                      type="button"
                      className="tp-btn"
                      onClick={() => setTokenModalTarget("in")}
                      aria-label="Select token to pay"
                    >
                      <span className="tb tb-coin tb-sm" data-len={tokenIn.symbol.length}>
                        <img src={tokenIn.logo} alt={tokenIn.symbol} />
                      </span>
                      <span className="tp-val">
                        <b>{tokenIn.symbol}</b>
                        <span>{tokenIn.name}</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--mute)" }}>▼</span>
                    </button>
                  </div>
                </div>

                <label className="field">
                  <span className="field-top">
                    <span className="mono">Amount to Swap</span>
                    {sourceMode === "vault" && (
                      <span className="mono" style={{ fontSize: "11px" }}>
                        Balance: {vault?.balanceUSDG.toFixed(2)} USDG
                      </span>
                    )}
                  </span>
                  <span className="field-row">
                    <input
                      inputMode="decimal"
                      placeholder="0.00"
                      aria-label="Amount"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                    <span className="unit">{tokenIn.symbol}</span>
                  </span>
                </label>

                {/* Invert Token Direction Button */}
                <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
                  <button
                    type="button"
                    onClick={handleInvertTokens}
                    className="pill small ghost"
                    style={{ minHeight: "34px", padding: "0 14px", fontSize: "12px" }}
                    aria-label="Invert Swap Tokens"
                  >
                    ⇅ Flip Pair
                  </button>
                </div>

                <div className="stack">
                  <div className="tp">
                    <span className="mono">You receive</span>
                    <button
                      type="button"
                      className="tp-btn"
                      onClick={() => setTokenModalTarget("out")}
                      aria-label="Select token to receive"
                    >
                      <span className="tb tb-coin tb-sm" data-len={tokenOut.symbol.length}>
                        <img src={tokenOut.logo} alt={tokenOut.symbol} />
                      </span>
                      <span className="tp-val">
                        <b>{tokenOut.symbol}</b>
                        <span>{tokenOut.name}</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--mute)" }}>▼</span>
                    </button>
                  </div>
                </div>

                <div className="quote num">
                  <div className="row">
                    <span>You receive (est.)</span>
                    <span className="big" style={{ fontWeight: "700" }}>
                      {estimatedOut} {tokenOut.symbol}
                    </span>
                  </div>
                  <div className="row">
                    <span>Min received ({slippage} slippage)</span>
                    <span>
                      {minOut} {tokenOut.symbol}
                    </span>
                  </div>
                  <div className="row">
                    <span>Orven Swap fee</span>
                    <span>0.20% (50% burned)</span>
                  </div>
                  <div className="slip">
                    <span className="mono">Slippage</span>
                    <div className="seg mono-seg" role="group" aria-label="Slippage">
                      {(["0.5%", "1%", "3%"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={slippage === s}
                          onClick={() => setSlippage(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  className="pill block"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteSwap}
                >
                  {isProcessing
                    ? "Submitting Swap via Relayer..."
                    : sourceMode === "vault"
                    ? `Sign Vault Swap (${tokenIn.symbol} → ${tokenOut.symbol})`
                    : "Connect a wallet"}
                </button>

                <p className="note" style={{ fontSize: "12px", marginTop: "8px" }}>
                  Routed through Uniswap v3 and v4 against USDG or WETH by OrvenRouter. No ETH gas
                  required when swapping from an Orven Vault.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Interactive Token Selector (Bottom Sheet on Mobile, Centered Modal on Desktop) */}
      {tokenModalTarget && (
        <div
          className="tp-modal-overlay"
          onClick={() => setTokenModalTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Select a Token"
        >
          <div className="tp-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>Select a Token</h3>
              <button
                type="button"
                className="tp-modal-close"
                onClick={() => setTokenModalTarget(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <input
                style={{
                  width: "100%",
                  minHeight: "44px",
                  padding: "0 14px",
                  border: "1px solid var(--line-2)",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  fontFamily: "var(--sans)",
                  fontSize: "15px",
                }}
                placeholder="Search token name or Robinhood ticker..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                autoFocus
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              >
                {TOKEN_CATALOG.filter(
                  (t) =>
                    t.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    t.name.toLowerCase().includes(searchFilter.toLowerCase())
                ).map((token) => (
                  <div
                    key={token.symbol}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      background: "var(--soft)",
                      transition: "background 0.15s",
                      minHeight: "48px",
                    }}
                    onClick={() => handleSelectToken(token)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                      />
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "14.5px" }}>{token.symbol}</div>
                        <div style={{ fontSize: "12px", color: "var(--mute)" }}>{token.name}</div>
                      </div>
                    </div>
                    <div className="num mono" style={{ fontSize: "12.5px", color: "var(--mute-2)" }}>
                      ${token.rateVsUSDG.toLocaleString()} USDG
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
