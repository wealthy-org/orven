export type JobModality = "text" | "image" | "video";

export type JobStatus =
  | "quoted"
  | "payment_verified"
  | "reserved"
  | "submitted"
  | "running"
  | "succeeded"
  | "failed"
  | "reconciliation_pending"
  | "reconciled";

export interface AIModelDefinition {
  id: string;
  name: string;
  provider: string;
  modality: JobModality;
  costPerUnitMinor: bigint; // Minor units of USDG (6 decimals, 1 USDG = 1_000_000)
  unitName: string; // e.g. "1k tokens", "image", "second of video"
  maxLimit: number;
  isAvailable: boolean;
}

export interface QuoteRequest {
  modelId: string;
  requestedUnits: number;
  userAddress: `0x${string}`;
}

export interface QuoteResponse {
  quoteId: string;
  modelId: string;
  estimatedCostMinor: string;
  maxPriceMinor: string;
  expiresAt: number;
}

export interface Reservation {
  reservationId: string;
  quoteId: string;
  userAddress: `0x${string}`;
  modelId: string;
  maxAmountMinor: bigint;
  capturedAmountMinor: bigint;
  status: JobStatus;
  createdAt: number;
  outputUri?: string;
  error?: string;
}
