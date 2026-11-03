import React from "react";
import { ROBINHOOD_TESTNET } from "@orven/product-config";

export function NetworkStatusBar() {
  return (
    <div className="status">
      <div className="wrap status-in mono">
        <span>
          <i className="live-dot" aria-hidden="true" style={{ backgroundColor: "#22c55e" }}></i>
          <span className="hide-sm">
            {ROBINHOOD_TESTNET.name} · {ROBINHOOD_TESTNET.id} (Simulation Mode)
          </span>
          <span className="show-sm">
            Robinhood Testnet ({ROBINHOOD_TESTNET.id})
          </span>
        </span>
      </div>
    </div>
  );
}
