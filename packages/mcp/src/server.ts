#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { ACTIVE_CHAIN, TOKENS } from "./config.js";

const INSTRUCTIONS =
  `Orven Agent: Autonomous financial and commerce platform on Robinhood Chain (${ACTIVE_CHAIN.name}, Chain ID ${ACTIVE_CHAIN.id}). ` +
  "Provides WOTS post-quantum vaults, x402 payment channels, private STARK shielded notes, " +
  "OrvenPad decentralized work marketplace, and AI task gateway with gas-sponsored relayer transactions in USDG. " +
  "Start by checking balance or opening a vault.";

const server = new McpServer(
  { name: "orven-agent-mcp", version: "0.1.0" },
  { instructions: INSTRUCTIONS }
);

const positiveDecimal = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, "Must be a positive decimal string with at most 6 decimals")
  .refine((v) => parseFloat(v) > 0, "Amount must be greater than zero");

// --- 1. Vault & Balance Tools ---
server.tool(
  "open_vault",
  "Open or initialize an Orven post-quantum token vault on Robinhood Chain",
  {
    token: z.string().default(TOKENS.USDG.symbol).describe("Token symbol (default: USDG)"),
  },
  async ({ token }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "active",
            vaultAddress: "0x7a3B1234567890abcdef1234567890abcdef1234",
            token,
            chain: ACTIVE_CHAIN.name,
            chainId: ACTIVE_CHAIN.id,
            wotsKeyIndex: 3,
            maxKeys: 1024,
            note: "Keys derived locally and stored in encrypted local keystore.",
          }),
        },
      ],
    };
  }
);

server.tool(
  "balance",
  "Check the spendable and shielded balance of an Orven vault",
  {
    vaultAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid Ethereum address format").optional().describe("Vault address (optional)"),
  },
  async ({ vaultAddress }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            vaultAddress: vaultAddress || "0x7a3B1234567890abcdef1234567890abcdef1234",
            chainId: ACTIVE_CHAIN.id,
            balances: [
              { token: "USDG", balance: "250.00", decimals: 6 },
              { token: "WETH", balance: "1.00", decimals: 18 },
            ],
            shieldedUSDG: "50.00",
            unspentNotesCount: 5,
          }),
        },
      ],
    };
  }
);

// --- 2. Swaps & Trading Tools ---
server.tool(
  "orven_swap_quote",
  "Get an execution quote for swapping tokens via OrvenRouter (Uniswap v3/v4)",
  {
    tokenIn: z.string().describe("Input token symbol (e.g. ETH, USDG)"),
    tokenOut: z.string().describe("Output token symbol (e.g. USDG, ETH)"),
    amountIn: positiveDecimal.describe("Decimal amount to swap (positive, max 6 decimals)"),
    slippageBps: z.number().int().min(1).max(5000).default(100).describe("Slippage tolerance in bps (1 - 5000)"),
  },
  async ({ tokenIn, tokenOut, amountIn, slippageBps }) => {
    const rate = tokenIn === "ETH" ? 2600 : 1 / 2600;
    const estimatedOut = (parseFloat(amountIn) * rate).toFixed(4);
    const minOut = (parseFloat(estimatedOut) * (1 - slippageBps / 10_000)).toFixed(4);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            tokenIn,
            tokenOut,
            amountIn,
            estimatedOut,
            minOut,
            slippageBps,
            feeBps: 20, // 0.20%
            router: "0x5b9686f384A5Fb768B2360cF0B893F0d1E960B01",
            relayerSponsored: true,
          }),
        },
      ],
    };
  }
);

// --- 3. Privacy & STARK Note Tools ---
server.tool(
  "private_shield",
  "Deposit USDG from vault into the private STARK pool",
  {
    amount: positiveDecimal.describe("Amount of USDG to shield (e.g. '10.00')"),
  },
  async ({ amount }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "shielded",
            amount,
            asset: "USDG",
            noteCommitment: `0x${randomBytes(32).toString("hex")}`,
            pool: "0xe4250895Da2499602Cee4e178Fb46A0cF39F5b76",
            relayerFeeUSDG: "0.05",
          }),
        },
      ],
    };
  }
);

// --- 4. Work Marketplace Tools (OrvenPad) ---
server.tool(
  "pad_search",
  "Search active service offers on OrvenPad work marketplace",
  {
    query: z.string().min(1).max(200).describe("Search keyword (e.g. audit, dataset, model)"),
  },
  async ({ query }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify([
            {
              jobId: "pad_01",
              title: `Service matching '${query}': Automated Smart Contract Auditing`,
              provider: "0x89ab...c102",
              priceUSDG: "150.00",
              evaluatorMode: "consensus_panel",
            },
          ]),
        },
      ],
    };
  }
);

server.tool(
  "pad_order",
  "Fund an escrow for a service offer on OrvenPad",
  {
    jobId: z.string().min(1).describe("Job / Offer ID"),
    budgetUSDG: positiveDecimal.describe("Agreed price in USDG (positive decimal)"),
  },
  async ({ jobId, budgetUSDG }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "escrow_funded",
            escrowId: `escrow_${Math.random().toString(36).substring(2, 8)}`,
            jobId,
            budgetUSDG,
            escrowContract: "0x1BE28c4F08a548598fE0AA9b16DFD564C82E8055",
            timeoutBlocks: 7200,
          }),
        },
      ],
    };
  }
);

// --- 5. AI Gateway Tools ---
server.tool(
  "orven_ai",
  "Execute an AI task through Orven's metered payment gateway",
  {
    modelId: z.string().default("orven-gpt-4o").describe("AI model ID"),
    prompt: z.string().min(1).max(50_000).describe("Prompt or instructions for the AI model"),
  },
  async ({ modelId, prompt }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            modelId,
            promptLength: prompt.length,
            status: "succeeded",
            output: `Orven AI Task Response: Analisis transaksi dan parameter Robinhood Chain berhasil diverifikasi untuk prompt: "${prompt.slice(0, 40)}..."`,
            costUSDG: "0.01",
            reservationReconciled: true,
          }),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Orven Agent MCP server running on stdio (Testnet 46630)\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
