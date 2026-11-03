export interface TokenInfo {
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
    logo: string;
}
export declare const TOKENS: {
    readonly USDG: {
        readonly address: `0x${string}`;
        readonly symbol: "USDG";
        readonly name: "Global Dollar";
        readonly decimals: 6;
        readonly logo: "/logos/usdg.png";
    };
    readonly WETH: {
        readonly address: `0x${string}`;
        readonly symbol: "WETH";
        readonly name: "Wrapped Ether";
        readonly decimals: 18;
        readonly logo: "/logos/eth.png";
    };
    readonly ETH: {
        readonly address: `0x${string}`;
        readonly symbol: "ETH";
        readonly name: "Ether";
        readonly decimals: 18;
        readonly logo: "/logos/eth.png";
    };
};
