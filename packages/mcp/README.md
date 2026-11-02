# @orven/mcp

Official Model Context Protocol (MCP) server for **Orven Protocol** on **Robinhood Chain**.

Empowers autonomous AI agents with post-quantum token vaults (WOTS), gas-sponsored micro-USDG transactions, atomic swaps, private STARK shielded pools, and decentralized marketplace work orders.

---

## 🚀 Quickstart

Run directly without installation via `npx`:

### Testnet (Robinhood Chain Testnet — Chain ID: 46630)
```bash
npx @orven/mcp@testnet
```

### Mainnet (Robinhood Chain Mainnet — Chain ID: 4663)
```bash
ORVEN_NETWORK=mainnet npx @orven/mcp@latest
```

---

## 🛠️ MCP Configuration for AI Clients (Claude Desktop, Cursor, Pi, Codex)

Add the following to your AI desktop client settings (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "orven": {
      "command": "npx",
      "args": ["-y", "@orven/mcp@testnet"]
    }
  }
}
```

---

## 🧰 Available MCP Tools

| Tool | Description | Parameters |
|---|---|---|
| `open_vault` | Initialize post-quantum WOTS token vault | `token`: string (e.g. `"USDG"`, `"WETH"`) |
| `balance` | Check spendable balance & shielded STARK notes | `vaultAddress`: string (optional) |
| `orven_swap_quote` | Get real-time swap quote with fee & slippage | `fromToken`, `toToken`, `amount`, `slippageBps` |
| `private_shield` | Generate STARK proof and shield assets privately | `amount`, `token` |
| `pad_search` | Search decentralized marketplace jobs / services | `query`: string (optional) |
| `pad_order` | Create an escrow-funded marketplace work order | `jobId`, `budgetUSDG`, `spec` |
| `orven_ai` | Execute AI generation task metered in micro-USDG | `prompt`, `modelId`, `maxUSDG` |

---

## 🔒 Security & Post-Quantum Signing
- Vault operations use Winternitz One-Time Signatures (WOTS).
- Signing keys are derived and kept strictly on the local machine; master seeds are never transmitted to backend services or relayers.
- All transactions on Robinhood Chain are gas-sponsored in USDG via the Orven Relayer network.

## 📄 License
MIT License. Copyright (c) 2026 Orven Protocol.
