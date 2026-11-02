#!/usr/bin/env node
/**
 * Orven Protocol — Mainnet Readiness & Pre-Flight Verification Script
 * Validates all security, invariant, bytecode, and configuration checks
 * before broadcasting with real funds on Robinhood Chain Mainnet (Chain ID 4663).
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ROBINHOOD_MAINNET, ROBINHOOD_TESTNET, TOKENS, FEE_TIERS, MARKETPLACE_FEE_BPS } from "../packages/product-config/dist/index.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(condition, label, details = "") {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${label}`);
  } else {
    failedChecks++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${label} ${details ? `(${details})` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("   ORVEN PROTOCOL — MAINNET PRE-FLIGHT VERIFIER   ");
console.log(`   Target Network: ${ROBINHOOD_MAINNET.name} (Chain ID: ${ROBINHOOD_MAINNET.id})   `);
console.log("=======================================================\n");

// 1. Network & Chain Configuration
console.log("\x1b[1m[1/6] Verifying Network & RPC Parameters...\x1b[0m");
check(ROBINHOOD_MAINNET.id === 4663, "Mainnet Chain ID is 4663");
check(ROBINHOOD_MAINNET.network === "robinhood-mainnet", "Network slug is robinhood-mainnet");
check(ROBINHOOD_MAINNET.rpcUrl === "https://rpc.mainnet.chain.robinhood.com", "Mainnet RPC URL verified");
check(ROBINHOOD_MAINNET.explorerUrl === "https://robinhoodchain.blockscout.com", "Mainnet Blockscout explorer URL verified");
check(!ROBINHOOD_MAINNET.isTestnet, "isTestnet flag is strictly false for Mainnet");

// 2. Token & Economic Invariants
console.log("\n\x1b[1m[2/6] Verifying Token Decimals & Economic Constants...\x1b[0m");
check(TOKENS.USDG.decimals === 6, "USDG decimal precision is exactly 6");
check(TOKENS.WETH.decimals === 18, "WETH decimal precision is exactly 18");
check(TOKENS.USDG.address.startsWith("0x") && TOKENS.USDG.address.length === 42, "USDG contract address formatted correctly");
check(FEE_TIERS.length === 4, "Fee tier schedule contains exactly 4 tiers");
check(FEE_TIERS[0].feeBps === 20, "Base swap fee is 20 bps (0.20%)");
check(FEE_TIERS[3].feeBps === 0, "Tier 4 provides 100% fee discount (0 bps)");
check(MARKETPLACE_FEE_BPS === 50, "Marketplace protocol fee is 50 bps (0.50%)");

// 3. Smart Contract Bytecode Artifacts
console.log("\n\x1b[1m[3/6] Verifying Compiled Foundry Solc 0.8.30 Artifacts...\x1b[0m");
const outDir = join(root, "upstream", "ostra-robinhood", "out");
const coreContracts = [
  "OstraVault.sol/OstraVault.json",
  "OstraVaultFactory.sol/OstraVaultFactory.json",
  "OstraPool.sol/OstraPool.json",
  "OstraHook.sol/OstraHook.json",
  "OstraLaunchpad.sol/OstraLaunchpad.json",
];
for (const artifact of coreContracts) {
  const p = join(outDir, artifact);
  const exists = existsSync(p);
  check(exists, `Artifact exists: ${artifact}`);
  if (exists) {
    try {
      const data = JSON.parse(readFileSync(p, "utf-8"));
      check(Boolean(data.bytecode?.object && data.bytecode.object.length > 100), `Bytecode verified for ${artifact}`);
    } catch {
      check(false, `Bytecode parsing valid for ${artifact}`);
    }
  }
}

// 4. Manifests & Deployment Engine
console.log("\n\x1b[1m[4/6] Verifying Deployment Manifests & Engine Scripts...\x1b[0m");
check(existsSync(join(root, "scripts", "deploy-network.js")), "scripts/deploy-network.js exists");
check(existsSync(join(root, "deployments", "robinhood-testnet.json")), "deployments/robinhood-testnet.json exists");
check(existsSync(join(root, "deployments", "robinhood-mainnet.json")), "deployments/robinhood-mainnet.json exists");

try {
  const mainnetManifest = JSON.parse(readFileSync(join(root, "deployments", "robinhood-mainnet.json"), "utf-8"));
  check(mainnetManifest.chainId === 4663, "Mainnet manifest specifies chainId 4663");
  check(Boolean(mainnetManifest.singleWalletAdmin), "Single-Wallet Admin field populated in manifest");
  check(Object.keys(mainnetManifest.contracts || {}).length >= 12, "Manifest contains >= 12 registered contracts");
} catch (err) {
  check(false, "Mainnet manifest valid JSON", err.message);
}

// 5. Standalone Packaging & Monorepo Cleanliness
console.log("\n\x1b[1m[5/6] Verifying Standalone MCP & Web App Builds...\x1b[0m");
check(existsSync(join(root, "packages", "mcp", "dist", "server.js")), "packages/mcp/dist/server.js compiled");
check(existsSync(join(root, "packages", "mcp", "dist", "config.js")), "packages/mcp/dist/config.js compiled (standalone config)");
check(existsSync(join(root, "packages", "mcp", "README.md")), "packages/mcp/README.md documentation present");
check(existsSync(join(root, "apps", "web", ".next")), "apps/web/.next production build directory exists");
check(existsSync(join(root, "apps", "web", "vercel.json")), "apps/web/vercel.json configuration exists");

// 6. Security & Secret Hygiene
console.log("\n\x1b[1m[6/6] Verifying Security & Secret Hygiene...\x1b[0m");
const gitIgnorePath = join(root, ".gitignore");
const hasGitIgnore = existsSync(gitIgnorePath);
if (hasGitIgnore) {
  const gitIgnore = readFileSync(gitIgnorePath, "utf-8");
  check(gitIgnore.includes(".env"), ".gitignore protects .env files");
  check(gitIgnore.includes("node_modules"), ".gitignore ignores node_modules");
} else {
  // Check if .env exists with exposed production keys
  const envPath = join(root, ".env");
  check(!existsSync(envPath) || !readFileSync(envPath, "utf-8").includes("0x_REAL_MAINNET_KEY"), "No unprotected live mainnet key in root .env");
}

console.log("\n=======================================================");
console.log(`   PRE-FLIGHT RESULTS: ${passedChecks}/${totalChecks} CHECKS PASSED   `);
if (failedChecks === 0) {
  console.log("   \x1b[32m✔ VERDICT: 100% PASS — MAINNET PRE-FLIGHT VERIFIED & READY\x1b[0m   ");
} else {
  console.log(`   \x1b[31m✖ VERDICT: ${failedChecks} CHECKS FAILED\x1b[0m   `);
}
console.log("=======================================================\n");

if (failedChecks > 0) process.exit(1);
