// ============================================================
// Core Types
// ============================================================

export type ImageProviderName = "openai" | "stability" | "gemini";

export interface UserProfile {
  id: string;
  display_name: string;
  default_provider: ImageProviderName;
  api_keys: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  appearance_description: string;
  visual_prompt: string;
  reference_images: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  tonmana_config: TonmanaConfig;
  default_provider: ImageProviderName;
  character_ids: string[];
  status: "draft" | "generating" | "completed";
  created_at: string;
  updated_at: string;
}

export interface MangaPage {
  id: string;
  project_id: string;
  page_number: number;
  layout_template: string;
  layout_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DialogueEntry {
  character_name: string;
  text: string;
  position: { x: number; y: number };
  style?: "speech" | "thought" | "narration" | "shout";
}

export interface SoundEffect {
  text: string;
  position: { x: number; y: number };
  rotation?: number;
}

export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Panel {
  id: string;
  page_id: string;
  panel_order: number;
  image_url: string | null;
  scene_description: string;
  dialogue: DialogueEntry[];
  sound_effects: SoundEffect[];
  layout_rect: LayoutRect;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  project_id: string | null;
  input_text: string;
  panel_breakdown: PanelBreakdown[];
  provider: ImageProviderName;
  status: "pending" | "processing" | "completed" | "failed";
  result: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Tonmana (トンマナ) Configuration
// ============================================================

export type ArtStyle =
  | "shonen"        // 少年漫画
  | "shojo"         // 少女漫画
  | "yonkoma"       // 4コマ
  | "realistic"     // リアル
  | "deformed"      // デフォルメ
  | "seinen"        // 青年漫画
  | "graphic_recording" // グラレコ風
  | "watercolor"    // 水彩風
  | "pixel_art"     // ピクセルアート
  | "ukiyoe"        // 浮世絵風
  | "american_comic" // アメコミ風
  | "chibi"         // ちびキャラ
  | "sketch"        // スケッチ風
  | "pop_art";      // ポップアート

export type Genre =
  | "action"
  | "romcom"
  | "horror"
  | "slice_of_life"
  | "sci_fi"
  | "fantasy"
  | "mystery"
  | "sports"
  | "historical";

export type ColorMode =
  | "monochrome"
  | "full_color"
  | "sepia"
  | "limited_color"
  | "pastel"
  | "neon";

export type LineStyle =
  | "thick"
  | "thin"
  | "rough"
  | "clean"
  | "brush";

export interface TonmanaConfig {
  art_style: ArtStyle;
  genre: Genre;
  color_mode: ColorMode;
  line_style: LineStyle;
  custom_prompt: string;
  color_palette: string[];
}

// ============================================================
// Generation Pipeline Types
// ============================================================

export interface PanelBreakdown {
  panel_number: number;
  scene_description: string;
  camera_angle: string;
  dialogue: DialogueEntry[];
  sound_effects: SoundEffect[];
  mood: string;
  characters: string[];
}

export interface ImageOptions {
  width?: number;
  height?: number;
  style?: string;
  quality?: "standard" | "hd";
}

export interface ImageResult {
  url: string;
  revised_prompt?: string;
}

export interface GenerationRequest {
  project_id: string;
  input_text: string;
  provider?: ImageProviderName;
}
