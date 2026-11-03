import { createServer } from "node:http";
import { MODEL_REGISTRY } from "./registry.js";
import { ReservationManager } from "./reservations.js";
import { executeAICompletion } from "./provider.js";

const manager = new ReservationManager();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4020;
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB limit (Bugfix: DoS prevention)

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
  const pathname = url.pathname.replace(/^\/api\/ai/, "") || "/";

  try {
    if (req.method === "GET" && pathname === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok", service: "orven-ai-gateway", version: "0.1.0" }));
      return;
    }

    if (req.method === "GET" && pathname === "/v1/models") {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          models: Object.values(MODEL_REGISTRY).map((m) => ({
            ...m,
            costPerUnitMinor: m.costPerUnitMinor.toString(),
          })),
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

    if (req.method === "POST" && pathname === "/v1/quote") {
      const data = await readBody();
      const units = parseInt(data.units || "1", 10);
      const quote = manager.createQuote(
        data.modelId,
        units,
        data.userAddress || "0x0000000000000000000000000000000000000001"
      );
      res.writeHead(200);
      res.end(JSON.stringify(quote));
      return;
    }

    if (req.method === "POST" && pathname === "/v1/jobs") {
      const data = await readBody();
      if (!data.quoteId || !data.modelId || !data.maxPriceMinor) {
        throw new Error("Missing required parameters: quoteId, modelId, maxPriceMinor");
      }

      // 1. Reserve credit with valid quote validation
      const reservation = manager.reserveCredit(
        data.quoteId,
        data.modelId,
        BigInt(data.maxPriceMinor),
        data.userAddress || "0x0000000000000000000000000000000000000001"
      );

      // 2. Execute AI Provider (Real API if keys supplied, or deterministic local fallback)
      const model = MODEL_REGISTRY[data.modelId];
      const units = parseInt(data.units || "1", 10);
      const prompt = data.prompt || "Execute standard Orven agent financial analysis";
      
      const execution = await executeAICompletion(
        data.modelId,
        prompt,
        model.modality,
        units
      );

      const actualUnits = execution.actualUnits > 0 ? execution.actualUnits : 1;
      const actualCost = model.costPerUnitMinor * BigInt(actualUnits);

      // 3. Reconcile
      const finalReservation = manager.reconcileUsage(
        reservation.reservationId,
        actualCost,
        execution.output
      );

      res.writeHead(200);
      res.end(
        JSON.stringify({
          ...finalReservation,
          maxAmountMinor: finalReservation.maxAmountMinor.toString(),
          capturedAmountMinor: finalReservation.capturedAmountMinor.toString(),
          providerUsed: execution.providerUsed,
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
  console.log(`Orven AI Gateway listening on port ${PORT}`);
});
