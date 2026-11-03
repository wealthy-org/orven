export const ROBINHOOD_TESTNET = {
    id: 46630,
    name: "Robinhood Chain Testnet",
    network: "robinhood-testnet",
    rpcUrl: "https://rpc.testnet.chain.robinhood.com",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
    currency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    isTestnet: true,
};
export const ROBINHOOD_MAINNET = {
    id: 4663,
    name: "Robinhood Chain",
    network: "robinhood-mainnet",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    explorerUrl: "https://robinhoodchain.blockscout.com",
    currency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    isTestnet: false,
};
export const DEFAULT_CHAIN = ROBINHOOD_TESTNET;
