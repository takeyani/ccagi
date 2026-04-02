import type { LPBlock, LPTheme } from "@/lib/types";
import { nanoid } from "nanoid";

export type LPTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  blocks: Omit<LPBlock, "id">[];
  theme: LPTheme;
};

export const LP_TEMPLATES: LPTemplate[] = [
  {
    id: "standard",
    name: "スタンダード",
    description: "商品紹介の王道レイアウト。ヒーロー→商品情報→特徴→FAQ→購入ボタン",
    icon: "📄",
    blocks: [
      { type: "hero", props: { bg_type: "gradient", gradient_from: "#6366f1", gradient_to: "#8b5cf6", title: "ここにキャッチコピーを入力", subtitle: "商品の魅力を一言で伝えましょう", cta_text: "詳しく見る" } },
      { type: "product_info", props: { show_image: true, show_description: true, show_tags: true, show_badge: true } },
      { type: "features", props: { heading: "この商品が選ばれる理由", items: [{ icon: "✅", title: "品質保証", description: "厳選された素材と製法で作られています" }, { icon: "🚚", title: "迅速配送", description: "注文から最短翌日お届け" }, { icon: "💰", title: "お得な価格", description: "メーカー直販だから中間マージンなし" }], columns: 3 } },
      { type: "lot_details", props: { show_price: true, show_stock: true, show_expiry: true, show_purchase_button: true } },
      { type: "faq", props: { heading: "よくある質問", items: [{ question: "配送にはどのくらいかかりますか？", answer: "通常2〜3営業日でお届けいたします。" }, { question: "返品は可能ですか？", answer: "商品到着後7日以内であれば返品可能です。" }] } },
      { type: "cta", props: { text: "今すぐ購入する", scroll_to: "lot_details", style: "primary" } },
    ],
    theme: { primary_color: "#6366f1", secondary_color: "#8b5cf6", bg_color: "#ffffff", font: "inherit" },
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプルで洗練されたレイアウト。余白を活かした上品なデザイン",
    icon: "🤍",
    blocks: [
      { type: "text", props: { content: "ここにブランドのストーリーや商品への想いを書きましょう。\n\n読み手の心に響く言葉で、商品の価値を伝えてください。", alignment: "center" } },
      { type: "divider", props: { style: "line", spacing: "lg" } },
      { type: "product_info", props: { show_image: true, show_description: true, show_tags: false, show_badge: true } },
      { type: "lot_details", props: { show_price: true, show_stock: true, show_expiry: false, show_purchase_button: true } },
    ],
    theme: { primary_color: "#1a1a1a", secondary_color: "#555555", bg_color: "#fafafa", font: "inherit" },
  },
  {
    id: "sales",
    name: "セールス特化",
    description: "コンバージョン重視。お客様の声+特徴+CTAで購入を後押し",
    icon: "🔥",
    blocks: [
      { type: "hero", props: { bg_type: "gradient", gradient_from: "#dc2626", gradient_to: "#f97316", title: "【期間限定】特別価格で販売中", subtitle: "今だけのチャンスをお見逃しなく", cta_text: "今すぐ購入" } },
      { type: "product_info", props: { show_image: true, show_description: true, show_tags: true, show_badge: true } },
      { type: "features", props: { heading: "選ばれる3つの理由", items: [{ icon: "🏆", title: "実績No.1", description: "累計販売数10,000個突破" }, { icon: "⭐", title: "高評価", description: "お客様満足度98%" }, { icon: "🎁", title: "特典付き", description: "今なら送料無料" }], columns: 3 } },
      { type: "testimonial", props: { quote: "リピート3回目です。品質が安定していて安心して購入できます。", author_name: "購入者A", author_title: "30代 女性" } },
      { type: "testimonial", props: { quote: "他社製品から乗り換えました。コスパが良くて大満足です。", author_name: "購入者B", author_title: "40代 男性" } },
      { type: "lot_details", props: { show_price: true, show_stock: true, show_expiry: true, show_purchase_button: true } },
      { type: "cta", props: { text: "今すぐ購入する", scroll_to: "lot_details", style: "primary" } },
    ],
    theme: { primary_color: "#dc2626", secondary_color: "#f97316", bg_color: "#ffffff", font: "inherit" },
  },
  {
    id: "storytelling",
    name: "ストーリー型",
    description: "テキスト中心で商品の背景やストーリーを丁寧に伝えるレイアウト",
    icon: "📖",
    blocks: [
      { type: "hero", props: { bg_type: "gradient", gradient_from: "#065f46", gradient_to: "#059669", title: "つくり手の想い", subtitle: "この商品が生まれた背景をお伝えします", cta_text: "" } },
      { type: "text", props: { content: "この商品は、○○年の歳月をかけて開発されました。\n\n私たちが大切にしているのは「本物の品質」です。\n素材選びから製造工程まで、一切の妥協を許さない姿勢で\nお客様に最高の商品をお届けしています。", alignment: "left" } },
      { type: "image", props: { image_url: "", alt_text: "商品イメージ", caption: "こだわりの製造工程" } },
      { type: "text", props: { content: "なぜこの商品が多くのお客様に支持されているのか。\nその答えは、実際に手に取っていただければきっとわかります。", alignment: "left" } },
      { type: "product_info", props: { show_image: true, show_description: true, show_tags: true, show_badge: true } },
      { type: "lot_details", props: { show_price: true, show_stock: true, show_expiry: true, show_purchase_button: true } },
    ],
    theme: { primary_color: "#065f46", secondary_color: "#059669", bg_color: "#f9fafb", font: "inherit" },
  },
  {
    id: "health",
    name: "健康食品・サプリ",
    description: "成分情報+FAQ+お客様の声。健康食品・サプリメント向け",
    icon: "💊",
    blocks: [
      { type: "hero", props: { bg_type: "gradient", gradient_from: "#0ea5e9", gradient_to: "#06b6d4", title: "毎日の健康をサポート", subtitle: "厳選された成分で、あなたの体を内側からケア", cta_text: "詳しく見る" } },
      { type: "product_info", props: { show_image: true, show_description: true, show_tags: true, show_badge: true } },
      { type: "features", props: { heading: "配合成分のポイント", items: [{ icon: "🌿", title: "天然由来成分", description: "化学合成成分を使用していません" }, { icon: "🔬", title: "第三者機関検査済み", description: "品質と安全性を検証済み" }, { icon: "🇯🇵", title: "国内製造", description: "GMP認定工場で製造" }], columns: 3 } },
      { type: "testimonial", props: { quote: "飲み始めて3ヶ月、毎朝のスッキリ感が違います。", author_name: "愛用者", author_title: "50代 女性" } },
      { type: "faq", props: { heading: "よくある質問", items: [{ question: "1日の摂取量は？", answer: "1日2粒を目安に、水またはぬるま湯でお召し上がりください。" }, { question: "薬との併用は可能ですか？", answer: "お薬を服用中の方は、かかりつけの医師にご相談ください。" }, { question: "アレルゲンは含まれますか？", answer: "商品ラベルに記載のアレルギー表示をご確認ください。" }] } },
      { type: "lot_details", props: { show_price: true, show_stock: true, show_expiry: true, show_purchase_button: true } },
      { type: "cta", props: { text: "今すぐ購入する", scroll_to: "lot_details", style: "primary" } },
    ],
    theme: { primary_color: "#0ea5e9", secondary_color: "#06b6d4", bg_color: "#ffffff", font: "inherit" },
  },
];

