# 💧 Orven Protocol — Liquidity Bootstrapping & Market Making Strategy

**Author:** Mary (Business Analyst) & John (Product Manager) — Tim BMAD Strategy Guild  
**Reviewers:** Winston (System Architect) & Sofia (Product Owner)  
**Status:** Approved for Testnet -> Mainnet Execution  
**Target Networks:** Robinhood Chain Testnet (46630) & Robinhood Chain Mainnet (4663)  

---

## 1. Executive Summary & Market Context

Orven Protocol functions as the sovereign post-quantum decentralized financial layer and autonomous agent gateway on Robinhood Chain (Arbitrum Orbit L2 stack). While smart contracts, relayer services, and frontend terminals are 100% verified, **decentralized trading and autonomous settlement require deep, reliable on-chain liquidity.**

This document details the operational strategy to seed, sustain, and scale protocol liquidity across all phases from Testnet validation to Mainnet public trading.

---

## 2. Core Token Triad & Decimals

| Token | Type | Precision | Primary Purpose | Contract Binding |
|---|---|:---:|---|---|
| **WETH** | Bridged Native | 18 decimals | Gas token & base trading pair | Canonical Arbitrum Orbit Bridge |
| **USDG** | Stablecoin | 6 decimals | Quoting currency, AI metering & relayer fees | `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` |
| **ORVEN** | Protocol Token | 18 decimals | Governance, Fee Tier Discounts & Tide Staking | `OstraToken.sol` / Launchpad Hook |

---

## 3. Four-Phase Liquidity Bootstrapping Lifecycle

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  Phase 1: Seed Liquidity│ ──> │ Phase 2: POL & Buybacks │ ──> │ Phase 3: Tide LP Rewards│ ──> │ Phase 4: DAO Multi-Sig  │
│  • Genesis Treasury LP  │     │ • Creator Splits        │     │ • 7-Day Streak Boosts   │     │ • Timelock Governance   │
│  • WETH/USDG Foundation │     │ • Auto-Buyback Engine   │     │ • Market Maker Rebates  │     │ • Breaker Automation    │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

### Phase 1: Genesis Seed Liquidity (Day 0 - Mainnet TGE)
1. **Bridge Ingress:**
   - Single-Wallet Admin deposits initial capital via canonical Arbitrum L1/L2 Nitro Bridge to Robinhood Mainnet (Chain 4663).
2. **Initial Pool Seeding (`OstraPool.sol`):**
   - **Pool A (WETH / USDG):** Initial depth to establish USDG pegged stability ($1.00 USDG).
   - **Pool B (ORVEN / USDG):** Initial concentrated liquidity range with 20 bps base fee.
3. **Price Discovery Curve:**
   - Utilizes `OstraLaunchpad.sol` bonding curve for fair launch, mitigating sniper bots and MEV front-running.

### Phase 2: Protocol-Owned Liquidity (POL) & Organic Revenue
1. **Relayer Fee Retention:**
   - Relayer charges 0.05 USDG per gasless transaction. 80% is converted into treasury LP, 20% covers relayer compute.
2. **AI Gateway Metering Split:**
   - Autonomous AI inference fees (debited in micro-USDG) flow through `OstraBuyback.sol` to periodically purchase and burn ORVEN or deepen Uniswap v3/v4 LP positions.
3. **OrvenPad Marketplace Fee:**
   - 0.50% (50 bps) escrow fee on completed work orders directly accumulates in the protocol treasury.

### Phase 3: Gamified Liquidity Incentives (`OstraTide.sol`)
1. **Streak-Based Multipliers:**
   - Users and automated liquidity providers who maintain active staking positions across 7-day epochs unlock Tier 1 to Tier 3 multipliers (up to 3.0x Tide multiplier).
2. **Zero-Fee Privileges:**
   - Staking 500,000 ORVEN in `OstraStake.sol` unlocks Tier 4 (100% fee discount / 0 bps), attracting high-frequency arbitrageurs and volume market makers.

### Phase 4: Decentralization & Governance Handover
1. **Timelock Migration:**
   - Transfer Single-Wallet Admin rights to `OstraUpgradeOwner.sol` (2-of-3 / 3-of-5 Gnosis-compatible multi-sig with a 48-hour timelock delay).
2. **Circuit Breakers (`OstraBreaker.sol`):**
   - Automatic pause triggers if pool volatility exceeds 15% within a 5-minute rolling window or if price deviation exceeds oracle consensus bounds.

---

## 4. Key Performance Indicators (KPIs) & Monitoring

| Metric | Target (Testnet) | Target (Mainnet Month 1) | Target (Mainnet Month 6) |
|---|---|---|---|
| **USDG/WETH Pool Depth** | $100,000 (Simulated) | $500,000 | $5,000,000+ |
| **ORVEN/USDG Liquidity** | $50,000 (Simulated) | $250,000 | $2,000,000+ |
| **Average Swap Slippage** | < 0.10% | < 0.25% | < 0.05% |
| **Daily Active AI Agents** | 20+ Agents | 100+ Agents | 1,000+ Agents |
| **Relayer Uptime** | 99.9% | 99.95% | 99.99% |

---

## 5. Risk Assessment & Mitigations

1. **Low Initial Float Risk:**
   - *Mitigation:* `OstraDevBuy.sol` enforces linear token vestings with cliff protection (`OstraVesting.sol`) to prevent sudden supply dumps.
2. **Arbitrage Drain:**
   - *Mitigation:* Uniswap v4 Hook dynamic fees adjust based on volatility and block delta.
3. **Relayer Gas Starvation:**
   - *Mitigation:* Autonomous rebalance script maintains a buffer of minimum 2.5 WETH in the relayer address at all times.

---
*Authored by Tim BMAD Strategy Guild for Orven Protocol.*
