# Orven Protocol — Security Architecture & Threat Model (`SECURITY.md`)

**Date:** 2 November 2026  
**Status:** Canonical Security Invariants & Audit Register  
**Scope:** In accordance with Section 20 of `ORVEN_ROBINHOOD_DEV_BRIEF.md`  

---

## 1. Core Cryptographic Invariants

### 1.1. Winternitz One-Time Signatures (WOTS)
- **Invariant:** A single WOTS private key must NEVER sign two different messages.
- **Enforcement:**
  - Keystore maintains a strictly monotonic counter (`currentKeyIndex`).
  - An encrypted local journal is written before any signature payload is emitted.
  - In the event of dropped submissions or network ambiguity, retry routines re-transmit the exact byte-for-byte signature payload.
  - A key index is permanently burned once used.

### 1.2. STARK Privacy & Nullifier Uniqueness
- **Invariant:** A note nullifier can only be spent once; double-spend transactions revert atomically.
- **Enforcement:**
  - `OstraPrivatePool.sol` stores spent nullifiers in `mapping(bytes32 => bool) public isSpent`.
  - Proof verification binds input commitments, nullifiers, recipient, and fee in public inputs.
  - Any proof with an existing nullifier is rejected before state mutation.

---

## 2. Trust Boundaries & Privileged Key Roles

| Entity | Authority & Scope | Must Never Possess |
|---|---|---|
| **User / Agent** | Full ownership of vault assets, note secrets, and local master seed | Ability to forge another vault's signature |
| **Relayer** | Submits transactions on behalf of users; collects token fees | Master seed of user vaults or ability to divert funds |
| **Single-Wallet Admin** | Upgrades beacons, sets fee parameters, pauses contracts | Direct access to user vault deposits or note secrets |
| **Evaluator** | Approves or rejects work deliverable within window | Ability to increase budget or change recipient |

### Deliberate Accepted Risk: Single-Wallet Admin
- Consistent with the precedent established on the Counter project, Orven uses a single-wallet admin (no multi-sig threshold required).
- **Mitigation:** UpgradeBeacon pattern with time-delayed upgrade execution where applicable, preventing instant malicious bytecode injection.

---

## 3. Smart Contract Protections

1. **Reentrancy Protection:** All fund-moving routines implement `nonReentrant` or transient storage locks (`ReentrancyGuardTransient`).
2. **Safe Token Transfers:** All ERC-20 transfers use `SafeERC20` (`safeTransfer`, `safeTransferFrom`), correctly handling non-compliant tokens (e.g. USDT missing return values).
3. **Slippage Enforcement:** Router guarantees output $\ge \text{minOut}$; otherwise transaction reverts and tokens remain in user vault.
4. **Emergency User Exit:** All vaults feature direct on-chain withdrawal methods that bypass off-chain relayers.
