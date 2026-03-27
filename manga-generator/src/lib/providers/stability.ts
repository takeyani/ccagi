import type { ImageProvider } from "./types";
import type { ImageOptions, ImageResult } from "@/lib/types";

export class StabilityProvider implements ImageProvider {
  name = "stability" as const;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STABILITY_API_KEY || "";
  }

  async generate(prompt: string, options?: ImageOptions): Promise<ImageResult> {
    const width = options?.width || 1024;
    const height = options?.height || 1024;

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        body: (() => {
          const form = new FormData();
          form.append("prompt", prompt);
          form.append("output_format", "png");
          form.append("aspect_ratio", this.getAspectRatio(width, height));
          return form;
        })(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stability API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      url: `data:image/png;base64,${data.image}`,
    };
  }

  private getAspectRatio(w: number, h: number): string {
    const ratio = w / h;
    if (ratio > 1.5) return "16:9";
    if (ratio > 1.2) return "3:2";
    if (ratio < 0.67) return "9:16";
    if (ratio < 0.83) return "2:3";
    return "1:1";
  }
}
