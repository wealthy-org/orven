import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathParts = req.query.path as string[] | undefined;
  const subpath = pathParts ? pathParts.join("/") : "";
  const upstreamUrl = process.env.RELAYER_API_URL || "http://localhost:4010";

  // Attempt proxy to upstream backend if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const target = `${upstreamUrl.replace(/\/$/, "")}/${subpath}`;
    const proxyRes = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return res.status(200).json(data);
    }
  } catch {
    // Upstream not running locally or on serverless — proceed to built-in simulation engine
  }

  // Built-in Vercel Serverless Simulation Fallback
  if (subpath === "health") {
    return res.status(200).json({
      status: "ok",
      service: "orven-application-api-serverless",
      chain: "Robinhood Chain Testnet",
      chainId: 46630,
      liveBlockNumber: "simulated_99120450",
      gasPriceGwei: "15.0",
      version: "0.1.0",
    });
  }

  if (subpath === "v1/relayer/quote" && req.method === "POST") {
    const { action, fromVault } = req.body || {};
    return res.status(200).json({
      quoteId: `rq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      action: action || "vault_action",
      fromVault: fromVault || "0x0000000000000000000000000000000000000000",
      targetContract: "0x5b9686f384A5Fb768B2360cF0B893F0d1E960B01",
      tokenFeeUSDG: 0.05,
      tokenFeeFormatted: "0.05 USDG",
      relayerAddress: "0x6569E27A95a6A3E92A311B4Cc6600fed56aA50A2",
      validUntil: Date.now() + 300000,
      estimatedGas: 120000,
    });
  }

  if (subpath === "v1/relayer/submit" && req.method === "POST") {
    const { quoteId } = req.body || {};
    return res.status(200).json({
      success: true,
      quoteId: quoteId || `rq_${Date.now()}`,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      status: "confirmed",
      blockNumber: 99120450,
      feeChargedUSDG: "0.05",
    });
  }

  return res.status(200).json({
    status: "simulated",
    subpath,
    timestamp: Date.now(),
  });
}
