#!/usr/bin/env node
/**
 * Orven Fullstack Orchestrator
 * Spawns Web App (Port 3000), Application API (Port 4010), and AI Gateway (Port 4020) concurrently.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

console.log("\n=======================================================");
console.log("   ORVEN PROTOCOL — FULL PLATFORM ORCHESTRATOR   ");
console.log("   Target: Robinhood Chain Testnet (Chain ID 46630)   ");
console.log("=======================================================\n");

const services = [
  {
    name: "API",
    color: "\x1b[36m", // Cyan
    command: "npm",
    args: ["--workspace", "services/application-api", "run", "dev"],
    port: 4010,
  },
  {
    name: "AI ",
    color: "\x1b[35m", // Magenta
    command: "npm",
    args: ["--workspace", "services/ai-gateway", "run", "dev"],
    port: 4020,
  },
  {
    name: "WEB",
    color: "\x1b[32m", // Green
    command: "npm",
    args: ["--workspace", "apps/web", "run", "dev"],
    port: 3000,
  },
];

const children = [];

for (const svc of services) {
  const child = spawn(svc.command, svc.args, {
    cwd: root,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  const prefix = `${svc.color}[${svc.name}]\x1b[0m `;

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) console.log(`${prefix}${line}`);
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) console.error(`${prefix}\x1b[31m${line}\x1b[0m`);
    }
  });

  children.push(child);
}

function cleanup() {
  console.log("\nShutting down all Orven services...");
  for (const child of children) {
    child.kill("SIGINT");
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
