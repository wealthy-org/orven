# Orven — Baseline Reproduction & Source Audit Report (`BASELINE.md`)

**Date:** 2 November 2026  
**Status:** Milestone A Complete — Baseline Fork Cloned, Toolchains Measured, Test Suites Audited  
**Target Network:** Robinhood Chain (Testnet: `46630` -> Mainnet: `4663`)  
**Product Name:** Orven  

---

## 1. Pinned Source Repositories & Submodules

The upstream repositories have been cloned into `upstream/` with exact submodules and pinned commits:

| Repository | Pinned Commit | Submodules Initialized | Local Path |
|---|---|---|---|
| **ostra-robinhood** | `475129bfe4f9d13227a65759c93bdeebc52ff43a` | `lib/forge-std`, `lib/openzeppelin-contracts` | `upstream/ostra-robinhood` |
| **ostra-swap** | `9b622cabff84b711d3048b560fd3188d39372723` | `lib/forge-std`, `lib/openzeppelin-contracts` | `upstream/ostra-swap` |
| **ostrapad** | `c46fee21a3130fb80ce22386b5faa729c9d7fc55` | `lib/forge-std`, `lib/openzeppelin-contracts` | `upstream/ostrapad` |

All licenses at the root of all three repositories are verified as **MIT License**. Required notices and attributions are strictly preserved in accordance with Section 2 of the developer brief.

---

## 2. Toolchain Inventory & Environment Status

| Tool | Measured Host Version | Project Target Requirement | Notes |
|---|---|---|---|
| **Node.js** | `v24.19.0` | `>=24` (package.json) / `>=22` (docs & esbuild) | Fully satisfies both specifications |
| **npm** | `11.17.0` | `>=10` | Fully compatible |
| **Git** | `2.50.0.windows.1` | `>=2.40` | Windows native Git with symlink & submodule support |
| **Python / uv** | `uv 0.12.9` | `>=0.10` | Used for BMad orchestration, memlog, and setup scripts |
| **Foundry (`forge`, `anvil`)** | *Not currently installed on host* | Latest Foundry | Required for `*.fork.test.ts` (local chain fork) and contract compilation |
| **Rust / `wasm-pack`** | *Not currently installed on host* | Rust stable + `wasm-pack` | Required for building STARK prover WASM (`privacy/wasm`) |

---

## 3. TypeScript Typecheck & Compilation Results

All core TypeScript packages were audited and typechecked with zero errors:

| Package | Path | Typecheck Command | Result |
|---|---|---|---|
| `@ostraagent/sdk` | `upstream/ostra-robinhood/sdk` | `npm run typecheck` | ✅ **0 errors** (Clean) |
| `@ostraagent/core` | `upstream/ostra-robinhood/core` | `npm run typecheck` | ✅ **0 errors** (Clean) |
| `@ostraagent/swap` | `upstream/ostra-swap/sdk` | `npm run typecheck` | ✅ **0 errors** (Clean) |
| `@ostraagent/mcp` | `upstream/ostra-robinhood/mcp` | `npm run typecheck` | ✅ **0 errors** (Clean) |

---

## 4. Test Suite Audit & Gap Analysis

### 4.1. Unit Test Passes (Pure Logic & Cryptography)
- **74 Unit Tests PASSED** in `@ostraagent/sdk`:
  - Leaf amount validation (10 USDG fixed leaf)
  - Net fee calculation & fee_bps
  - LtHash homomorphic parameters and program crate vectors
  - Accumulators and union checks
  - ExpLib.wExp and AdaptiveCurveIrm interest rate curves
  - SharesMathLib rounding and utilization steps
  - Profile and metadata ERC-8004 URI validation
  - Merkle tree multi-share proof verification
- **55 Unit Tests PASSED** in `@ostraagent/core`:
  - Token amount formatters and decimal normalizers
  - Key derivations across vault kinds, chains, and indices
  - Relayer terms, channel deposit rules, and split checks
  - Session key storage and WOTS key verification
  - Unshield uniform random window generation
  - IPFS gateway fallback and CID parsing

### 4.2. Failing Tests & Root Causes
1. **Missing `anvil` binary (`Error: spawn anvil ENOENT`):**
   - Affects all `*.fork.test.ts` suites (66 tests in SDK/core/swap).
   - The test harness attempts to launch a local Robinhood Chain fork via `anvil`.
   - **Resolution:** Install Foundry on the runner/dev environment, or run tests against the live Robinhood Testnet (`46630`) via RPC.
2. **Missing Compiled Contract ABIs (`ENOENT: out/OstraVault.sol/OstraVault.json`):**
   - Unit tests expecting Forge build artifacts failed because `forge build` hasn't run yet.
   - **Resolution:** Run `forge build` once Foundry is installed, generating `out/`.
3. **Missing Prover WASM Package (`ERR_MODULE_NOT_FOUND: ostra_prove.js`):**
   - Tests in `wasm-prover.test.ts` expect `upstream/ostra-swap/privacy/wasm/pkg/ostra_prove.js`.
   - **Resolution:** Build WASM prover via `wasm-pack` or bundle precompiled artifacts.
