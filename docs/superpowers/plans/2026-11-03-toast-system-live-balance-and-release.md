# Web3 Toast System, Live RPC Balance Listener & Official Release Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the final triple-crown enhancement for Orven Protocol:
1. Web3 Transaction Toast Notification System with Blockscout explorer links across all 5 core modules.
2. Live on-chain RPC balance & block listener via Viem.
3. Official `v0.2.0-mainnet-ready` release package, `CHANGELOG.md`, and Git release tagging.

---

### Task 1: Web3 Transaction Toast Notification System (Opsi 1)

**Files:**
- Create: `apps/web/src/lib/toast.tsx`
- Modify: `apps/web/src/styles/globals.css`
- Modify: `apps/web/src/components/Layout.tsx`
- Modify: `apps/web/src/pages/vault.tsx`
- Modify: `apps/web/src/pages/swap.tsx`
- Modify: `apps/web/src/pages/pad.tsx`
- Modify: `apps/web/src/pages/lock.tsx`
- Modify: `apps/web/src/pages/tide.tsx`

- [x] **Step 1: Create `apps/web/src/lib/toast.tsx` with ToastProvider and useToast hook**
- [x] **Step 2: Add high-end toast animation and layout styles in `globals.css`**
- [x] **Step 3: Integrate ToastProvider into `Layout.tsx`**
- [x] **Step 4: Wire interactive toast triggers with txHash into `/vault`, `/swap`, `/pad`, `/lock`, and `/tide`**

---

### Task 2: Live On-Chain RPC Balance & Block Listener via Viem (Opsi 2)

**Files:**
- Modify: `apps/web/src/lib/wallet.tsx`
- Modify: `apps/web/src/components/Header.tsx`

- [x] **Step 1: Integrate Viem publicClient and getBalance into `wallet.tsx`**
- [x] **Step 2: Add block listener / polling interval for real-time wallet balances**
- [x] **Step 3: Display live ETH and USDG balances in Header wallet dropdown**

---

### Task 3: Official Release Package, Changelog & Git Tag (Opsi 3)

**Files:**
- Create: `CHANGELOG.md`
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Tag: `v0.2.0-mainnet-ready`

- [x] **Step 1: Create `CHANGELOG.md` documenting complete protocol milestones**
- [x] **Step 2: Bump version to 0.2.0 in `package.json` and `apps/web/package.json`**
- [x] **Step 3: Run full verification suite (`build:all`, `verify:mainnet`, `test:e2e`, `qa:test`)**
- [x] **Step 4: Commit, tag `v0.2.0-mainnet-ready`, and push to `origin/main`**
