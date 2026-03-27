import type { ImageProviderName, ImageOptions, ImageResult } from "@/lib/types";

export interface ImageProvider {
  name: ImageProviderName;
  generate(prompt: string, options?: ImageOptions): Promise<ImageResult>;
}
