export interface ChainConfig {
    id: number;
    name: string;
    network: string;
    rpcUrl: string;
    explorerUrl: string;
    currency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    isTestnet: boolean;
}
export declare const ROBINHOOD_TESTNET: ChainConfig;
export declare const ROBINHOOD_MAINNET: ChainConfig;
export declare const DEFAULT_CHAIN: ChainConfig;
