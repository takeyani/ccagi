import type { TonmanaConfig } from "@/lib/types";

const ART_STYLE_PROMPTS: Record<string, string> = {
  shonen: "dynamic shonen manga art style, bold action lines, speed lines, dramatic angles",
  shojo: "shojo manga art style, sparkling eyes, floral backgrounds, delicate linework, screen tones",
  yonkoma: "simple 4-koma manga style, clean lines, comedic expressions, minimal backgrounds",
  realistic: "realistic manga art, detailed shading, photorealistic proportions, intricate backgrounds",
  deformed: "super-deformed chibi-adjacent manga style, exaggerated expressions, rounded shapes",
  seinen: "seinen manga art style, detailed and gritty, heavy inking, mature atmosphere",
  graphic_recording: "graphic recording illustration style, hand-drawn icons and text, sketchnote visual style, marker pen look, whiteboard-like layout with connected visual elements",
  watercolor: "watercolor painting style manga, soft color bleeding, transparent layers, gentle brush strokes",
  pixel_art: "pixel art style, retro 16-bit game aesthetic, blocky characters, limited palette",
  ukiyoe: "ukiyo-e Japanese woodblock print style, flat composition, bold outlines, traditional Japanese colors",
  american_comic: "American comic book art style, cross-hatching, bold inks, strong contrast, halftone dots",
  chibi: "chibi character style, 2-3 head proportion, cute and round features, simple expressions",
  sketch: "pencil sketch style, rough linework, visible construction lines, raw artistic feel",
  pop_art: "pop art style, Ben-Day dots, primary colors, bold graphic shapes, Roy Lichtenstein inspired",
};

const GENRE_PROMPTS: Record<string, string> = {
  action: "action-packed scene, dynamic poses, impact effects",
  romcom: "romantic comedy, warm lighting, soft expressions, comedic timing",
  horror: "horror atmosphere, dark shadows, unsettling mood, dramatic contrast",
  slice_of_life: "everyday life scene, natural poses, warm and relatable",
  sci_fi: "science fiction setting, futuristic technology, neon lights",
  fantasy: "fantasy setting, magical elements, otherworldly atmosphere",
  mystery: "mysterious atmosphere, dramatic lighting, suspenseful composition",
  sports: "sports action, dynamic motion, sweat and determination",
  historical: "historical setting, period-accurate details, classical atmosphere",
};

const COLOR_MODE_PROMPTS: Record<string, string> = {
  monochrome: "black and white, manga screen tones, no color",
  full_color: "full color illustration, vibrant colors",
  sepia: "sepia toned, vintage feel, warm brown tints",
  limited_color: "limited color palette, selective coloring",
  pastel: "pastel color palette, soft and gentle hues",
  neon: "neon colors, glowing effects, cyberpunk-like vibrant palette",
};

const LINE_STYLE_PROMPTS: Record<string, string> = {
  thick: "thick bold outlines, strong linework",
  thin: "thin delicate lines, fine detail",
  rough: "rough sketchy lines, hand-drawn feel",
  clean: "clean smooth lines, vector-like precision",
  brush: "brush stroke lines, calligraphic weight variation",
};

export function compileTonmana(config: TonmanaConfig): string {
  const parts: string[] = [];

  parts.push(ART_STYLE_PROMPTS[config.art_style] || "");
  parts.push(GENRE_PROMPTS[config.genre] || "");
  parts.push(COLOR_MODE_PROMPTS[config.color_mode] || "");
  parts.push(LINE_STYLE_PROMPTS[config.line_style] || "");

  if (config.color_palette.length > 0) {
    parts.push(`using color palette: ${config.color_palette.join(", ")}`);
  }

  if (config.custom_prompt.trim()) {
    parts.push(config.custom_prompt.trim());
  }

  return parts.filter(Boolean).join(", ");
}
