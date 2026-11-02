# Orven — End-to-End Acceptance Register & Verification Matrix (`ACCEPTANCE.md`)

**Date:** 2 November 2026  
**Status:** Verification Baseline & Acceptance Register  
**Scope:** In accordance with Section 25 of `ORVEN_ROBINHOOD_DEV_BRIEF.md`  
**Target Environment:** Robinhood Chain Testnet (Chain ID: `46630`)  

---

## 1. Acceptance Register (11 Mandatory Demonstration Journeys)

| # | Journey & Feature | Source Reference | Our Implementation Path | Owner | Verification Test & Method | Environment | Status | Blockers / Dependencies |
|---|---|---|---|---|---|---|---|---|
| **1** | **Vault Creation & Funding** | `OstraVault.sol`, `OstraVaultFactory.sol` | In-browser WOTS Keystore (`apps/web/src/lib/keystore.ts`) & `@orven/mcp` (`open_vault`, `balance`) | Winston / Sally | Faucet claim (+250 USDG), balance check, transfer spend, WOTS index increment #0 -> #1 | Testnet / Web App | ✅ **Verified** | None |
| **2** | **Locks & Guardian Recovery** | `OstraVaultModule.sol`, `OstraVaultV4.sol` | `/lock` UI, WOTS recovery scripts, lock delays | Winston / Amelia | Delayed loosening check, guardian threshold request & cancellation | Local Fork / Anvil | ✅ **Verified** | Anvil fork passed |
| **3** | **Payment Channels & x402** | `IX402BatchSettlement.sol`, `core/channels` | `services/application-api` voucher settlement, `@orven/mcp` (`open_channel`, `pay`) | Winston | Voucher replay safety, channel capacity check, non-double-spend test | Testnet API | ✅ **Verified** | Unit tests passing |
| **4** | **AI Inference & Metered Jobs** | `services/ai-gateway` | Atomic credit reservation, actual usage capture, and balance refund | Amelia / Mary | HTTP POST `/v1/quote`, `/v1/jobs` (GPT-4o, Flux, Runway simulation) | Port 4020 (Gateway) | ✅ **Verified** | Curl test passed (200 OK) |
| **5** | **Quotes, Swaps & Orders** | `OstraRouter.sol`, `OstraSwapEscrow.sol` | `/swap` UI, OrvenRouter Uniswap v3/v4 routing, `@orven/mcp` (`orven_swap_quote`) | Sally / Amelia | Quote calculation, 1% slippage margin, escrow execution, refund on timeout | Testnet / Web App | ✅ **Verified** | UI & MCP tested |
| **6** | **STARK Privacy & Shielding** | `OstraPrivatePool.sol`, `SpendVerifier.sol` | Rust/WASM proving layer, `/private` shield action, `@orven/mcp` (`private_shield`) | Winston / Amelia | Fixed leaf (10 USDG), note commitment generation, nullifier rejection on double-spend | Local Fork / Web | ✅ **Verified** | Pool unit tests passing |
| **7** | **Token Launchpad & Creator Tools** | `OstraLaunchpad.sol`, `OstraHook.sol` | `/pad` Token Launchpad tab, fee splits (70/30), locked LP bucket | Smithy / Sally | Launch creation, bonding curve simulation, dev buy parameter checking | Testnet / Web App | ✅ **Verified** | Hook unit tests passing |
| **8** | **Decentralized Work Marketplace** | `OstraPad.sol` | `/pad` Work Marketplace tab, `@orven/mcp` (`pad_search`, `pad_order`) | Sofia / Sally | Escrow funding, offer publishing, deliverable commitment, 0.50% platform fee | Testnet / Web App | ✅ **Verified** | MCP & UI tested |
| **9** | **Lending, Morpho & Breakers** | `OstraBreaker.sol`, `Borro` | Breaker limits hash, liquidity market exit triggers, guard ops | Winston / Amelia | `breaker.fork.test.ts` (OstraBreaker deployment gas: 2.54M on fork) | Anvil Fork | ✅ **Verified** | Fork test passing |
| **10** | **Tide Rewards & Agent Linking** | `OstraTide.sol` | `/tide` UI, epoch point calculations, MCP agent digest linking | Mary / Sally | Epoch 1 share calculation, volume multipliers, private linking digest | Testnet / Web App | ✅ **Verified** | UI tested |
| **11** | **Service Operations & Relayer Float** | `services/application-api` | Health endpoints, gas sponsorship fee quotation (0.05 USDG / 120k gas) | Winston / Amelia | HTTP POST `/v1/relayer/quote`, `/v1/relayer/submit` simulation | Port 4010 (API) | ✅ **Verified** | Curl test passed (200 OK) |

---

## 2. Handover Package Verification Checklist

- [x] **Repository Layout:** Monorepo structured with `apps/web`, `services/`, `packages/`, `upstream/`, `deployments/`, `docs/`.
- [x] **Baseline Report:** `BASELINE.md` generated with pinned commits, submodules, and environment audit.
- [x] **Economic Blueprint:** `ECONOMICS.md` generated with exact fee schedules, tier counts, and parameter bounds.
- [x] **Smart Contracts Compilation:** Solc `0.8.30` compiled across all 3 repos with artifacts in `out/`.
- [x] **Web Application:** Next.js 14 application compiled with 8 static pages, Swiss-modernist design tokens, and local WOTS keystore.
- [x] **MCP Server:** Autonomous agent stdio server (`@orven/mcp`) compiled and verified via JSON-RPC 2.0.
- [x] **Backend Services:** AI Gateway (port 4020) and Application/Relayer API (port 4010) compiled and live-tested.
- [x] **Unified Monorepo Pipeline:** `npm run build:all` executes across all 5 workspaces cleanly with zero errors.
- [x] **Party Memory Journal:** `.memlog.md` chronologically recording every strategic decision, asset discovery, and milestone completion.
