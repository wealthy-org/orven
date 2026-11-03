# CI/CD Playwright QA & Mainnet Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full GitHub Actions CI/CD automation with Playwright browser testing (Opsi 1) and complete the Mainnet deployment dry-run simulation & verification for Robinhood Chain 4663 (Opsi 3).

**Architecture:**
1. CI/CD Layer: Update `.github/workflows/ci.yml` with Playwright Chromium headless runner, caching, artifact upload for screenshots (`qa-artifacts/`) and reports (`docs/QA_AUDIT_REPORT.md`), and automated test gate.
2. Mainnet Layer: Audit and execute `scripts/deploy-network.js` with dry-run support, verify 16 smart contract bytecodes for Chain ID 4663, run pre-flight verifiers (`scripts/verify-mainnet-readiness.js`), and produce `docs/MAINNET_READINESS_AUDIT.md`.
3. Verification Layer: Run local dual-run verification for build, E2E system tests (66/66), Playwright browser simulation, and Mainnet pre-flight (35/35).

**Tech Stack:** GitHub Actions, Playwright, Next.js 14, Node.js 22/24, Viem, Foundry Solc 0.8.30 artifacts.

---

### Task 1: Integrate Playwright QA Runner into GitHub Actions CI Pipeline (Opsi 1)

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/run-qa-live-simulation.js`
- Test: Local CI execution simulation

- [x] **Step 1: Inspect and enhance `.github/workflows/ci.yml`**
  Add Playwright cache, browser binary install (`npx playwright install --with-deps chromium`), automated `npm run qa:test`, and artifact upload for `qa-artifacts/` and report.
- [x] **Step 2: Ensure `run-qa-live-simulation.js` auto-spawns Next.js if server is not already online**
  Make the simulator self-sufficient in CI environments.
- [x] **Step 3: Run `npm run qa:test` locally to verify headless execution in CI conditions**

---

### Task 2: Mainnet Dry-Run Engine & 16-Contract Bytecode Verification (Opsi 3)

**Files:**
- Inspect/Modify: `scripts/deploy-network.js`
- Inspect: `deployments/robinhood-mainnet.json`
- Inspect: `scripts/verify-mainnet-readiness.js`
- Create: `docs/MAINNET_READINESS_AUDIT.md`

- [x] **Step 1: Verify `scripts/deploy-network.js` mainnet execution and dry-run flag**
- [x] **Step 2: Run dry-run deployment simulation for Robinhood Chain Mainnet (Chain ID 4663)**
- [x] **Step 3: Run `npm run verify:mainnet` (35/35 checks)**
- [x] **Step 4: Generate formal Mainnet Readiness & Gas Audit Report in `docs/MAINNET_READINESS_AUDIT.md`**

---

### Task 3: Full Ecosystem Verification & Git Push

**Files:**
- Verification only
- Git commit & push

- [x] **Step 1: Run `npm run build:all`**
- [x] **Step 2: Run `npm run test:e2e`**
- [x] **Step 3: Run `npm run verify:mainnet`**
- [x] **Step 4: Commit and push to `origin/main`**
