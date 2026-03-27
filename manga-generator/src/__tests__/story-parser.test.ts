import { describe, it, expect } from "vitest";
import { parseStoryResponse } from "@/lib/generation/story-parser";

describe("parseStoryResponse", () => {
  it("should parse valid JSON array", () => {
    const input = JSON.stringify([
      {
        panel_number: 1,
        scene_description: "A hero stands on a cliff",
        camera_angle: "wide shot",
        dialogue: [
          { character_name: "Hero", text: "I will save the world!", position: { x: 0.5, y: 0.1 } },
        ],
        sound_effects: [],
        mood: "determined",
        characters: ["Hero"],
      },
    ]);

    const result = parseStoryResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].scene_description).toBe("A hero stands on a cliff");
    expect(result[0].dialogue).toHaveLength(1);
    expect(result[0].dialogue[0].character_name).toBe("Hero");
    expect(result[0].characters).toEqual(["Hero"]);
  });

  it("should extract JSON from markdown code blocks", () => {
    const input = '```json\n[{"panel_number":1,"scene_description":"test","camera_angle":"close-up","dialogue":[],"sound_effects":[],"mood":"neutral","characters":[]}]\n```';

    const result = parseStoryResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].scene_description).toBe("test");
  });

  it("should throw on invalid JSON", () => {
    expect(() => parseStoryResponse("not json")).toThrow("Failed to parse");
  });

  it("should throw on non-array JSON", () => {
    expect(() => parseStoryResponse('{"key":"value"}')).toThrow("must be a JSON array");
  });

  it("should handle missing fields with defaults", () => {
    const input = JSON.stringify([{ scene_description: "minimal" }]);
    const result = parseStoryResponse(input);
    expect(result[0].panel_number).toBe(1);
    expect(result[0].camera_angle).toBe("medium shot");
    expect(result[0].dialogue).toEqual([]);
    expect(result[0].mood).toBe("neutral");
  });
});
