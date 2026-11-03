import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ROBINHOOD_TESTNET, ROBINHOOD_MAINNET, ChainConfig } from "@orven/product-config";

export interface NetworkContextValue {
  isDeveloperMode: boolean;
  activeChain: ChainConfig;
  toggleDeveloperMode: (enable?: boolean) => void;
  explorerUrl: string;
  isMainnet: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  isDeveloperMode: true,
  activeChain: ROBINHOOD_TESTNET,
  toggleDeveloperMode: () => {},
  explorerUrl: "https://explorer.testnet.chain.robinhood.com",
  isMainnet: false,
});

const STORAGE_KEY = "orven_developer_mode_active";

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsDeveloperMode(stored === "true");
    }
  }, []);

  const toggleDeveloperMode = useCallback((enable?: boolean) => {
    setIsDeveloperMode((prev) => {
      const next = enable !== undefined ? enable : !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  const activeChain = isDeveloperMode ? ROBINHOOD_TESTNET : ROBINHOOD_MAINNET;
  const explorerUrl = isDeveloperMode
    ? "https://explorer.testnet.chain.robinhood.com"
    : "https://robinhoodchain.blockscout.com";
  const isMainnet = !isDeveloperMode;

  return (
    <NetworkContext.Provider
      value={{
        isDeveloperMode,
        activeChain,
        toggleDeveloperMode,
        explorerUrl,
        isMainnet,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
