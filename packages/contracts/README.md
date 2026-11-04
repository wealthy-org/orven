# 📜 @orven/contracts — Orven Protocol Core Smart Contracts

Core smart contract package for the Orven Protocol on **Robinhood Chain** (Arbitrum Orbit L2 stack: Testnet `46630` & Mainnet `4663`).

Written in **Solidity 0.8.30** and engineered with the **Foundry** toolchain.

---

## 🏛️ Architecture & Directory Overview

```
packages/contracts/
├── src/
│   ├── vault/          # Post-Quantum Vaults & WOTS 1-Time Signatures (OstraVault, Wots, LtHash, Factory)
│   ├── pool/           # Liquidity Pools & Uniswap v3/v4 Integration (OstraPool, Router, PrivatePool, Stake)
│   ├── launchpad/      # Token Launchpad & Fee Hooks (OstraLaunchpad, OstraHook, OstraFees, OstraToken)
│   ├── privacy/        # STARK Privacy Verification (SpendVerifier, FastTranscript, Notes, KB8)
│   ├── marketplace/    # Decentralized Escrow Work Marketplace (OstraPad)
│   ├── tide/           # Gamified 7-Day Performance & Multiplier System (OstraTide)
│   └── interfaces/     # Protocol ABI interfaces
├── out/                # Compiled Solc 0.8.30 bytecode & ABI artifacts
├── foundry.toml        # Foundry build & optimizer configuration
└── package.json        # NPM workspace configuration
```

---

## ⚡ Compilation & Testing

Requirements: [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`).

```bash
# Compile all contracts with Solc 0.8.30
forge build

# Run unit & fork tests
forge test
```

---

## 🚀 Deployment

Deployment is driven via the turnkey dual-engine network script:

```bash
# Testnet Deployment (Robinhood Chain Testnet, Chain ID 46630)
npm run deploy:testnet

# Mainnet Deployment (Robinhood Chain Mainnet, Chain ID 4663)
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:mainnet
```

Deployment manifests are automatically generated and versioned in:
- `deployments/robinhood-testnet.json`
- `deployments/robinhood-mainnet.json`

---
*Maintained by Orven Protocol Core Contributors.*
