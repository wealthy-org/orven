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

export const TOKENS = {
  USDG: {
    address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168" as `0x${string}`,
    symbol: "USDG",
    name: "Global Dollar",
    decimals: 6,
    logo: "/logos/usdg.png",
  },
  WETH: {
    address: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as `0x${string}`,
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logo: "/logos/eth.png",
  },
  ETH: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    logo: "/logos/eth.png",
  },
} as const;

// Determine active network (default to testnet per testing phase)
const networkEnv = (process.env.ORVEN_NETWORK || "").toLowerCase();
const isMainnet = networkEnv === "mainnet" || networkEnv === "4663";

export const ACTIVE_CHAIN = isMainnet ? ROBINHOOD_MAINNET : ROBINHOOD_TESTNET;
