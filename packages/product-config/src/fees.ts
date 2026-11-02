export const FEE_TIERS = [
  { minLocked: 0, label: "Less than 100,000", feeBps: 20, feePercent: "0.20%" },
  { minLocked: 100_000, label: "100,000", feeBps: 15, feePercent: "0.15%" },
  { minLocked: 250_000, label: "250,000", feeBps: 10, feePercent: "0.10%" },
  { minLocked: 500_000, label: "500,000", feeBps: 0, feePercent: "0%" },
] as const;

export const MARKETPLACE_FEE_BPS = 50; // 0.50%
export const PRIVATE_SWAP_FEE_BPS = 20; // 0.20%
