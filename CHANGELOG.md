# 📜 Orven Protocol — Changelog & Release History

All notable changes to the **Orven Protocol** monorepo are documented in this file in accordance with Semantic Versioning principles.

---

## [v0.2.0-mainnet-ready] — 2026-11-03

### 🌟 Major New Features & Enhancements
- **Web3 Transaction Toast Notification System (`lib/toast.tsx`)**:
  - Implemented interactive floating toast notifications across all 5 core modules (`/vault`, `/swap`, `/pad`, `/lock`, `/tide`).
  - Added real-time transaction state transitions: `Pending ➔ Confirmed` with direct links to Robinhood Chain Blockscout explorer.
  - Added custom alert dialogs for errors and success feedback with auto-dismissal.
- **Live On-Chain RPC Balance & Block Listener (`lib/wallet.tsx`)**:
  - Integrated `createPublicClient` via Viem subscribing to Robinhood Chain Testnet (`46630`) and Mainnet (`4663`).
  - Real-time polling of native ETH balance, USDG tokens, and live block height without requiring page reload.
- **Real Injected EIP-1193 Wallet Connector**:
  - Full support for MetaMask, Rabby, Coinbase Wallet, Trust Wallet, and browser-injected wallets.
  - Auto-network detection and prompt to switch/add Robinhood Chain RPC.
  - Connected wallet dropdown menu with address copy, explorer link, live RPC balance, and one-tap disconnect.
  - Seamless "From a wallet" trading in the Swap terminal.
- **PWA (Progressive Web App) Native Capabilities**:
  - W3C Web App Manifest (`apps/web/public/manifest.json`) with standalone display mode and maskable SVG icons.
  - Service Worker (`apps/web/public/sw.js`) with offline caching and cache-first static asset strategy.
  - Smart PWA Install Prompt banner (`PWAInstallPrompt.tsx`) with W3C `beforeinstallprompt` and iOS Safari detection.
  - Real-time offline detection banner alerting users when reading cached local post-quantum keystore state.
- **Mobile-First Responsive Layout & DEX Overhaul**:
  - Unified Uniswap/Robinhood-style swap container with `[MAX]` button and ergonomic currency rate inversion (`1 ETH ≈ 2,600 USDG`).
  - Guaranteed 100% viewport fit on small screens (iPhone SE 375x667) without horizontal overflow or hidden buttons.
  - Floating/docked Mobile Bottom Navigation Bar (`MobileBottomNav.tsx`) with safe-area insets (`env(safe-area-inset-bottom)`).
  - Responsive table container wrapper (`.table-container`) for horizontal touch swipe across all data tables.
  - Slide-in Mobile Navigation Drawer in Header with backdrop blur and body scroll lock.

### 🛡️ Bug Fixes & Cryptographic Hardening
- **Resolved Vercel Serverless Invocation Crash (500)**:
  - Created native Next.js API Routes (`/api/relayer/[...path]` and `/api/ai/[...path]`) to replace non-serverless HTTP services, preventing `FUNCTION_INVOCATION_FAILED`.
  - Added safe JSON parsing guards in `lib/api.ts` preventing unhandled SyntaxErrors on network drops.
- **Fixed Cryptographic WOTS Key #0 Reuse Anomaly**:
  - Initialized `currentKeyIndex: 1` on Genesis Vault Inception, guaranteeing that Key #0 is never reused for subsequent transfers or swaps.
- **Fixed Backup Restore Balance Persistence**:
  - Expanded backup JSON payload to include USDG/ORVEN balances and transaction logs, eliminating state drift when moving devices.
- **Fixed Mobile Status Bar Clipping**:
  - Introduced responsive breakpoint labels (`show-sm` / `hide-sm`) so network text never truncates awkwardly on narrow screens.

### 🧪 Quality Assurance & Automation
- **Playwright Live Browser QA Suite (`scripts/run-qa-live-simulation.js`)**:
  - Added live headed browser simulation runner (`npm run qa:live`) allowing developers to watch user flows live on screen.
  - Automated formal QA documentation generation (`docs/QA_AUDIT_REPORT.md`) with executive summaries and screenshots.
- **Integrated CI/CD GitHub Actions Pipeline (`.github/workflows/ci.yml`)**:
  - Automated headless Chromium testing on Node 22.x & 24.x runners on every push and PR.
  - Automated artifact upload for QA screenshots and audit reports.
- **Mainnet 4663 Pre-Flight & Dry-Run Certification**:
  - Executed deployment simulation and bytecode verification across all 16 smart contracts (`deployments/robinhood-mainnet.json`).
  - Passed 35/35 pre-flight checks and 66/66 E2E system tests with 100% success rate.
  - Documented Mainnet real-coin broadcast runbook in `docs/MAINNET_READINESS_AUDIT.md`.

---

## [v0.1.0] — 2026-11-02

### 🚀 Initial Functional Parity Release
- Initial monorepo architecture with independent Orven brand identity.
- Functional parity implementation on Robinhood Chain Testnet (Chain ID `46630`).
- Local post-quantum Winternitz One-Time Signature (WOTS) browser vault keystore.
- Standalone autonomous agent tool package (`@orven/mcp`) with stdio JSON-RPC 2.0 CLI.
- Gas-free meta-transaction relayer service and AI task metering gateway.
- Solidity smart contract suite compiled under Solc 0.8.30.
