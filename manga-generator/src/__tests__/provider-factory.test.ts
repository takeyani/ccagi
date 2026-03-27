import { describe, it, expect, vi } from "vitest";

// Mock OpenAI to avoid browser environment check
vi.mock("openai", () => ({
  default: class MockOpenAI {
    constructor() {}
    images = { generate: vi.fn() };
  },
}));

import { createImageProvider } from "@/lib/providers/factory";

describe("createImageProvider", () => {
  it("should create OpenAI provider", () => {
    const provider = createImageProvider("openai", "test-key");
    expect(provider.name).toBe("openai");
  });

  it("should create Stability provider", () => {
    const provider = createImageProvider("stability", "test-key");
    expect(provider.name).toBe("stability");
  });

  it("should create Gemini provider", () => {
    const provider = createImageProvider("gemini", "test-key");
    expect(provider.name).toBe("gemini");
  });

  it("should throw for unknown provider", () => {
    expect(() =>
      // @ts-expect-error testing invalid input
      createImageProvider("unknown")
    ).toThrow("Unknown provider");
  });
});
