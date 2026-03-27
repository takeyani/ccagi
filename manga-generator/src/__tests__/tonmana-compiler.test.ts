import { describe, it, expect } from "vitest";
import { compileTonmana } from "@/lib/tonmana/compiler";
import type { TonmanaConfig } from "@/lib/types";

describe("compileTonmana", () => {
  const baseConfig: TonmanaConfig = {
    art_style: "shonen",
    genre: "action",
    color_mode: "monochrome",
    line_style: "thick",
    custom_prompt: "",
    color_palette: [],
  };

  it("should compile basic shonen action config", () => {
    const result = compileTonmana(baseConfig);
    expect(result).toContain("shonen manga");
    expect(result).toContain("action");
    expect(result).toContain("black and white");
    expect(result).toContain("thick bold outlines");
  });

  it("should include graphic recording style", () => {
    const config: TonmanaConfig = {
      ...baseConfig,
      art_style: "graphic_recording",
    };
    const result = compileTonmana(config);
    expect(result).toContain("graphic recording");
    expect(result).toContain("sketchnote");
  });

  it("should include watercolor style", () => {
    const config: TonmanaConfig = {
      ...baseConfig,
      art_style: "watercolor",
    };
    const result = compileTonmana(config);
    expect(result).toContain("watercolor");
    expect(result).toContain("soft color bleeding");
  });

  it("should include custom prompt", () => {
    const config: TonmanaConfig = {
      ...baseConfig,
      custom_prompt: "Studio Ghibli inspired",
    };
    const result = compileTonmana(config);
    expect(result).toContain("Studio Ghibli inspired");
  });

  it("should include color palette when provided", () => {
    const config: TonmanaConfig = {
      ...baseConfig,
      color_palette: ["#FF0000", "#00FF00"],
    };
    const result = compileTonmana(config);
    expect(result).toContain("#FF0000");
    expect(result).toContain("#00FF00");
  });

  it("should compile all art styles without error", () => {
    const styles: TonmanaConfig["art_style"][] = [
      "shonen", "shojo", "yonkoma", "realistic", "deformed", "seinen",
      "graphic_recording", "watercolor", "pixel_art", "ukiyoe",
      "american_comic", "chibi", "sketch", "pop_art",
    ];
    for (const style of styles) {
      const result = compileTonmana({ ...baseConfig, art_style: style });
      expect(result.length).toBeGreaterThan(0);
    }
  });
});
