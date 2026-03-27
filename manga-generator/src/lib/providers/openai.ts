import OpenAI from "openai";
import type { ImageProvider } from "./types";
import type { ImageOptions, ImageResult } from "@/lib/types";

export class OpenAIProvider implements ImageProvider {
  name = "openai" as const;
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, options?: ImageOptions): Promise<ImageResult> {
    const response = await this.client.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: this.getSize(options),
      quality: options?.quality === "hd" ? "high" : "medium",
    });

    const image = response.data?.[0];
    if (!image) throw new Error("No image returned from OpenAI");
    // gpt-image-1 returns base64 by default
    const url = image.url || `data:image/png;base64,${image.b64_json}`;
    return { url, revised_prompt: undefined };
  }

  private getSize(options?: ImageOptions): "1024x1024" | "1536x1024" | "1024x1536" {
    if (!options?.width || !options?.height) return "1024x1024";
    const ratio = options.width / options.height;
    if (ratio > 1.2) return "1536x1024";
    if (ratio < 0.8) return "1024x1536";
    return "1024x1024";
  }
}
