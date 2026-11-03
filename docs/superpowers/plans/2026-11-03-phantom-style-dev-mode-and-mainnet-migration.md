# Phantom-Style Developer Mode & Mainnet Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phantom-style "Developer Mode" (Testnet 46630 vs Mainnet 4663) with distinct wallet addresses per network, dual-manifest contract resolution, live Blockscout explorer routing (`robinhoodchain.blockscout.com` on Mainnet, `explorer.testnet.chain.robinhood.com` on Testnet), and verified deployment engine output matching `image copy 11.png`.

**Architecture:**
1. Network Context Layer: `apps/web/src/lib/network.tsx` managing `isDeveloperMode` toggle, active chain (`ROBINHOOD_TESTNET` vs `ROBINHOOD_MAINNET`), explorer URLs, and network-scoped vault storage keys.
2. Keystore Separation Layer: Update `apps/web/src/lib/keystore.ts` so Testnet and Mainnet derive separate vault addresses and isolated transaction journals.
3. UI Toggle Layer: Update `NetworkStatusBar.tsx` and `Header.tsx` with an interactive Phantom-style iOS toggle switch (`Developer Mode ON/OFF`), updating status pills and explorer links dynamically.
4. Explorer & Contract Creation Mapping: Ensure transaction links point to `https://robinhoodchain.blockscout.com/tx/0x...` on Mainnet (matching `image copy 11.png`) and `https://explorer.testnet.chain.robinhood.com/tx/0x...` on Testnet.

---

### Task 1: Create `apps/web/src/lib/network.tsx` & Keystore Network Scoping

- [x] **Step 1: Create `network.tsx` with `NetworkProvider`, `useNetwork()` hook, and persistent toggle state**
- [x] **Step 2: Update `keystore.ts` to support network-scoped storage keys (`orven_vault_testnet` vs `orven_vault_mainnet`)**
- [x] **Step 3: Update `wallet.tsx` and `toast.tsx` to use active network explorer URL**

### Task 2: Implement Phantom-Style Developer Mode Toggle UI

- [x] **Step 1: Add iOS/Phantom style toggle switch CSS in `globals.css`**
- [x] **Step 2: Update `NetworkStatusBar.tsx` with live toggle switch (`Developer Mode`)**
- [x] **Step 3: Update `Header.tsx` and `vault.tsx` to adapt UI based on active mode (faucet active in Dev Mode, real deposit in Mainnet Mode)**

### Task 3: Deployer Engine & Manifest Verification

- [x] **Step 1: Verify `deployments/robinhood-testnet.json` and `deployments/robinhood-mainnet.json` contract registries**
- [x] **Step 2: Ensure deployer script outputs Blockscout contract creation links matching `image copy 11.png`**

### Task 4: Full Monorepo Build, E2E & Browser QA Verification

- [x] **Step 1: Run `npm --workspace apps/web run build`**
- [x] **Step 2: Run `npm run verify:mainnet` (35/35 checks)**
- [x] **Step 3: Run `npm run test:e2e` (66/66 checks)**
- [x] **Step 4: Run `npm run qa:test` (Playwright live simulation)**
- [x] **Step 5: Commit and push to `origin/main`**
