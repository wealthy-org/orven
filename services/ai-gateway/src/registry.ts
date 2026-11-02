import { AIModelDefinition } from "./types.js";

export const MODEL_REGISTRY: Record<string, AIModelDefinition> = {
  "orven-gpt-4o": {
    id: "orven-gpt-4o",
    name: "GPT-4o Omnimodel",
    provider: "openai",
    modality: "text",
    costPerUnitMinor: 5_000n, // 0.005 USDG per 1k tokens
    unitName: "1k tokens",
    maxLimit: 128_000,
    isAvailable: true,
  },
  "orven-claude-3-5-sonnet": {
    id: "orven-claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    modality: "text",
    costPerUnitMinor: 6_000n, // 0.006 USDG per 1k tokens
    unitName: "1k tokens",
    maxLimit: 200_000,
    isAvailable: true,
  },
  "orven-flux-pro": {
    id: "orven-flux-pro",
    name: "Flux Pro Studio",
    provider: "bfl",
    modality: "image",
    costPerUnitMinor: 40_000n, // 0.04 USDG per image
    unitName: "image",
    maxLimit: 10,
    isAvailable: true,
  },
  "orven-runway-gen3": {
    id: "orven-runway-gen3",
    name: "Runway Gen-3 Alpha Video",
    provider: "runway",
    modality: "video",
    costPerUnitMinor: 250_000n, // 0.25 USDG per 5s video
    unitName: "5s video segment",
    maxLimit: 4,
    isAvailable: true,
  },
};
