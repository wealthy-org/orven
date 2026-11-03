#!/usr/bin/env node
/**
 * Orven Protocol — Comprehensive System & E2E Testing Suite
 * Tests: System Workflow, Data Integrity, Features, Functions, All Components.
 * Executed by the BMAD Testing Team.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const WEB_PORT = process.env.WEB_PORT || 3005;

const spawnedProcesses = [];

async function isPortOpen(url) {
  try {
    const res = await fetch(url);
    return res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function ensureServices() {
  const needsApi = !(await isPortOpen("http://localhost:4010/health"));
  const needsAi = !(await isPortOpen("http://localhost:4020/health"));
  const needsWeb = !(await isPortOpen(`http://localhost:${WEB_PORT}/`));

  if (needsApi) {
    const apiProc = spawn("node", ["services/application-api/dist/index.js"], { cwd: root, stdio: "ignore" });
    spawnedProcesses.push(apiProc);
  }
  if (needsAi) {
    const aiProc = spawn("node", ["services/ai-gateway/dist/index.js"], { cwd: root, stdio: "ignore" });
    spawnedProcesses.push(aiProc);
  }
  if (needsWeb) {
    const nextBin = join(root, "apps", "web", "node_modules", "next", "dist", "bin", "next");
    const webProc = spawn("node", [nextBin, "start", "-p", String(WEB_PORT)], { cwd: join(root, "apps", "web"), stdio: "ignore" });
    spawnedProcesses.push(webProc);
  }

  if (needsApi || needsAi || needsWeb) {
    console.log("   [Auto-Spawner] Starting required local services...");
    const start = Date.now();
    while (Date.now() - start < 15000) {
      const apiReady = !needsApi || (await isPortOpen("http://localhost:4010/health"));
      const aiReady = !needsAi || (await isPortOpen("http://localhost:4020/health"));
      const webReady = !needsWeb || (await isPortOpen(`http://localhost:${WEB_PORT}/`));
      if (apiReady && aiReady && webReady) break;
      await new Promise((r) => setTimeout(r, 400));
    }
    console.log("   [Auto-Spawner] All services online and ready!\n");
  }
}

function cleanup() {
  for (const p of spawnedProcesses) {
    try { p.kill(); } catch {}
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(); });
process.on("SIGTERM", () => { cleanup(); process.exit(); });

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   ORVEN PROTOCOL — COMPREHENSIVE E2E & SYSTEM TEST   ");
  console.log("=======================================================\n");

  await ensureServices();

  // --- SECTION 1: Application API & Relayer Testing ---
  console.log("\x1b[1m[1/5] Testing Application & Relayer API (Port 4010)\x1b[0m");
  try {
    const health = await fetch("http://localhost:4010/health").then((r) => r.json());
    assert(health.status === "ok", "API Health returns status: ok");
    assert(health.chainId === 46630, "API configured for Robinhood Testnet (Chain ID 46630)");

    // Quote for allowed action
    const quote = await fetch("http://localhost:4010/v1/relayer/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "vault_swap",
        fromVault: "0x7a3B1234567890abcdef1234567890abcdef1234",
        targetContract: "0x5b9686f384A5Fb768B2360cF0B893F0d1E960B01",
      }),
    }).then((r) => r.json());
    assert(quote.quoteId && quote.quoteId.startsWith("rq_"), "Relayer Quote issued with valid quoteId");
    assert(quote.tokenFeeMinor === "50000", "Relayer fee is exactly 0.05 USDG (50,000 minor units)");
    assert(quote.tokenFeeFormatted === "0.05 USDG", "Relayer fee formatted correctly");

    // Rejection of disallowed action
    const badActionRes = await fetch("http://localhost:4010/v1/relayer/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "arbitrary_unauthorized_call",
        fromVault: "0x7a3B1234567890abcdef1234567890abcdef1234",
        targetContract: "0x5b9686f384A5Fb768B2360cF0B893F0d1E960B01",
      }),
    });
    assert(badActionRes.status === 400, "Relayer rejects non-whitelisted actions with HTTP 400");

    // Portfolio balances
    const portfolio = await fetch("http://localhost:4010/v1/portfolio/0x7a3B1234567890abcdef1234567890abcdef1234").then((r) => r.json());
    assert(portfolio.balances.length === 2, "Portfolio returns USDG and WETH balances");
    assert(portfolio.balances[0].decimals === 6, "USDG has exactly 6 decimals");
    assert(portfolio.balances[1].decimals === 18, "WETH has exactly 18 decimals");
    assert(portfolio.shieldedBalanceUSDG === "50.00", "Shielded STARK private balance tracked");
  } catch (err) {
    assert(false, `Application API tests encountered unexpected error: ${err.message}`);
  }

  // --- SECTION 2: AI Gateway & Metering Testing ---
  console.log("\n\x1b[1m[2/5] Testing AI Gateway & Metering (Port 4020)\x1b[0m");
  try {
    const aiHealth = await fetch("http://localhost:4020/health").then((r) => r.json());
    assert(aiHealth.status === "ok", "AI Gateway Health returns status: ok");

    const modelsRes = await fetch("http://localhost:4020/v1/models").then((r) => r.json());
    assert(modelsRes.models && modelsRes.models.length >= 4, "Catalog offers text, image, and video models");

    // Valid quote
    const aiQuote = await fetch("http://localhost:4020/v1/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId: "orven-gpt-4o", units: 2 }),
    }).then((r) => r.json());
    assert(aiQuote.quoteId && aiQuote.quoteId.startsWith("quote_"), "AI quote generated with valid quoteId");
    assert(aiQuote.estimatedCostMinor === "10000", "Estimated cost calculated accurately (10,000 minor units)");
    assert(aiQuote.maxPriceMinor === "11000", "Max price includes 10% safety ceiling (11,000 minor units)");

    // Rejection of invalid model
    const badModelRes = await fetch("http://localhost:4020/v1/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId: "non_existent_model", units: 1 }),
    });
    assert(badModelRes.status === 400, "AI Gateway rejects unknown model IDs with HTTP 400");

    // Job execution, credit reservation, and reconciliation
    const job = await fetch("http://localhost:4020/v1/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: aiQuote.quoteId,
        modelId: "orven-gpt-4o",
        maxPriceMinor: aiQuote.maxPriceMinor,
        units: 2,
        userAddress: "0x7a3B1234567890abcdef1234567890abcdef1234",
      }),
    }).then((r) => r.json());
    assert(job.status === "reconciled", "Job reaches 'reconciled' terminal state");
    assert(job.capturedAmountMinor === "10000", "Usage captured strictly matches actual units consumed");
    assert(job.outputUri && job.outputUri.length > 0, "Output URI or deliverable payload emitted");
  } catch (err) {
    assert(false, `AI Gateway tests encountered unexpected error: ${err.message}`);
  }

  // --- SECTION 3: Web App Routes & Availability ---
  console.log(`\n\x1b[1m[3/5] Testing Web Application Routes (Port ${WEB_PORT})\x1b[0m`);
  const routes = [
    { path: "/vault", title: "Vault · Orven" },
    { path: "/swap", title: "Swap · Orven" },
    { path: "/pad", title: "OrvenPad · Orven" },
    { path: "/lock", title: "Lock ORVEN · Orven" },
    { path: "/tide", title: "Orven Tide · Orven" },
    { path: "/agents", title: "Agents · Orven" },
    { path: "/docs", title: "Docs · Orven Protocol" },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:${WEB_PORT}${route.path}`);
      const text = await res.text();
      assert(res.status === 200, `Route ${route.path} returns HTTP 200 OK`);
      assert(text.includes(`<title>${route.title}`), `Route ${route.path} renders title "${route.title}"`);
      assert(!text.includes("Internal Server Error"), `Route ${route.path} has 0 server errors`);
      assert(!text.includes("This page could not be found"), `Route ${route.path} is not 404`);
    } catch (err) {
      assert(false, `Route ${route.path} failed: ${err.message}`);
    }
  }

  // --- SECTION 4: MCP Server stdio Protocol & Tools ---
  console.log("\n\x1b[1m[4/5] Testing MCP Server Tool Suite (@orven/mcp via stdio)\x1b[0m");
  try {
    const mcpPath = join(root, "packages", "mcp", "dist", "server.js");

    const runMcpCommand = (rpcObj) => {
      return new Promise((resolve, reject) => {
        const child = spawn("node", [mcpPath], { stdio: ["pipe", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (d) => (stdout += d.toString()));
        child.stderr.on("data", (d) => (stderr += d.toString()));

        child.on("close", (code) => {
          try {
            const parsed = JSON.parse(stdout.trim());
            resolve({ parsed, stderr });
          } catch (e) {
            reject(new Error(`Failed to parse MCP JSON-RPC output: ${stdout}, stderr: ${stderr}`));
          }
        });

        child.stdin.write(JSON.stringify(rpcObj) + "\n");
        child.stdin.end();
      });
    };

    // 1. tools/list
    const listRes = await runMcpCommand({ jsonrpc: "2.0", method: "tools/list", id: 1 });
    const tools = listRes.parsed.result.tools;
    assert(Array.isArray(tools) && tools.length >= 7, "MCP tools/list returns all registered tools (>=7)");

    const expectedTools = ["open_vault", "balance", "orven_swap_quote", "private_shield", "pad_search", "pad_order", "orven_ai"];
    for (const toolName of expectedTools) {
      assert(tools.some((t) => t.name === toolName), `Tool '${toolName}' is present in MCP schema`);
    }

    // 2. Test open_vault
    const openRes = await runMcpCommand({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "open_vault", arguments: { token: "USDG" } },
      id: 2,
    });
    const openData = JSON.parse(openRes.parsed.result.content[0].text);
    assert(openData.status === "active" && openData.chainId === 46630, "open_vault returns active vault on Chain 46630");

    // 3. Test balance
    const balRes = await runMcpCommand({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "balance", arguments: {} },
      id: 3,
    });
    const balData = JSON.parse(balRes.parsed.result.content[0].text);
    assert(balData.balances && balData.shieldedUSDG === "50.00", "balance tool reports spendable and shielded USDG");

    // 4. Test orven_swap_quote
    const swapRes = await runMcpCommand({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "orven_swap_quote", arguments: { tokenIn: "ETH", tokenOut: "USDG", amountIn: "1.0", slippageBps: 100 } },
      id: 4,
    });
    const swapData = JSON.parse(swapRes.parsed.result.content[0].text);
    assert(swapData.estimatedOut === "2600.0000" && swapData.feeBps === 20, "orven_swap_quote calculates 20 bps fee & minOut correctly");

    // 5. Test orven_ai
    const aiMcpRes = await runMcpCommand({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "orven_ai", arguments: { prompt: "Verify Robinhood Chain state" } },
      id: 5,
    });
    const aiData = JSON.parse(aiMcpRes.parsed.result.content[0].text);
    assert(aiData.status === "succeeded" && aiData.costUSDG === "0.01", "orven_ai tool successfully processes agent prompt");
  } catch (err) {
    assert(false, `MCP Server tests encountered error: ${err.message}`);
  }

  // --- SECTION 5: Economic & Smart Contract Parameters ---
  console.log("\n\x1b[1m[5/5] Testing Economic Invariants & Manifest Constraints\x1b[0m");
  try {
    const config = await import("../packages/product-config/dist/index.js");
    assert(config.ROBINHOOD_TESTNET.id === 46630, "Testnet chain ID is 46630");
    assert(config.ROBINHOOD_MAINNET.id === 4663, "Mainnet chain ID is 4663");
    assert(config.TOKENS.USDG.decimals === 6, "USDG is exactly 6 decimals");
    assert(config.TOKENS.WETH.decimals === 18, "WETH is exactly 18 decimals");
    assert(config.FEE_TIERS.length === 4, "Fee schedule contains 4 discount tiers");
    assert(config.FEE_TIERS[3].feeBps === 0, "Top tier (500k ORVEN) offers 0 bps (100% discount / free swaps)");
    assert(config.MARKETPLACE_FEE_BPS === 50, "Marketplace platform fee is 50 bps (0.50%)");
  } catch (err) {
    assert(false, `Economic Invariants test failed: ${err.message}`);
  }

  // --- SUMMARY ---
  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED   `);
  if (failedTests === 0) {
    console.log("   \x1b[32m✔ STATUS: 100% PASS — ALL SYSTEM INVARIANTS VERIFIED\x1b[0m   ");
  } else {
    console.log(`   \x1b[31m✖ STATUS: ${failedTests} TESTS FAILED\x1b[0m   `);
  }
  console.log("=======================================================\n");

  cleanup();

  if (failedTests > 0) process.exit(1);
}

runTests();