4. **Windows POSIX Compatibility:**
   - `fsync` on directory/file in certain temp directories threw Windows `EPERM`.
   - `upgrade-owner-rekey` expected POSIX `0600` mode permissions.
   - **Resolution:** Normalize file permission assertion for Windows environments in Orven test runners.

---

## 5. Deployed Contract Address Baseline (Mainnet Reference)

For future reference and migration mapping, here is the deployed state of Ostra on Robinhood Chain Mainnet (`4663`):

### Core & Vaults (`ostra-robinhood`)
- **USDG Token:** `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` (6 decimals)
- **Batch Settlement:** `0x4020074e9dF2ce1deE5A9C1b5c3f541D02a10003`
- **Vault Beacon:** `0xE9F525B9EaeE48d13AEd28fE146F48f2832a18a0`
- **Vault Implementation:** `0xec0ca4A1393D91c42cA809F7F9dd82Bd597E8E58`
- **Vault Factory:** `0x043a15c514CFE2c797d33520bFF91a5DCdbf2979`
- **Pool Beacon:** `0x30669Ca534921038a531BBE27116d85bB7406fFF`
- **Pool Implementation:** `0xC04d4a222dC1C966640B977608bE29949b0648ec`
- **Pool:** `0x6ea80F2462e5Fd783B0Ec3B2c7BaC96795980CD6`
- **Split Factory:** `0xAAf54A483B2c7c2c5ecFc1eDED5ed1619C1bA882`
- **Beacon Owner:** `0x55533a51d9bd9b06F2D179d919BB31995EF96E5e`
- **Registry:** `0xcE6Cc1f93744f4090DA1444Bb8590d9206157506`
- **Vault Module V4:** `0x55A89fF907f5F5756470e2ec5Dc5E4E1C54Da770`
- **Circuit Breaker:** `0x2E33244dE6A64007204f763e9ef81FC33F1a8e01`

### Launchpad (`ostra-robinhood`)
- **Hook:** `0x63A784afb8905452aDceC471a45E555F5caE68cC`
- **Fees:** `0x8e79671DC9729476614C78aFcf2345D4c1963801`
- **Launchpad:** `0xfC57162C0e3f9773F97fEa8d276e957d7c43A6C5`
- **Creator Split:** `0x987994dE6A1d5303B9e3F50977cB0321BA4D033B`
- **Dispatcher:** `0x44Bb65164b2855f8E80B142d5Fb9bDb72E869986`
- **Locker:** `0xb593812363bAd70Ee381c7B54c4FC82b0BA3A4A7`
- **Dev Buy:** `0x0e1Fd799E136dcfEcad5695B07Ac5DAc5B2fF4bc`
- **Vesting:** `0xadD9C1995910457312c156E7D8120D1b447E179a`
- **Airdrop:** `0xBC798D956aF4c2B104FFC6106d5322294Bc103bb`

### Swap & STARK Privacy (`ostra-swap`)
- **Router:** `0x5b9686f384A5Fb768B2360cF0B893F0d1E960B01`
- **Stake:** `0xaDA4FaB9c8aB9165bf4d6cD9d4Da6d6b32Bb4BC6`
- **Buyback:** `0xd86083031b7Af66ecD5C9c5e90D4C6d8E661F3f5`
- **Spend Verifier:** `0x0a0E28a81DE6289e5044950163FfE95b37180e3B`
- **Private Pool:** `0xe4250895Da2499602Cee4e178Fb46A0cF39F5b76`

### Work Marketplace (`ostrapad`)
- **OstraPad Escrow:** `0x1BE28c4F08a548598fE0AA9b16DFD564C82E8055`
- **Deployer / Treasury:** `0x6569E27A95a6A3E92A311B4Cc6600fed56aA50A2`
- **Burn Sink:** `0xd86083031b7Af66ecD5C9c5e90D4C6d8E661F3f5`

---

## 6. Frontend Reference Discovery

The web application gap identified in Section 2 has been **100% resolved** by the local mirror located at `app.ostraagent.xyz`:
- **Complete Design System:** Custom Swiss-modernist CSS tokens (`276348cbea5a4acc.css`), Google Fonts (`Schibsted Grotesk` + `JetBrains Mono`), and SVG icons.
- **5 Core Route Structures:**
  1. `/vault`: In-browser WOTS key generation, USDG balance, relayer transactions.
  2. `/swap`: Uniswap v3/v4 routing, slippage controls, token selector, vault orders.
  3. `/pad`: Token launchpad and decentralized work escrow.
  4. `/lock`: OSTRA locking and 4-tier trading fee discounts (0.20% down to 0%).
  5. `/tide`: Agent points, epoch tracking, and reward allocations.

---

## 7. Next Action Items (Milestone B & C Sequence)

1. **Foundry Installation & Contract Build:** Set up Foundry on dev environment to run `forge build` and compile contract ABIs into `out/`.
2. **Orven Testnet Deployment Manifest:** Prepare `deployments/robinhood-testnet.json` targeting Chain ID `46630`.
3. **Orven Web App Scaffold:** Set up Next.js app in `apps/web/` adopting the UIKit tokens from `app.ostraagent.xyz` with Orven branding.
4. **Orven MCP Server (`@orven/mcp`):** Configure packaging scripts targeting testnet endpoints.
5. **AI Gateway Service:** Scaffold independent backend service in `services/ai-gateway/`.
