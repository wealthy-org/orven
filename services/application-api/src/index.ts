import { createServer } from "node:http";
import { RelayerEngine } from "./relayer.js";
import { ROBINHOOD_TESTNET, TOKENS } from "@orven/product-config";
import { createPublicClient, http, formatGwei } from "viem";

const relayer = new RelayerEngine();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4010;
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB limit (DoS prevention)

const publicClient = createPublicClient({
  transport: http(ROBINHOOD_TESTNET.rpcUrl, { timeout: 3000 }),
});

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/^\/api\/relayer/, "") || "/";

  try {
    if (req.method === "GET" && pathname === "/health") {
      let liveBlock: string = "simulated_99120450";
      let liveGasGwei: string = "15.0";

      try {
        const block = await publicClient.getBlockNumber();
        const gasPrice = await publicClient.getGasPrice();
        liveBlock = block.toString();
        liveGasGwei = formatGwei(gasPrice);
      } catch {
        // Fallback simulation value if RPC is unreachable without VPN
      }

      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: "ok",
          service: "orven-application-api",
          chain: ROBINHOOD_TESTNET.name,
          chainId: ROBINHOOD_TESTNET.id,
          liveBlockNumber: liveBlock,
          gasPriceGwei: liveGasGwei,
          version: "0.1.0",
        })
      );
      return;
    }

    const readBody = async () => {
      let body = "";
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_SIZE) {
          throw new Error("Payload too large: maximum allowed body size is 1MB");
        }
        body += chunk;
      }
      return JSON.parse(body);
    };

    if (req.method === "POST" && pathname === "/v1/relayer/quote") {
      const data = await readBody();
      const quote = relayer.getQuote(data);
      res.writeHead(200);
      res.end(JSON.stringify(quote));
      return;
    }

    if (req.method === "POST" && pathname === "/v1/relayer/submit") {
      const data = await readBody();
      const receipt = relayer.simulateRelay(data.quoteId, data.signedPayload);
      res.writeHead(200);
      res.end(JSON.stringify(receipt));
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/v1/portfolio/")) {
      const address = pathname.split("/").pop();
      res.writeHead(200);
      res.end(
        JSON.stringify({
          address,
          chainId: ROBINHOOD_TESTNET.id,
          balances: [
            {
              token: TOKENS.USDG.symbol,
              address: TOKENS.USDG.address,
              decimals: TOKENS.USDG.decimals,
              balance: "250000000",
              formatted: "250.00",
            },
            {
              token: TOKENS.WETH.symbol,
              address: TOKENS.WETH.address,
              decimals: TOKENS.WETH.decimals,
              balance: "1000000000000000000",
              formatted: "1.00",
            },
          ],
          shieldedBalanceUSDG: "50.00",
        })
      );
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  } catch (err: any) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: err.message || "Bad Request" }));
  }
});

server.listen(PORT, () => {
  console.log(`Orven Application API listening on port ${PORT}`);
});
