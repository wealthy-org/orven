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

export const ROBINHOOD_TESTNET: ChainConfig = {
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

export const ROBINHOOD_MAINNET: ChainConfig = {
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
