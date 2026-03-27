import { describe, it, expect } from "vitest";
import { buildImagePrompt, buildStorySystemPrompt } from "@/lib/generation/prompt-builder";
import type { PanelBreakdown, Character, TonmanaConfig } from "@/lib/types";

describe("buildImagePrompt", () => {
  const baseTonmana: TonmanaConfig = {
    art_style: "shonen",
    genre: "action",
    color_mode: "monochrome",
    line_style: "thick",
    custom_prompt: "",
    color_palette: [],
  };

  const basePanel: PanelBreakdown = {
    panel_number: 1,
    scene_description: "A warrior swings a sword",
    camera_angle: "medium shot",
    dialogue: [],
    sound_effects: [],
    mood: "intense",
    characters: ["Takeshi"],
  };

  const characters: Character[] = [
    {
      id: "1",
      user_id: "u1",
      name: "Takeshi",
      appearance_description: "tall muscular man with spiky hair",
      visual_prompt: "tall muscular man, spiky black hair, battle armor",
      reference_images: [],
      created_at: "",
      updated_at: "",
    },
  ];

  it("should include scene description", () => {
    const result = buildImagePrompt(basePanel, characters, baseTonmana);
    expect(result).toContain("A warrior swings a sword");
  });

  it("should include character visual prompt", () => {
    const result = buildImagePrompt(basePanel, characters, baseTonmana);
    expect(result).toContain("Takeshi");
    expect(result).toContain("spiky black hair");
  });

  it("should include tonmana style", () => {
    const result = buildImagePrompt(basePanel, characters, baseTonmana);
    expect(result).toContain("shonen manga");
  });

  it("should include mood when not neutral", () => {
    const result = buildImagePrompt(basePanel, characters, baseTonmana);
    expect(result).toContain("mood: intense");
  });

  it("should not include mood when neutral", () => {
    const panel = { ...basePanel, mood: "neutral" };
    const result = buildImagePrompt(panel, characters, baseTonmana);
    expect(result).not.toContain("mood:");
  });

  it("should include manga panel framing instruction", () => {
    const result = buildImagePrompt(basePanel, characters, baseTonmana);
    expect(result).toContain("single manga panel");
  });
});

describe("buildStorySystemPrompt", () => {
  it("should include character names", () => {
    const result = buildStorySystemPrompt(["Takeshi", "Yuki"]);
    expect(result).toContain("Takeshi");
    expect(result).toContain("Yuki");
  });

  it("should handle no characters", () => {
    const result = buildStorySystemPrompt([]);
    expect(result).toContain("No predefined characters");
  });

  it("should describe expected output format", () => {
    const result = buildStorySystemPrompt([]);
    expect(result).toContain("JSON array");
    expect(result).toContain("scene_description");
  });
});
