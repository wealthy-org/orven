import React from "react";
import { useNetwork } from "@/lib/network";
import { useToast } from "@/lib/toast";

export function NetworkStatusBar() {
  const { isDeveloperMode, activeChain, toggleDeveloperMode, isMainnet } = useNetwork();
  const { toast } = useToast();

  const handleToggle = () => {
    const nextMode = !isDeveloperMode;
    toggleDeveloperMode(nextMode);
    if (nextMode) {
      toast.info(
        "Developer Mode Activated",
        "Switched to Robinhood Testnet (46630). Simulation faucet and sandbox keys active."
      );
    } else {
      toast.success(
        "Mainnet Mode Activated",
        "Switched to Robinhood Chain Mainnet (4663). Production smart contracts and live on-chain keys active."
      );
    }
  };

  return (
    <div className="status">
      <div className="wrap status-in mono">
        <div className="status-left">
          <i
            className="live-dot"
            aria-hidden="true"
            style={{ backgroundColor: isMainnet ? "#06b6d4" : "#22c55e" }}
          />
          <span className="hide-sm">
            {activeChain.name} · {activeChain.id} ({isMainnet ? "Live Production" : "Developer Sandbox"})
          </span>
          <span className="show-sm">
            {isMainnet ? "Mainnet (4663)" : "Testnet (46630)"}
          </span>
        </div>

        {/* Phantom-Style Developer Mode Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          className="phantom-dev-switch"
          aria-label="Toggle Developer Mode"
          title={isDeveloperMode ? "Turn off Developer Mode to switch to Mainnet (Chain 4663)" : "Turn on Developer Mode for Testnet (Chain 46630)"}
        >
          <span className="hide-sm">Developer Mode:</span>
          <span className="show-sm">Dev:</span>
          <span className={`phantom-switch-track ${isDeveloperMode ? "active" : ""}`}>
            <span className="phantom-switch-thumb" />
          </span>
          <span style={{ fontWeight: "700", color: isDeveloperMode ? "#16a34a" : "var(--mute-2)", width: "24px" }}>
            {isDeveloperMode ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
}
