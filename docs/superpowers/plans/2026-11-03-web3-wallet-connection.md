# Web3 Wallet Connection via Viem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real Web3 Wallet Connection (MetaMask, Rabby, Coinbase Wallet, Injected EIP-1193) via Viem on Robinhood Chain Testnet (Chain ID 46630) and Mainnet (4663) across the Orven Protocol DApp.

**Architecture:**
1. State & Provider Layer: `apps/web/src/lib/wallet.tsx` creating `WalletProvider` & `useWallet()` hook with `window.ethereum`, `eth_requestAccounts`, `wallet_switchEthereumChain`, and `wallet_addEthereumChain` for Robinhood Chain.
2. App Shell Integration: Wrap `_app.tsx` with `<WalletProvider>`.
3. Navigation & Header Integration: Update `Header.tsx` to display real connected address, wallet dropdown menu (Copy, View on Blockscout, Disconnect), and network switcher.
4. Swap & DApp Integration: In `swap.tsx`, connect real wallet when `sourceMode === "wallet"`, allowing real wallet swaps with simulated/live broadcast.

---

### Task 1: Create `apps/web/src/lib/wallet.tsx`

- [x] **Step 1: Write `WalletContext` with EIP-1193 connector, chain switching, and auto-reconnect**
- [x] **Step 2: Add wallet dropdown styling to `globals.css`**

### Task 2: Integrate into `_app.tsx` & `Header.tsx`

- [x] **Step 1: Wrap `_app.tsx` with `<WalletProvider>`**
- [x] **Step 2: Update `Header.tsx` to use `useWallet()` and show connection menu**

### Task 3: Wire into `swap.tsx` for Real Wallet Trading

- [x] **Step 1: Update `swap.tsx` to trigger real wallet connection in "From a wallet" mode**

### Task 4: Verification & Build

- [x] **Step 1: Run `npm --workspace apps/web run build`**
- [x] **Step 2: Run `npm run test:e2e`**
- [x] **Step 3: Run `npm run qa:test`**
- [x] **Step 4: Commit and push to `origin/main`**
