import type { ImageProviderName } from "@/lib/types";
import type { ImageProvider } from "./types";
import { OpenAIProvider } from "./openai";
import { StabilityProvider } from "./stability";
import { GeminiProvider } from "./gemini";

export function createImageProvider(
  name: ImageProviderName,
  apiKey?: string
): ImageProvider {
  switch (name) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "stability":
      return new StabilityProvider(apiKey);
    case "gemini":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
