import { randomUUID } from "node:crypto";
import { Reservation, JobStatus } from "./types.js";
import { MODEL_REGISTRY } from "./registry.js";

export class ReservationManager {
  private reservations: Map<string, Reservation> = new Map();
  private userCredits: Map<string, bigint> = new Map();
  private quotes: Map<string, { quoteId: string; modelId: string; maxPriceMinor: bigint; expiresAt: number }> = new Map();

  createQuote(modelId: string, units: number, userAddress: `0x${string}`) {
    const model = MODEL_REGISTRY[modelId];
    if (!model || !model.isAvailable) {
      throw new Error(`Model ${modelId} is not available`);
    }

    // Input sanitization & bounds check (Bugfix: Boundary & Edge-Hunter)
    if (!Number.isInteger(units) || units <= 0) {
      throw new Error("Units must be a positive integer");
    }
    if (units > model.maxLimit) {
      throw new Error(`Units exceed maximum allowed limit of ${model.maxLimit}`);
    }

    const estimatedCost = model.costPerUnitMinor * BigInt(units);
    // Add 10% safety margin for maxPrice
    const maxPrice = (estimatedCost * 110n) / 100n;
    const quoteId = `quote_${randomUUID().slice(0, 8)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min validity

    this.quotes.set(quoteId, {
      quoteId,
      modelId,
      maxPriceMinor: maxPrice,
      expiresAt,
    });

    return {
      quoteId,
      modelId,
      estimatedCostMinor: estimatedCost.toString(),
      maxPriceMinor: maxPrice.toString(),
      expiresAt,
    };
  }

  reserveCredit(quoteId: string, modelId: string, maxAmountMinor: bigint, userAddress: `0x${string}`): Reservation {
    // Verify quote existence & expiry (Bugfix: Sec-Hawk)
    const quote = this.quotes.get(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} does not exist or has expired`);
    }
    if (Date.now() > quote.expiresAt) {
      this.quotes.delete(quoteId);
      throw new Error(`Quote ${quoteId} has expired`);
    }
    if (quote.modelId !== modelId) {
      throw new Error(`Quote model mismatch: expected ${quote.modelId}, got ${modelId}`);
    }
    if (maxAmountMinor < quote.maxPriceMinor) {
      throw new Error(`Supplied maxAmount ${maxAmountMinor} is below authorized quote maxPrice ${quote.maxPriceMinor}`);
    }

    const balance = this.userCredits.get(userAddress) ?? 10_000_000n; // Default 10 USDG testnet simulation credit
    if (balance < maxAmountMinor) {
      throw new Error("Insufficient user credit balance for AI reservation");
    }

    // Atomic debit to reservation
    this.userCredits.set(userAddress, balance - maxAmountMinor);

    const reservation: Reservation = {
      reservationId: `res_${randomUUID().slice(0, 8)}`,
      quoteId,
      userAddress,
      modelId,
      maxAmountMinor,
      capturedAmountMinor: 0n,
      status: "reserved",
      createdAt: Date.now(),
    };

    this.reservations.set(reservation.reservationId, reservation);
    this.quotes.delete(quoteId); // One-time use quote
    return reservation;
  }

  reconcileUsage(reservationId: string, actualCostMinor: bigint, outputUri?: string, error?: string): Reservation {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    if (error) {
      // Complete refund if failed
      const balance = this.userCredits.get(reservation.userAddress) ?? 0n;
      this.userCredits.set(reservation.userAddress, balance + reservation.maxAmountMinor);
      reservation.status = "failed";
      reservation.error = error;
      return reservation;
    }

    // Safety: actual cost cannot exceed reserved maximum
    const cappedCost = actualCostMinor > reservation.maxAmountMinor ? reservation.maxAmountMinor : actualCostMinor;

    // Reconcile unused reservation
    const unused = reservation.maxAmountMinor - cappedCost;
    if (unused > 0n) {
      const balance = this.userCredits.get(reservation.userAddress) ?? 0n;
      this.userCredits.set(reservation.userAddress, balance + unused);
    }

    reservation.capturedAmountMinor = cappedCost;
    reservation.outputUri = outputUri;
    reservation.status = "reconciled";
    return reservation;
  }

  getReservation(reservationId: string): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  getUserBalance(userAddress: `0x${string}`): bigint {
    return this.userCredits.get(userAddress) ?? 10_000_000n;
  }
}
