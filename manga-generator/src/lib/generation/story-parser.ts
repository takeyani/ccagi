import type { PanelBreakdown } from "@/lib/types";

/**
 * Parse Claude API response into structured panel breakdown.
 * Expected format: JSON array of panel objects.
 */
export function parseStoryResponse(raw: string): PanelBreakdown[] {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Failed to parse story response as JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Story response must be a JSON array of panels");
  }

  return parsed.map((item, index) => ({
    panel_number: item.panel_number ?? index + 1,
    scene_description: String(item.scene_description || ""),
    camera_angle: String(item.camera_angle || "medium shot"),
    dialogue: Array.isArray(item.dialogue)
      ? item.dialogue.map((d: Record<string, unknown>) => ({
          character_name: String(d.character_name || ""),
          text: String(d.text || ""),
          position: d.position ?? { x: 0.5, y: 0.1 },
          style: d.style || "speech",
        }))
      : [],
    sound_effects: Array.isArray(item.sound_effects)
      ? item.sound_effects.map((s: Record<string, unknown>) => ({
          text: String(s.text || ""),
          position: s.position ?? { x: 0.5, y: 0.5 },
          rotation: Number(s.rotation || 0),
        }))
      : [],
    mood: String(item.mood || "neutral"),
    characters: Array.isArray(item.characters)
      ? item.characters.map(String)
      : [],
  }));
}
