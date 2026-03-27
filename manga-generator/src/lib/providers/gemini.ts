import type { ImageProvider } from "./types";
import type { ImageOptions, ImageResult } from "@/lib/types";

export class GeminiProvider implements ImageProvider {
  name = "gemini" as const;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
  }

  async generate(prompt: string, _options?: ImageOptions): Promise<ImageResult> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini Imagen API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error("No image returned from Gemini");

    return {
      url: `data:image/png;base64,${b64}`,
    };
  }
}