export const THEME_PRESETS: { name: string; theme: LPTheme }[] = [
  { name: "インディゴ", theme: { primary_color: "#6366f1", secondary_color: "#8b5cf6", bg_color: "#ffffff", font: "inherit" } },
  { name: "ブラック", theme: { primary_color: "#1a1a1a", secondary_color: "#555555", bg_color: "#fafafa", font: "inherit" } },
  { name: "レッド", theme: { primary_color: "#dc2626", secondary_color: "#f97316", bg_color: "#ffffff", font: "inherit" } },
  { name: "グリーン", theme: { primary_color: "#065f46", secondary_color: "#059669", bg_color: "#f9fafb", font: "inherit" } },
  { name: "ブルー", theme: { primary_color: "#0ea5e9", secondary_color: "#06b6d4", bg_color: "#ffffff", font: "inherit" } },
  { name: "ピンク", theme: { primary_color: "#ec4899", secondary_color: "#f472b6", bg_color: "#fff5f7", font: "inherit" } },
  { name: "ゴールド", theme: { primary_color: "#b45309", secondary_color: "#d97706", bg_color: "#fffbeb", font: "inherit" } },
];

export function instantiateTemplate(template: LPTemplate): { blocks: LPBlock[]; theme: LPTheme } {
  return {
    blocks: template.blocks.map((b) => ({ ...b, id: nanoid(), props: { ...b.props } })),
    theme: { ...template.theme },
  };
}
