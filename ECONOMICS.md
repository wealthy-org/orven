# Orven — Economic Model, Fee Schedule & Parameters (`ECONOMICS.md`)

**Date:** 2 November 2026  
**Status:** Canonical Reference Parameter Baseline  
**Network:** Robinhood Chain (Testnet: `46630`, Mainnet: `4663`)  
**Scope:** In accordance with Section 19 of `ORVEN_ROBINHOOD_DEV_BRIEF.md`

---

## 1. Executive Summary & Revenue Model

Orven operates as a self-sustaining financial infrastructure on Robinhood Chain. Users pay bounded fees in supported tokens (primarily **USDG**, 6 decimals) without requiring native ETH. The protocol captures value through:
1. **Public Swap & Router Fees:** 0.20% base fee, with 50% routed to $ORVEN buyback and 50% to treasury.
2. **Launchpad Dynamic Hook Fees:** 1.00% base hook fee, shared 70% to token creator and 30% to protocol (half of which funds buyback).
3. **Work Marketplace Platform Fees:** 0.50% (50 bps) on successful job settlement.
4. **Relayer Sponsorship Spread:** Fixed token fee recovering gas reimbursement + small operational surcharge.
5. **AI Gateway Metering:** Transparent markup on external AI inference services with atomic micro-USDG reservations.

---

## 2. Core Protocol Fee Schedule

### 2.1. Router & Swaps (`OrvenRouter`)
- **Base Swap Fee:** `20 bps` (0.20%)
- **Private Swap Fee:** `20 bps` (0.20% fixed, no discounts for anonymity preservation)
- **Fee Tier Staking Discounts (`OrvenStake`):**
  - `< 100,000 ORVEN locked`: `20 bps` (0.20%) — 0% discount
  - `100,000 ORVEN locked`: `15 bps` (0.15%) — 25% discount
  - `250,000 ORVEN locked`: `10 bps` (0.10%) — 50% discount
  - `500,000 ORVEN locked`: `0 bps` (0.00%) — 100% discount (Free swaps)
  - **Lock Duration:** Minimum `7 days` (`604,800 seconds`) before unstake request.

### 2.2. Launchpad & Pool Hooks (`OrvenHook`)
- **Launch Creation Fee:** `0.0002 ETH`
- **Base Hook Fee (`HOOK_FEE_BPS`):** `100 bps` (1.00% of volume)
- **Creator Fee Share (`CREATOR_FEE_SHARE_BPS`):** `7,000 bps` (70.0% of the hook fee)
- **Protocol Share:** `30.0%` of the hook fee:
  - `50.0%` of Protocol Share (`BUYBACK_SHARE_BPS`: 5,000 bps) -> Dedicated $ORVEN Buyback & Burn
  - `50.0%` of Protocol Share -> Protocol Treasury (or Referral if present)
- **Referral Fee (`REFERRAL_SHARE_BPS`):** `5,000 bps` (50.0% of protocol share paid to verified referrer)
- **Anti-Sniping & Anti-Farmer Constraints:**
  - Launch limits duration: configurable up to `24 hours`
  - Max buy limit per transaction: bounded to prevent single-block drainage
  - Maximum transaction tick move cap: default `200 ticks`

### 2.3. Work Marketplace Escrow (`OrvenPad`)
- **Platform Fee:** `50 bps` (0.50% of agreed budget upon evaluator release)
- **Evaluator Fee:** Fixed or bonded fee as configured per job
- **Appeal Fee:** 100% of evaluator fee required to open a 3-member panel appeal
- **Time Windows:**
  - `JOB_LIFETIME`: 30 days
  - `REVEAL_WINDOW`: 48 hours
  - `EVAL_WINDOW`: 72 hours
  - `APPEAL_WINDOW`: 48 hours
  - `BOND_COOLDOWN`: 7 days

### 2.4. Relayer Gas Sponsorship
- **Simulation Fee:** `0.05 USDG` (50,000 minor units) for standard transactions (~120,000 gas units)
- **Price Oracle:** Chainlink ETH/USD with heartbeat validation (max staleness 3,600s)
- **Relayer Buffer Margin:** `10%` headroom above live L1/L2 gas estimation

### 2.5. AI Gateway Inference Pricing
Amounts denominated in integer minor units of USDG (`1 USDG = 1,000,000 minor units`):
- `orven-gpt-4o`: `5,000 minor units` ($0.005 USDG) per 1k tokens
- `orven-claude-3-5-sonnet`: `6,000 minor units` ($0.006 USDG) per 1k tokens
- `orven-flux-pro`: `40,000 minor units` ($0.04 USDG) per image
- `orven-runway-gen3`: `250,000 minor units` ($0.25 USDG) per 5s video segment

---

## 3. Capital Requirements & Float Management

1. **Relayer ETH Float:** 
   - Testnet: 1.0 - 2.0 Testnet ETH sufficient for ~15,000 sponsored transactions.
   - Mainnet: Initial small float (0.5 ETH) with automated rebalancing as USDG fees accumulate in relayer vault.
2. **AI Provider Prepayments:**
   - Seed balance in provider accounts (OpenAI, Anthropic, BFL, Runway).
3. **Liquidity Seeding:**
   - In Testnet: Faucet tokens seed the initial Uniswap v4 test pools.
