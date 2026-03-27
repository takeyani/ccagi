import type { ArtStyle, Genre, ColorMode, LineStyle, TonmanaConfig } from "@/lib/types";

export interface PresetOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

export const ART_STYLE_OPTIONS: PresetOption<ArtStyle>[] = [
  { value: "shonen", label: "少年漫画", description: "ダイナミックな構図、スピード線、力強い表現" },
  { value: "shojo", label: "少女漫画", description: "華やかな背景、大きな瞳、繊細な線画" },
  { value: "yonkoma", label: "4コマ", description: "シンプルな線、コミカルな表情、起承転結" },
  { value: "realistic", label: "リアル", description: "写実的な描画、細密な背景、陰影表現" },
  { value: "deformed", label: "デフォルメ", description: "誇張された表現、丸みのある造形" },
  { value: "seinen", label: "青年漫画", description: "緻密な描写、重厚な雰囲気、リアル寄り" },
  { value: "graphic_recording", label: "グラレコ風", description: "手描き感のあるイラスト、アイコン、テキスト混在のビジュアル記録スタイル" },
  { value: "watercolor", label: "水彩風", description: "にじみ・ぼかし表現、柔らかいタッチ、透明感" },
  { value: "pixel_art", label: "ピクセルアート", description: "ドット絵風、レトロゲーム的な表現" },
  { value: "ukiyoe", label: "浮世絵風", description: "平面的な構図、太い輪郭線、日本画的色彩" },
  { value: "american_comic", label: "アメコミ風", description: "ハッチング、ベタ塗り、強いコントラスト" },
  { value: "chibi", label: "ちびキャラ", description: "2〜3頭身、かわいらしいプロポーション" },
  { value: "sketch", label: "スケッチ風", description: "ラフな鉛筆タッチ、下書き風の味わい" },
  { value: "pop_art", label: "ポップアート", description: "ドット・原色・大胆な色面構成" },
];

export const GENRE_OPTIONS: PresetOption<Genre>[] = [
  { value: "action", label: "アクション", description: "バトル・戦闘シーン中心" },
  { value: "romcom", label: "ラブコメ", description: "恋愛＋コメディ" },
  { value: "horror", label: "ホラー", description: "恐怖・サスペンス" },
  { value: "slice_of_life", label: "日常", description: "日常生活の風景" },
  { value: "sci_fi", label: "SF", description: "近未来・宇宙・テクノロジー" },
  { value: "fantasy", label: "ファンタジー", description: "魔法・異世界" },
  { value: "mystery", label: "ミステリー", description: "謎解き・推理" },
  { value: "sports", label: "スポーツ", description: "競技・部活動" },
  { value: "historical", label: "歴史", description: "時代劇・歴史もの" },
];

export const COLOR_MODE_OPTIONS: PresetOption<ColorMode>[] = [
  { value: "monochrome", label: "モノクロ", description: "白黒のみ" },
  { value: "full_color", label: "フルカラー", description: "全色使用" },
  { value: "sepia", label: "セピア", description: "セピア調" },
  { value: "limited_color", label: "限定色", description: "指定した数色のみ" },
  { value: "pastel", label: "パステル", description: "淡い色合い" },
  { value: "neon", label: "ネオン", description: "蛍光色・発光感" },
];

export const LINE_STYLE_OPTIONS: PresetOption<LineStyle>[] = [
  { value: "thick", label: "太線", description: "太い輪郭線" },
  { value: "thin", label: "細線", description: "細い繊細な線" },
  { value: "rough", label: "ラフ", description: "粗めの手描き感" },
  { value: "clean", label: "クリーン", description: "なめらかで均一な線" },
  { value: "brush", label: "ブラシ", description: "筆タッチの抑揚のある線" },
];

export const DEFAULT_TONMANA: TonmanaConfig = {
  art_style: "shonen",
  genre: "action",
  color_mode: "monochrome",
  line_style: "thick",
  custom_prompt: "",
  color_palette: [],
};
