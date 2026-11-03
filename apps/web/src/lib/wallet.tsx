import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ROBINHOOD_TESTNET, ROBINHOOD_MAINNET } from "@orven/product-config";

export interface WalletContextValue {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetId?: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  isCorrectNetwork: true,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!address;
  const isCorrectNetwork = !chainId || chainId === ROBINHOOD_TESTNET.id || chainId === ROBINHOOD_MAINNET.id;

  const getEthereum = () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return null;
  };

  const switchNetwork = useCallback(async (targetId: number = ROBINHOOD_TESTNET.id) => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const hexChainId = `0x${targetId.toString(16)}`;
    const targetConfig = targetId === ROBINHOOD_MAINNET.id ? ROBINHOOD_MAINNET : ROBINHOOD_TESTNET;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      // 4902 means the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError.message?.includes("Unrecognized chain")) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: targetConfig.name,
                rpcUrls: [targetConfig.rpcUrl],
                nativeCurrency: targetConfig.currency,
                blockExplorerUrls: [targetConfig.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Robinhood Chain:", addError);
        }
      } else {
        console.error("Failed to switch chain:", switchError);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      // Graceful fallback for environments without browser extension
      const useSim = window.confirm(
        "Web3 wallet (MetaMask / Rabby) extension not detected in this browser.\n\nWould you like to connect in Testnet Simulation Mode (0x7a3...4e19)?"
      );
      if (useSim) {
        setAddress("0x7a3B1234567890abcdef1234567890abcdef1234");
        setChainId(ROBINHOOD_TESTNET.id);
        localStorage.setItem("orven_wallet_simulated", "true");
      }
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        localStorage.setItem("orven_wallet_connected", "true");

        const currentChainHex = await ethereum.request({ method: "eth_chainId" });
        const currentChain = parseInt(currentChainHex, 16);
        setChainId(currentChain);

        // Prompt switch to Robinhood Testnet if on wrong chain
        if (currentChain !== ROBINHOOD_TESTNET.id && currentChain !== ROBINHOOD_MAINNET.id) {
          await switchNetwork(ROBINHOOD_TESTNET.id);
        }
      }
    } catch (err: any) {
      if (err.code !== 4001) {
        console.error("Wallet connection error:", err);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("orven_wallet_connected");
      localStorage.removeItem("orven_wallet_simulated");
    }
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const ethereum = getEthereum();
    const wasConnected = localStorage.getItem("orven_wallet_connected");
    const wasSimulated = localStorage.getItem("orven_wallet_simulated");

    if (wasSimulated) {
      setAddress("0x7a3B1234567890abcdef1234567890abcdef1234");
      setChainId(ROBINHOOD_TESTNET.id);
      return;
    }

    if (ethereum && wasConnected) {
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            ethereum.request({ method: "eth_chainId" }).then((chainHex: string) => {
              setChainId(parseInt(chainHex, 16));
            });
          }
        })
        .catch(() => {});
    }

    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          disconnect();
        }
      };

      const handleChainChanged = (chainHex: string) => {
        setChainId(parseInt(chainHex, 16));
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected,
        isConnecting,
        isCorrectNetwork,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
