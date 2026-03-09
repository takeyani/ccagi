import type { CollectionBlockType } from "@/lib/types";

export type CollectionBlockDefinition = {
  type: CollectionBlockType;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
};

export const COLLECTION_BLOCK_DEFINITIONS: CollectionBlockDefinition[] = [
  {
    type: "hero",
    label: "ヒーロー",
    icon: "🎨",
    defaultProps: {
      bg_type: "gradient",
      gradient_from: "#6366f1",
      gradient_to: "#8b5cf6",
      bg_image_url: "",
      title: "ここにタイトルを入力",
      subtitle: "サブタイトルを入力してください",
      cta_text: "商品を見る",
    },
  },
  {
    type: "collection_grid",
    label: "商品グリッド",
    icon: "🗂️",
    defaultProps: {
      columns: 3,
      show_price: true,
      show_partner: true,
      show_tags: true,
      card_style: "card",
      sort_by: "name",
      max_items: 0,
    },
  },
  {
    type: "collection_filter_bar",
    label: "フィルターバー",
    icon: "🔍",
    defaultProps: {
      show_tag_filter: true,
      show_price_filter: true,
      show_search: true,
    },
  },
  {
    type: "text",
    label: "テキスト",
    icon: "📝",
    defaultProps: {
      content: "ここにテキストを入力してください。",
      alignment: "left",
    },
  },
  {
    type: "image",
    label: "画像",
    icon: "🖼️",
    defaultProps: {
      image_url: "",
      alt_text: "",
      caption: "",
    },
  },
  {
    type: "features",
    label: "特徴",
    icon: "✨",
    defaultProps: {
      heading: "特徴",
      items: [
        { icon: "🔒", title: "安心・安全", description: "認証済みの品質保証" },
        { icon: "🚚", title: "迅速配送", description: "注文から最短翌日お届け" },
        { icon: "💎", title: "高品質", description: "厳選された商品のみ取扱い" },
      ],
      columns: 3,
    },
  },
  {
    type: "testimonial",
    label: "お客様の声",
    icon: "💬",
    defaultProps: {
      quote: "この商品を使い始めてから、品質の違いを実感しています。",
      author_name: "山田 太郎",
      author_title: "株式会社サンプル 代表取締役",
    },
  },
  {
    type: "faq",
    label: "よくある質問",
    icon: "❓",
    defaultProps: {
      heading: "よくある質問",
      items: [
        { question: "配送にはどのくらいかかりますか？", answer: "通常2〜3営業日でお届けいたします。" },
        { question: "返品は可能ですか？", answer: "商品到着後7日以内であれば返品可能です。" },
      ],
    },
  },
  {
    type: "cta",
    label: "CTAボタン",
    icon: "🔘",
    defaultProps: {
      text: "お問い合わせはこちら",
      scroll_to: "collection_grid",
      style: "primary",
    },
  },
  {
    type: "divider",
    label: "区切り線",
    icon: "➖",
    defaultProps: {
      style: "line",
      spacing: "md",
    },
  },
];

export function getCollectionBlockDefinition(
  type: CollectionBlockType
): CollectionBlockDefinition | undefined {
  return COLLECTION_BLOCK_DEFINITIONS.find((b) => b.type === type);
}
