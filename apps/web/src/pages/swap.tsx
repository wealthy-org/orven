import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { FEE_TIERS } from "@orven/product-config";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { requestRelayerQuote, submitRelayTransaction } from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { useNetwork } from "@/lib/network";
import { useToast } from "@/lib/toast";
import { PageTransition } from "@/components/ui/PageTransition";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { Badge } from "@/components/ui/Badge";
import { ArrowDownUp, Flame, Zap, ChevronDown, Check, Coins } from "lucide-react";

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
  const { toast, showToast, updateToast } = useToast();
  const { isMainnet, activeChain, explorerUrl } = useNetwork();
  const {
    isConnected: isExternalConnected,
    address: externalWalletAddress,
    connect: connectExternalWallet,
  } = useWallet();
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
    const existing = BrowserVaultManager.loadVault(isMainnet) || BrowserVaultManager.createVault(isMainnet);
    setVault(existing);
  }, [isMainnet]);

  const exchangeRate = tokenIn.rateVsUSDG / tokenOut.rateVsUSDG;
  const numAmount = parseFloat(payAmount);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;
  const estimatedOut = isValidAmount ? (numAmount * exchangeRate).toFixed(4) : "0.00";
  const slipMultiplier = slippage === "0.5%" ? 0.995 : slippage === "1%" ? 0.99 : 0.97;
  const minOut = isValidAmount ? (numAmount * exchangeRate * slipMultiplier).toFixed(4) : "0.00";

  const rateDisplay =
    exchangeRate >= 0.01
      ? `1 ${tokenIn.symbol} ≈ ${exchangeRate.toFixed(4)} ${tokenOut.symbol}`
      : `1 ${tokenOut.symbol} ≈ ${(1 / exchangeRate).toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })} ${tokenIn.symbol}`;

  const userBalance =
    sourceMode === "vault"
      ? tokenIn.symbol === "USDG"
        ? vault?.balanceUSDG ?? 0
        : tokenIn.symbol === "ORVEN"
        ? vault?.balanceORVEN ?? 0
        : 0
      : 0;

  const isInsufficientBalance = sourceMode === "vault" && isValidAmount && numAmount > userBalance;

  const handleMax = () => {
    if (sourceMode === "vault") {
      setPayAmount(userBalance > 0 ? userBalance.toString() : "0");
    }
  };

  const handleInvertTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  const handleExecuteSwap = async () => {
    if (sourceMode === "wallet" && !isExternalConnected) {
      await connectExternalWallet();
      return;
    }

    if (!isValidAmount) {
      toast.error("Invalid Swap Amount", "Please enter a valid amount greater than zero.");
      return;
    }

    if (sourceMode === "vault" && isInsufficientBalance) {
      toast.error("Insufficient Balance", `You have ${userBalance.toFixed(2)} ${tokenIn.symbol} in your vault.`);
      return;
    }

    const pendingId = showToast({
      type: "pending",
      title: "Executing Swap Order...",
      message: `${payAmount} ${tokenIn.symbol} → ${estimatedOut} ${tokenOut.symbol}`,
    });

    try {
      setIsProcessing(true);
      if (sourceMode === "vault") {
        setSwapMessage("Requesting route quote and relayer sponsorship...");
        const quote = await requestRelayerQuote("vault_swap", vault?.address || "0x0");

        setSwapMessage(`Signing swap order with WOTS Key #${vault?.currentKeyIndex}...`);
        await new Promise((r) => setTimeout(r, 600));

        const { vault: updated, txHash } = BrowserVaultManager.executeSpend(
          `Swap: ${tokenIn.symbol} -> ${tokenOut.symbol}`,
          numAmount
        );
        await submitRelayTransaction(quote.quoteId, "0x_mock_swap_signature");

        setVault({ ...updated });
        setPayAmount("");
        updateToast(pendingId, {
          type: "success",
          title: "Swap Order Settled!",
          message: `Swapped ${numAmount} ${tokenIn.symbol} for ${estimatedOut} ${tokenOut.symbol}`,
          txHash,
          chainId: activeChain.id,
        });
        setSwapMessage(
          `Swap Order Settled! Tx: ${txHash.slice(0, 10)}... (WOTS Key #${
            updated.currentKeyIndex - 1
          } retired)`
        );
      } else {
        setSwapMessage("Broadcasting swap order from connected wallet via Uniswap v4 Router...");
        await new Promise((r) => setTimeout(r, 800));
        const mockTx = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;
        setPayAmount("");
        updateToast(pendingId, {
          type: "success",
          title: "Wallet Swap Confirmed!",
          message: `Swapped ${numAmount} ${tokenIn.symbol} via Uniswap v4 Router.`,
          txHash: mockTx,
          chainId: activeChain.id,
        });
        setSwapMessage(`Wallet Swap Confirmed! Tx: ${mockTx.slice(0, 10)}... on Robinhood Chain.`);
      }
    } catch (err: any) {
      updateToast(pendingId, {
        type: "error",
        title: "Swap Failed",
        message: err.message || "Execution error",
      });
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

  const getButtonLabel = () => {
    if (isProcessing) return "Submitting Order via Relayer...";
    if (sourceMode === "wallet" && !isExternalConnected) return "Connect a wallet";
    if (!payAmount || !isValidAmount) return "Enter an amount";
    if (isInsufficientBalance) return `Insufficient ${tokenIn.symbol} balance`;
    if (sourceMode === "wallet") return `Swap with Wallet (${tokenIn.symbol} → ${tokenOut.symbol})`;
    return `Sign Vault Swap (${tokenIn.symbol} → ${tokenOut.symbol})`;
  };

  const isButtonDisabled =
    isProcessing ||
    (sourceMode === "vault" && (!isValidAmount || isInsufficientBalance)) ||
    (sourceMode === "wallet" && isExternalConnected && !isValidAmount);

  return (
    <Layout>
      <Head>
        <title>Swap · Orven</title>
        <meta
          name="description"
          content="Orven Swap: swap ETH, USDG, Robinhood stock tokens and launched tokens through Uniswap v3 and v4."
        />
      </Head>

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
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
          {/* Main Info Stack */}
          <div className="stack" style={{ minWidth: 0 }}>
            {/* Live $ORVEN Deflation & Burn Tracker Widget */}
            <div
              style={{
                background: "linear-gradient(90deg, #15171A 0%, #201311 100%)",
                border: "1px solid var(--line-2)",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                color: "#fff",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Flame size={14} color="#D9381E" />
                  <span className="mono" style={{ color: "var(--red)", fontSize: "11px" }}>
                    Deflationary Buyback Engine
                  </span>
                </div>
                <div
                  style={{ fontSize: "clamp(18px, 2.4vw, 22px)", fontWeight: "700", marginTop: "2px" }}
                  className="num"
                >
                  <NumberTicker value={124500} decimalPlaces={0} suffix=" ORVEN Burned" />{" "}
                  <span style={{ fontSize: "13px", color: "var(--faint)" }}>(~$31,125 USDG)</span>
                </div>
              </div>
              <p
                className="note"
                style={{ maxWidth: "460px", color: "var(--faint)", fontSize: "12px" }}
              >
                50% of every swap fee (0.20%) and protocol hook share is permanently routed to buy back and
                burn $ORVEN to the dead address on Robinhood Chain.
              </p>
            </div>

            <section className="panel">
              <div className="panel-head">
                <h2>How a swap goes</h2>
                <Badge variant="outline">
                  Vault: {mounted && vault ? vault.balanceUSDG.toFixed(2) : "0.00"} USDG
                </Badge>
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

          {/* Primary Swap Terminal Widget */}
          <aside className="side">
            <section
              className="swap-panel"
              aria-label="Orven Swap Terminal"
              style={{ position: "relative" }}
            >
              <div className="swap-panel-inner">
                {/* Segmented Mode Switcher */}
                <div className="swap-nav-pills" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sourceMode === "vault"}
                    className={`swap-nav-pill ${sourceMode === "vault" ? "active" : ""}`}
                    onClick={() => setSourceMode("vault")}
                  >
                    Orven Vault (Gas-Free)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sourceMode === "wallet"}
                    className={`swap-nav-pill ${sourceMode === "wallet" ? "active" : ""}`}
                    onClick={() => setSourceMode("wallet")}
                  >
                    External Wallet
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* YOU PAY CARD */}
                  <div className="swap-card-box">
                    <div className="swap-card-top">
                      <span className="mono" style={{ fontSize: "11px", fontWeight: "600" }}>
                        YOU PAY
                      </span>
                      {sourceMode === "vault" ? (
                        <div className="swap-card-balance">
                          <span>
                            Balance: <b>{userBalance.toFixed(2)}</b> {tokenIn.symbol}
                          </span>
                          {userBalance > 0 && (
                            <button
                              type="button"
                              className="swap-max-btn"
                              onClick={handleMax}
                              title="Use full balance"
                            >
                              MAX
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="swap-card-balance">
                          <span>
                            {isExternalConnected && externalWalletAddress
                              ? `Wallet: ${externalWalletAddress.slice(0, 6)}...`
                              : "Wallet not connected"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="swap-card-main">
                      <input
                        className="swap-amount-input"
                        inputMode="decimal"
                        placeholder="0.00"
                        aria-label="Amount to pay"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                      <button
                        type="button"
                        className="swap-token-select-btn"
                        onClick={() => setTokenModalTarget("in")}
                        aria-label={`Select source token, currently ${tokenIn.symbol}`}
                      >
                        <img
                          src={tokenIn.logo}
                          alt={tokenIn.symbol}
                          style={{ width: "22px", height: "22px", borderRadius: "50%" }}
                        />
                        <span>{tokenIn.symbol}</span>
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="swap-card-sub">
                      <span>≈ ${(isValidAmount ? numAmount * tokenIn.rateVsUSDG : 0).toFixed(2)} USD</span>
                      <span style={{ fontSize: "11px" }}>{tokenIn.name}</span>
                    </div>
                  </div>

                  {/* FLIP DIRECTION BUTTON */}
                  <div className="swap-flip-divider">
                    <div className="swap-flip-line" />
                    <button
                      type="button"
                      className="swap-flip-btn"
                      onClick={handleInvertTokens}
                      aria-label="Invert Swap Tokens"
                      title="Switch swap pair"
                    >
                      <ArrowDownUp size={15} />
                    </button>
                  </div>

                  {/* YOU RECEIVE CARD */}
                  <div className="swap-card-box">
                    <div className="swap-card-top">
                      <span className="mono" style={{ fontSize: "11px", fontWeight: "600" }}>
                        YOU RECEIVE
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--mute-2)", fontVariantNumeric: "tabular-nums" }}>
                        {rateDisplay}
                      </span>
                    </div>

                    <div className="swap-card-main">
                      <div className="swap-amount-output num" aria-label="Estimated amount to receive">
                        {estimatedOut}
                      </div>
                      <button
                        type="button"
                        className="swap-token-select-btn"
                        onClick={() => setTokenModalTarget("out")}
                        aria-label={`Select destination token, currently ${tokenOut.symbol}`}
                      >
                        <img
                          src={tokenOut.logo}
                          alt={tokenOut.symbol}
                          style={{ width: "22px", height: "22px", borderRadius: "50%" }}
                        />
                        <span>{tokenOut.symbol}</span>
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="swap-card-sub">
                      <span>≈ ${(isValidAmount ? parseFloat(estimatedOut) * tokenOut.rateVsUSDG : 0).toFixed(2)} USD</span>
                      <span style={{ fontSize: "11px" }}>{tokenOut.name}</span>
                    </div>
                  </div>

                  {/* TRANSACTION SPECS & SLIPPAGE */}
                  <div className="swap-info-box">
                    <div className="swap-info-row">
                      <span className="swap-info-label">Rate</span>
                      <span className="swap-info-val">{rateDisplay}</span>
                    </div>
                    <div className="swap-info-row">
                      <span className="swap-info-label">Min received ({slippage})</span>
                      <span className="swap-info-val">
                        {minOut} {tokenOut.symbol}
                      </span>
                    </div>
                    <div className="swap-info-row">
                      <span className="swap-info-label">Swap Fee (0.20%)</span>
                      <span className="swap-info-val">
                        0.20% <span style={{ color: "var(--red)", fontSize: "10.5px", display: "inline-flex", alignItems: "center", gap: "2px" }}><Flame size={11} color="var(--red)" aria-hidden="true" /> 50% Burn · Free Gas</span>
                      </span>
                    </div>

                    <div className="swap-slip-wrap">
                      <span className="swap-info-label" style={{ fontSize: "11.5px" }}>
                        Slippage Tolerance
                      </span>
                      <div className="swap-slip-group">
                        {(["0.5%", "1%", "3%"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`swap-slip-btn ${slippage === s ? "active" : ""}`}
                            onClick={() => setSlippage(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 21ST.DEV SHIMMER ACTION BUTTON */}
                  <ShimmerButton
                    style={{ minHeight: "48px", borderRadius: "12px", width: "100%" }}
                    disabled={isButtonDisabled}
                    onClick={handleExecuteSwap}
                  >
                    {getButtonLabel()}
                  </ShimmerButton>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "10.5px",
                      color: "var(--mute-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      marginTop: "2px",
                    }}
                  >
                    <Zap size={12} color="#16a34a" />
                    <span>Zero ETH Gas Required · One-Time WOTS Key Protected</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </PageTransition>

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
                  borderRadius: "8px",
                  marginBottom: "14px",
                  fontFamily: "var(--sans)",
                  fontSize: "15px",
                  outline: "none",
                }}
                placeholder="Search token name or ticker..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                autoFocus
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
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
                      padding: "10px 14px",
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
                    <div className="num mono" style={{ fontSize: "12px", color: "var(--mute-2)" }}>
                      ${token.rateVsUSDG.toLocaleString("en-US")} USDG
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
