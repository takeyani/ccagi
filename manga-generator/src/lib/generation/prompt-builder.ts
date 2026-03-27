import type { PanelBreakdown, Character, TonmanaConfig } from "@/lib/types";
import { compileTonmana } from "@/lib/tonmana/compiler";

/**
 * Build an image generation prompt from scene + characters + tonmana settings.
 */
export function buildImagePrompt(
  panel: PanelBreakdown,
  characters: Character[],
  tonmana: TonmanaConfig
): string {
  const parts: string[] = [];

  // Style prefix from tonmana
  const styleModifier = compileTonmana(tonmana);
  if (styleModifier) {
    parts.push(styleModifier);
  }

  // Scene description
  parts.push(panel.scene_description);

  // Camera angle
  if (panel.camera_angle) {
    parts.push(`camera angle: ${panel.camera_angle}`);
  }

  // Character appearances
  const panelChars = characters.filter((c) =>
    panel.characters.includes(c.name)
  );
  if (panelChars.length > 0) {
    const charDesc = panelChars
      .map((c) => `${c.name}: ${c.visual_prompt || c.appearance_description}`)
      .join("; ");
    parts.push(`characters: ${charDesc}`);
  }

  // Mood
  if (panel.mood && panel.mood !== "neutral") {
    parts.push(`mood: ${panel.mood}`);
  }

  // Manga panel framing
  parts.push("single manga panel, clear composition, no text overlay");

  return parts.join(". ");
}

/**
 * Build the system prompt for Claude story decomposition.
 */
export function buildStorySystemPrompt(characterNames: string[]): string {
  const charList =
    characterNames.length > 0
      ? `Available characters: ${characterNames.join(", ")}`
      : "No predefined characters (create as needed)";

  return `You are a manga story decomposition expert. Given a text story or concept, break it down into individual manga panels.

${charList}

Return a JSON array where each element has:
- panel_number: sequential number
- scene_description: detailed visual description of what's happening (for image generation)
- camera_angle: one of "close-up", "medium shot", "wide shot", "bird's eye", "low angle", "dutch angle"
- dialogue: array of {character_name, text, position: {x, y}, style: "speech"|"thought"|"narration"|"shout"}
- sound_effects: array of {text, position: {x, y}, rotation}
- mood: emotional tone of the scene
- characters: array of character names present in this panel

Aim for 4-8 panels for a short story. Each scene_description should be vivid and specific enough for image generation. Return ONLY the JSON array, no other text.`;
}
