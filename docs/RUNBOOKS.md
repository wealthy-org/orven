# Orven Protocol — Operational Runbooks & Emergency Procedures (`RUNBOOKS.md`)

**Date:** 2 November 2026  
**Status:** Canonical Operations Manual  
**Scope:** In accordance with Section 22 and 25 of `ORVEN_ROBINHOOD_DEV_BRIEF.md`  
**Network:** Robinhood Chain (Testnet: `46630`, Mainnet: `4663`)  

---

## 1. RPC Outage & Network Connectivity Failover

### Symptom:
Transaction simulation timeouts, dropped eth_sendRawTransaction calls, or HTTP 429/403 errors from the Robinhood Chain RPC.

### Severity: High

### Procedure:
1. **ISP Blocking Verification:** Many Indonesian and regional ISPs block Robinhood Chain endpoints by default. Ensure developers and server hosts have an active VPN / Wireguard tunnel established before troubleshooting further.
2. **Endpoint Failover:**
   - In `packages/product-config/src/chains.ts`, update `rpcUrl` to secondary backup endpoint:
     - Primary: `https://rpc.testnet.chain.robinhood.com`
     - Secondary Archive/Dedicated: `https://rpc.mainnet.chain.robinhood.com` (or enterprise provider Infura/Alchemy/QuickNode when provisioned).
