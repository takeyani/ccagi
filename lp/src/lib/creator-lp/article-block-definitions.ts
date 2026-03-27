/**
 * 記事LP用ブロック定義
 * SNSバイラル投稿風の記事LPを構築するための追加ブロック
 */
import type { BlockType } from "@/lib/types";

export type ArticleBlockDefinition = {
  type: BlockType;
  label: string;
  icon: string;
  category: "article" | "marketing" | "general";
  defaultProps: Record<string, unknown>;
};

export const ARTICLE_BLOCK_DEFINITIONS: ArticleBlockDefinition[] = [
  // === 記事系ブロック ===
  {
    type: "article_header",
    label: "記事ヘッダー",
    icon: "📰",
    category: "article",
    defaultProps: {
      title: "タイトルを入力",
      subtitle: "",
      author_name: "",
      author_avatar_url: "",
      published_date: new Date().toISOString().slice(0, 10),
      reading_time_min: 5,
      category_label: "",
      cover_image_url: "",
      layout: "full_width", // full_width | split | minimal
    },
  },
  {
    type: "article_body",
    label: "記事本文",
    icon: "✍️",
    category: "article",
    defaultProps: {
      content_markdown: "",
      // Threads/X風の短文リスト形式
      thread_items: [
        { text: "ここに投稿内容を入力...", image_url: "", likes: 0 },
      ],
      display_mode: "thread", // thread | markdown | card_list
      show_engagement: true,
      accent_color: "",
    },
  },
  {
    type: "sns_embed",
    label: "SNS埋め込み",
    icon: "🔗",
    category: "article",
    defaultProps: {
      platform: "threads", // threads | twitter | instagram | tiktok | youtube
      embed_url: "",
      embed_html: "",
      caption: "",
      show_metrics: true,
      // ダミー表示用
      display_name: "ユーザー名",
      handle: "@username",
      avatar_url: "",
      post_text: "投稿内容...",
      likes_count: 0,
      replies_count: 0,
      reposts_count: 0,
      timestamp: "",
    },
  },
  {
    type: "author_profile",
    label: "著者プロフィール",
    icon: "👤",
    category: "article",
    defaultProps: {
      name: "",
      title: "",
      bio: "",
      avatar_url: "",
      sns_links: {
        threads: "",
        twitter: "",
        instagram: "",
        note: "",
        website: "",
      },
      show_follow_button: true,
      layout: "card", // card | inline | banner
    },
  },
  {
    type: "related_articles",
    label: "関連記事",
    icon: "📚",
    category: "article",
    defaultProps: {
      heading: "あわせて読みたい",
      articles: [
        {
          title: "関連記事タイトル",
          description: "",
          image_url: "",
          url: "",
          category: "",
        },
      ],
      layout: "grid", // grid | list | carousel
      max_items: 3,
    },
  },

  // === マーケティング系ブロック ===
  {
    type: "viral_cta",
    label: "バイラルCTA",
    icon: "🚀",
    category: "marketing",
    defaultProps: {
      heading: "この情報を広めよう",
      description: "",
      share_text: "",
      share_url: "",
      platforms: ["threads", "twitter", "line", "facebook"],
      cta_button_text: "今すぐ始める",
      cta_button_url: "",
      show_share_count: true,
      urgency_text: "", // 例: "残りわずか" "今だけ"
      style: "floating", // floating | inline | sticky_bottom
    },
  },
  {
    type: "social_proof",
    label: "ソーシャルプルーフ",
    icon: "🔥",
    category: "marketing",
    defaultProps: {
      type: "counter", // counter | ticker | testimonial_wall | badges
      metrics: [
        { label: "閲覧数", value: 0, icon: "👁️" },
        { label: "シェア", value: 0, icon: "🔄" },
        { label: "いいね", value: 0, icon: "❤️" },
      ],
      // ティッカー（リアルタイム通知風）
      ticker_items: [
        { text: "〇〇さんが購入しました", time_ago: "3分前" },
      ],
      // バッジ
      badges: [
        { text: "話題の記事", icon: "🔥" },
        { text: "バズ投稿", icon: "📈" },
      ],
      animation: true,
    },
  },
  {
    type: "countdown_timer",
    label: "カウントダウン",
    icon: "⏰",
    category: "marketing",
    defaultProps: {
      heading: "キャンペーン終了まで",
      end_datetime: "",
      expired_text: "キャンペーンは終了しました",
      show_days: true,
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      style: "digital", // digital | flip | minimal | circle
      cta_text: "",
      cta_url: "",
    },
  },
  {
    type: "ab_variant",
    label: "A/Bテスト",
    icon: "🔬",
    category: "marketing",
    defaultProps: {
      variant_name: "A",
      variants: ["A", "B"],
      // 子ブロックのIDリスト（variant別）
      variant_blocks: { A: [], B: [] },
      traffic_split: 50, // A側のトラフィック割合
      test_id: "",
    },
  },
  {
    type: "popup_trigger",
    label: "ポップアップ",
    icon: "💡",
    category: "marketing",
    defaultProps: {
      trigger_type: "scroll", // scroll | time | exit_intent | click
      trigger_value: 50, // scroll%/秒数
      heading: "ちょっと待って！",
      body: "",
      image_url: "",
      cta_text: "詳しく見る",
      cta_url: "",
      dismiss_text: "閉じる",
      show_once: true, // 1回のみ表示
      cookie_days: 7,
    },
  },
];

/**
 * カテゴリ別にブロック定義を取得
 */
export function getArticleBlocksByCategory() {
  const categories = {
    article: ARTICLE_BLOCK_DEFINITIONS.filter((b) => b.category === "article"),
    marketing: ARTICLE_BLOCK_DEFINITIONS.filter((b) => b.category === "marketing"),
  };
  return categories;
}
