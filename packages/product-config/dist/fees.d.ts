export declare const FEE_TIERS: readonly [{
    readonly minLocked: 0;
    readonly label: "Less than 100,000";
    readonly feeBps: 20;
    readonly feePercent: "0.20%";
}, {
    readonly minLocked: 100000;
    readonly label: "100,000";
    readonly feeBps: 15;
    readonly feePercent: "0.15%";
}, {
    readonly minLocked: 250000;
    readonly label: "250,000";
    readonly feeBps: 10;
    readonly feePercent: "0.10%";
}, {
    readonly minLocked: 500000;
    readonly label: "500,000";
    readonly feeBps: 0;
    readonly feePercent: "0%";
}];
export declare const MARKETPLACE_FEE_BPS = 50;
export declare const PRIVATE_SWAP_FEE_BPS = 20;