3. **Health Check Command:**
   ```bash
   curl -s -X POST https://rpc.testnet.chain.robinhood.com \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
4. **Relayer Pause:** If RPC latency exceeds 5,000ms, the relayer automatically enters backoff mode to prevent nonce congestion.

---

## 2. Chain Reorg & Indexer Replay

### Symptom:
Emitted events disappear from subsequent blocks or transaction receipts return conflicting logs.

### Severity: Medium

### Procedure:
1. Stop the indexer daemon:
   ```bash
   pkill -f "orven-application-api"
   ```
2. Trigger idempotent log re-scan from safe finalized block (current block - 64 blocks):
   ```bash
   RESCAN_FROM_BLOCK=$(($(cast block-number --rpc-url https://rpc.testnet.chain.robinhood.com) - 64))
   echo "Re-indexing from safe finalized block: $RESCAN_FROM_BLOCK"
   ```
3. Restart API service with `RESCAN_FROM_BLOCK` flag. The indexer enforces idempotent deduplication using `(chainId, blockHash, logIndex)` tuples.

---

## 3. Relayer Compromise & Hot Wallet Rotation

### Symptom:
Unauthorized transactions submitted by relayer address or unexpected ETH float drainage.

### Severity: Critical (SPOF)

### Procedure:
1. **Immediate Revocation:** The Single-Wallet Admin calls `setRelayer(newRelayerAddress)` on `OstraVaultFactory` and `OstraPool`.
2. **Generate New Keypair:**
   ```bash
   cast wallet new
   ```
3. **Fund New Float:** Transfer minimum testnet ETH to new relayer address.
4. **Deploy Updated Secrets:** Update `services/application-api/.env` with `RELAYER_PRIVATE_KEY` and restart service.

---

## 4. Low Gas Float & Automated Float Rebalancing

### Symptom:
Relayer ETH balance drops below threshold (`0.1 ETH` on Testnet, `0.05 ETH` on Mainnet).

### Severity: High

### Procedure:
1. Relayer monitors own ETH balance every 60 seconds.
2. If balance < `0.1 ETH`:
   - An alert is emitted to operator logs.
   - Relayer calls `convertFeesToEth()` or claims accumulated USDG gas sponsorship fees to swap via `OrvenRouter` for native ETH.
3. Manual replenishment: Send `0.5 ETH` to relayer address: `0x6569E27A95a6A3E92A311B4Cc6600fed56aA50A2`.

---

## 5. Duplicate Submission & WOTS Anti-Reuse Protection

### Symptom:
A user or agent re-submits a transaction that timed out on-chain.

### Invariant:
**ONE WOTS KEY MUST NEVER SIGN TWO DIFFERENT MESSAGES.**

### Procedure:
1. `BrowserVaultManager` and `@orven/mcp` query the local encrypted journal before signing.
2. If a transaction hash exists for `currentKeyIndex`:
   - The signer **refuses** to generate a new signature.
   - The signer resubmits the **exact identical signed bytes** to the relayer.
3. If the transaction confirmed or reverted on-chain, the key index is permanently retired, and the next operation monotonically advances to `currentKeyIndex + 1`.

---

## 6. Stale Signer State & Keystore Recovery

### Symptom:
User clears browser cache or switches devices without backing up the master seed.

### Procedure:
1. A vault cannot be recovered without either:
   - The 32-byte master seed / recovery phrase, OR
   - An authorized Guardian threshold transaction (`OstraVaultModule.requestRecovery`).
2. **Guardian Recovery Journey:**
   - 2 of 3 designated guardians submit `supportRecovery(newKeyRoot)`.
   - Wait for `MAX_RECOVERY_DELAY` (72 hours).
   - Execute `finishRecovery()` on `OstraVault` to bind the vault to the new seed.

---

## 7. AI Gateway Provider Outage & Circuit Breaker

### Symptom:
External AI provider (OpenAI, Anthropic, BFL, Runway) returns HTTP 500, 503, or rate limit 429.

### Procedure:
1. **Circuit Breaker:** If 3 consecutive provider requests time out (>30s), the gateway trips circuit breaker for that model.
2. **Automatic Refund:** Unfulfilled credit reservations are immediately restored to the user's micro-USDG balance:
   ```typescript
   manager.reconcileUsage(reservationId, 0n, undefined, "Provider timeout error");
   ```
3. **Fallback Routing:** If `orven-gpt-4o` fails, traffic can be diverted to `orven-claude-3-5-sonnet` if approved by client settings.

---

## 8. Keeper Outage & Manual Order Cancellation / Refund

### Symptom:
Limit orders or DCA tranches remain unfilled after expiry because the keeper service stopped.

### Procedure:
1. Funds held in `OstraRouter` escrow are **never permanently locked**.
2. Any user can directly call `cancelOrder(orderHash)` or `refundEscrow(escrowAddress)` on `OstraRouter`.
3. The escrow verifies `block.timestamp > order.deadline` and refunds 100% of input tokens back to the user vault without requiring keeper approval.

---

## 9. Blocked Marketplace Payouts (Ostrapad Dispute)

### Symptom:
Evaluator fails to submit a verdict within `EVAL_WINDOW` (72 hours).

### Procedure:
1. If an evaluator stalls, `OstraPad.sol` permits either party to call `claimTimeout()`:
   - If provider delivered before deadline and evaluator went dark -> Funds release to provider.
   - If provider never delivered before deadline -> 100% refund returns to client escrow.
2. Evaluator's staked bond is slashed and distributed to protocol burn sink.

---

## 10. Contract Upgrade Procedure (Single-Wallet Admin)

### Procedure:
1. Deploy new implementation contract (e.g. `OstraVaultV5.sol`):
   ```bash
   forge create src/OstraVaultV5.sol:OstraVaultV5 --rpc-url $RPC --private-key $ADMIN_KEY
   ```
2. Single-Wallet Admin calls `upgradeTo(newImplementation)` on `OstraVaultBeacon`.
3. Verify beacon state:
   ```bash
   cast call $BEACON_ADDRESS "implementation()(address)" --rpc-url $RPC
   ```
4. All existing proxy vaults instantly inherit new functionality while preserving complete storage layout and user balances.

---

## 11. Emergency User Exit Path

### Guarantee:
If the Orven frontend, relayer, keeper, and website go completely offline, **user funds are never trapped**.

### Direct EOA Withdrawal via Blockscout:
1. Open official Blockscout explorer: `https://robinhoodchain.blockscout.com`.
2. Navigate to user vault address -> `Write as Proxy`.
3. Connect standard wallet (or use local WOTS signature).
4. Call `withdraw(tokenAddress, recipientAddress, amount)`:
   - Vault releases USDG directly to user wallet on-chain.
   - Zero reliance on Orven servers or operator keys.
