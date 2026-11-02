import { ROBINHOOD_TESTNET, TOKENS } from "@orven/product-config";

export interface RelayQuoteRequest {
  action: "vault_transfer" | "vault_swap" | "open_channel" | "close_channel" | "shield";
  fromVault: `0x${string}`;
  targetContract: `0x${string}`;
  estimatedGasUnits?: number;
}

export interface RelayQuoteResponse {
  quoteId: string;
  action: string;
  gasUnits: number;
  tokenFeeMinor: string; // in USDG minor units (6 decimals)
  tokenFeeFormatted: string; // e.g. "0.05 USDG"
  ethCostGwei: string;
  relayerAddress: `0x${string}`;
  validUntil: number;
}

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

export class RelayerEngine {
  private allowedActions = new Set([
    "vault_transfer",
    "vault_swap",
    "open_channel",
    "close_channel",
    "shield",
  ]);

  private activeQuotes: Map<string, { quoteId: string; action: string; validUntil: number }> = new Map();

  getQuote(req: RelayQuoteRequest): RelayQuoteResponse {
    // 1. Action allowlist check
    if (!this.allowedActions.has(req.action)) {
      throw new Error(`Action ${req.action} is not in relayer allowlist`);
    }

    // 2. Address format verification (Bugfix: Sec-Hawk)
    if (!req.fromVault || !ADDRESS_REGEX.test(req.fromVault)) {
      throw new Error(`Invalid fromVault address format: ${req.fromVault}`);
    }
    if (!req.targetContract || !ADDRESS_REGEX.test(req.targetContract)) {
      throw new Error(`Invalid targetContract address format: ${req.targetContract}`);
    }

    // 3. Gas bounds check (Bugfix: Edge-Hunter)
    const gasUnits = req.estimatedGasUnits || 120_000;
    if (gasUnits <= 0 || gasUnits > 5_000_000) {
      throw new Error("Estimated gas units out of permitted bounds (1 - 5,000,000)");
    }

    const feeMinor = 50_000n; // 0.05 USDG
    const quoteId = `rq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const validUntil = Date.now() + 180_000; // 3 minutes

    this.activeQuotes.set(quoteId, { quoteId, action: req.action, validUntil });

    return {
      quoteId,
      action: req.action,
      gasUnits,
      tokenFeeMinor: feeMinor.toString(),
      tokenFeeFormatted: "0.05 USDG",
      ethCostGwei: "15",
      relayerAddress: "0x6569E27A95a6A3E92A311B4Cc6600fed56aA50A2",
      validUntil,
    };
  }

  simulateRelay(quoteId: string, signedPayload: string) {
    if (!quoteId) {
      throw new Error("Missing required quoteId");
    }

    // Verify quote existence & expiry (Bugfix: Sec-Hawk)
    const quote = this.activeQuotes.get(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} does not exist or has expired`);
    }
    if (Date.now() > quote.validUntil) {
      this.activeQuotes.delete(quoteId);
      throw new Error(`Quote ${quoteId} has expired`);
    }

    if (!signedPayload || signedPayload.length < 10) {
      throw new Error("Invalid signed transaction payload: payload too short or malformed");
    }

    this.activeQuotes.delete(quoteId); // One-time use

    return {
      success: true,
      quoteId,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      status: "confirmed",
      blockNumber: 99_120_450,
      feeChargedUSDG: "0.05",
      gasUsed: 112_400,
    };
  }
}
