/**
 * SNSバイラル記事LPテンプレート
 * Threads/X/Instagram等でバズっている投稿形式を再現
 */
import { nanoid } from "nanoid";
import type { LPBlock, LPTheme, ArticleTemplate } from "@/lib/types";

type TemplateDefinition = {
  id: ArticleTemplate;
  name: string;
  description: string;
  icon: string;
  theme: LPTheme;
  blocks: () => LPBlock[];
};

export const ARTICLE_TEMPLATES: TemplateDefinition[] = [
  // === Threads風バイラル投稿 ===
  {
    id: "threads_viral",
    name: "Threads風バイラル投稿",
    description: "短文の連投形式。ストーリーテリングで読者を引き込む",
    icon: "🧵",
    theme: {
      primary_color: "#000000",
      secondary_color: "#666666",
      bg_color: "#FFFFFF",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "知らないと損する○○の話",
          subtitle: "",
          author_name: "著者名",
          author_avatar_url: "",
          published_date: new Date().toISOString().slice(0, 10),
          reading_time_min: 3,
          category_label: "ビジネス",
          cover_image_url: "",
          layout: "minimal",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: "",
          thread_items: [
            { text: "【衝撃】99%の人が知らない事実があります。", image_url: "", likes: 1250 },
            { text: "実は○○の世界では、△△が常識なんです。\n\nでも、ほとんどの人はこれに気づいていない。", image_url: "", likes: 890 },
            { text: "なぜかというと...\n\n理由は3つあります。", image_url: "", likes: 2100 },
            { text: "①情報の非対称性\n②行動のハードル\n③そもそも知る機会がない\n\nこの3つが壁になっている。", image_url: "", likes: 3400 },
            { text: "でも、ここに解決策があります。\n\nそれが「○○」です。", image_url: "", likes: 1800 },
            { text: "実際に○○を導入した企業は、\n・売上3倍\n・コスト50%削減\n・顧客満足度98%\nという結果を出しています。", image_url: "", likes: 5200 },
            { text: "このスレッドが参考になった方は\nいいね＆リポストお願いします🙏\n\n詳しくは↓から", image_url: "", likes: 890 },
          ],
          display_mode: "thread",
          show_engagement: true,
          accent_color: "#000000",
        },
      },
      {
        id: nanoid(),
        type: "social_proof",
        props: {
          type: "counter",
          metrics: [
            { label: "閲覧数", value: 15420, icon: "👁️" },
            { label: "シェア", value: 1203, icon: "🔄" },
            { label: "いいね", value: 8750, icon: "❤️" },
          ],
          animation: true,
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "あなたも始めませんか？",
          description: "今なら初回無料で体験できます",
          share_text: "この記事が参考になりました👇",
          platforms: ["threads", "twitter", "line"],
          cta_button_text: "無料で始める",
          cta_button_url: "",
          show_share_count: true,
          urgency_text: "",
          style: "inline",
        },
      },
      {
        id: nanoid(),
        type: "author_profile",
        props: {
          name: "著者名",
          title: "肩書き",
          bio: "プロフィール文を入力...",
          avatar_url: "",
          sns_links: { threads: "", twitter: "" },
          show_follow_button: true,
          layout: "card",
        },
      },
    ],
  },

  // === X(Twitter)スレッド風 ===
  {
    id: "twitter_thread",
    name: "X(Twitter)スレッド風",
    description: "280文字×連投のスレッド形式。データや事例で説得力UP",
    icon: "𝕏",
    theme: {
      primary_color: "#1DA1F2",
      secondary_color: "#536471",
      bg_color: "#FFFFFF",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "〇〇について調べたので共有します（スレッド）",
          subtitle: "1/10",
          author_name: "著者名",
          published_date: new Date().toISOString().slice(0, 10),
          reading_time_min: 5,
          layout: "minimal",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          thread_items: [
            { text: "〇〇について、半年かけて徹底調査しました。\n\n結論から言うと、△△は間違いです。\n\n以下、データとともに解説します🧵👇", image_url: "", likes: 3200 },
            { text: "まず前提として、\n\n○○市場は2025年に□□兆円規模に拡大。\n年率30%で成長中。\n\nこのグラフを見てください。", image_url: "", likes: 1500 },
            { text: "ポイント①\n\n従来の方法では限界がある。\n理由は...\n\n・コストが高すぎる\n・スピードが遅い\n・スケールしない", image_url: "", likes: 2800 },
            { text: "ポイント②\n\n新しいアプローチが登場。\n\n具体的には「○○」を使うことで、\nコスト1/10、速度100倍を実現。", image_url: "", likes: 4100 },
            { text: "ポイント③\n\n実際の導入事例：\n\nA社：売上200%UP\nB社：工数80%削減\nC社：顧客獲得コスト1/5\n\n全社に共通するのは「□□」", image_url: "", likes: 5600 },
            { text: "まとめ：\n\n✅ ○○市場は急成長中\n✅ 従来手法は限界\n✅ 新アプローチで劇的改善\n✅ 早期参入が鍵\n\n詳細レポートは以下から👇", image_url: "", likes: 2900 },
          ],
          display_mode: "thread",
          show_engagement: true,
          accent_color: "#1DA1F2",
        },
      },
      {
        id: nanoid(),
        type: "social_proof",
        props: {
          type: "badges",
          badges: [
            { text: "トレンド入り", icon: "🔥" },
            { text: "1万RT突破", icon: "🔄" },
            { text: "専門家推薦", icon: "✅" },
          ],
          animation: true,
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "完全版レポートを無料ダウンロード",
          description: "スレッドでは紹介しきれなかった詳細データを公開中",
          platforms: ["twitter", "line", "facebook"],
          cta_button_text: "レポートを受け取る",
          cta_button_url: "",
          style: "inline",
        },
      },
    ],
  },

  // === Instagramストーリー風 ===
  {
    id: "instagram_story",
    name: "Instagramストーリー風",
    description: "ビジュアル重視のカード型。画像＋短文で訴求",
    icon: "📸",
    theme: {
      primary_color: "#E1306C",
      secondary_color: "#833AB4",
      bg_color: "#FAFAFA",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "hero",
        props: {
          title: "保存必須！○○完全ガイド",
          subtitle: "スワイプして読む →",
          bg_gradient: "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)",
          cta_text: "",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          thread_items: [
            { text: "Step 1: まずは○○を理解しよう", image_url: "", likes: 2400 },
            { text: "Step 2: 具体的なやり方はこれ", image_url: "", likes: 3100 },
            { text: "Step 3: やってはいけないNG例", image_url: "", likes: 4800 },
            { text: "Step 4: プロが実践するテクニック", image_url: "", likes: 5200 },
            { text: "保存して何度も見返してね！🔖", image_url: "", likes: 6700 },
          ],
          display_mode: "card_list",
          show_engagement: true,
          accent_color: "#E1306C",
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "もっと詳しく知りたい方へ",
          description: "プロフィールのリンクからチェック",
          platforms: ["instagram", "line"],
          cta_button_text: "詳細を見る",
          cta_button_url: "",
          style: "inline",
        },
      },
    ],
  },

  // === note記事風 ===
  {
    id: "note_article",
    name: "note記事風",
    description: "長文コンテンツ。読みやすい本文＋目次で構成",
    icon: "📝",
    theme: {
      primary_color: "#41C9B4",
      secondary_color: "#333333",
      bg_color: "#FFFFFF",
      font: "\"Noto Serif JP\", serif",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "○○で人生が変わった話",
          subtitle: "体験記として書き残しておきたい",
          author_name: "著者名",
          published_date: new Date().toISOString().slice(0, 10),
          reading_time_min: 10,
          category_label: "エッセイ",
          cover_image_url: "",
          layout: "full_width",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: `## はじめに

この記事では、私が○○を始めてから起きた変化について書きます。

## きっかけ

2024年の春、あるツイートを見かけました...

## 実践したこと

### 1. まず○○を始めた

具体的な手順は以下の通りです。

### 2. 次に△△に取り組んだ

ここが一番のターニングポイントでした。

### 3. 最終的に□□を達成

数字で見ると、以下のような結果に。

- 月収: ○万円 → □万円
- 自由時間: 週○時間 → □時間
- 顧客数: ○人 → □人

## まとめ

最後に伝えたいのは...`,
          thread_items: [],
          display_mode: "markdown",
          show_engagement: false,
          accent_color: "#41C9B4",
        },
      },
      {
        id: nanoid(),
        type: "social_proof",
        props: {
          type: "counter",
          metrics: [
            { label: "スキ", value: 342, icon: "❤️" },
            { label: "コメント", value: 28, icon: "💬" },
          ],
          animation: false,
        },
      },
      {
        id: nanoid(),
        type: "author_profile",
        props: {
          name: "著者名",
          title: "○○の専門家",
          bio: "略歴やプロフィールを入力...",
          avatar_url: "",
          sns_links: { note: "", twitter: "" },
          show_follow_button: true,
          layout: "banner",
        },
      },
      {
        id: nanoid(),
        type: "related_articles",
        props: {
          heading: "こちらもおすすめ",
          articles: [],
          layout: "list",
          max_items: 3,
        },
      },
    ],
  },

  // === リスト型記事 ===
  {
    id: "listicle",
    name: "リスト型記事",
    description: "「○選」「○つのポイント」形式。読みやすく拡散されやすい",
    icon: "📋",
    theme: {
      primary_color: "#6366F1",
      secondary_color: "#4F46E5",
      bg_color: "#F8FAFC",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "プロが選ぶ○○7選【2026年最新版】",
          subtitle: "忖度なしのガチレビュー",
          published_date: new Date().toISOString().slice(0, 10),
          reading_time_min: 7,
          category_label: "まとめ",
          layout: "full_width",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: `## 選定基準

今回は以下の基準で厳選しました：
- **コスパ**: 価格に見合う価値があるか
- **使いやすさ**: 初心者でも扱えるか
- **実績**: 実際の利用者の声

---

## 1. ○○○○

**おすすめ度: ★★★★★**

ポイント：最もバランスが取れている

## 2. △△△△

**おすすめ度: ★★★★☆**

ポイント：コスパ最強

## 3. □□□□

**おすすめ度: ★★★★☆**

ポイント：初心者に最適`,
          display_mode: "markdown",
        },
      },
      {
        id: nanoid(),
        type: "countdown_timer",
        props: {
          heading: "期間限定！特別割引中",
          end_datetime: "",
          show_days: true,
          show_hours: true,
          show_minutes: true,
          show_seconds: true,
          style: "digital",
          cta_text: "割引価格で購入",
          cta_url: "",
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "この記事が参考になったら",
          platforms: ["threads", "twitter", "line", "facebook"],
          cta_button_text: "公式サイトへ",
          style: "inline",
        },
      },
    ],
  },

  // === 比較記事 ===
  {
    id: "comparison",
    name: "比較記事",
    description: "A vs B形式。客観的データで比較し購買決定を後押し",
    icon: "⚖️",
    theme: {
      primary_color: "#059669",
      secondary_color: "#DC2626",
      bg_color: "#FFFFFF",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "【徹底比較】○○ vs △△ どっちがいい？",
          subtitle: "実際に両方使って比較してみた",
          reading_time_min: 8,
          category_label: "比較",
          layout: "full_width",
        },
      },
      {
        id: nanoid(),
        type: "features",
        props: {
          items: [
            { icon: "✅", title: "○○のメリット", description: "・価格が安い\n・サポート充実\n・日本語対応" },
            { icon: "⚖️", title: "共通点", description: "・基本機能は同等\n・無料トライアルあり\n・API提供" },
            { icon: "✅", title: "△△のメリット", description: "・機能が豊富\n・UI/UXが良い\n・拡張性が高い" },
          ],
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: `## 結論

**○○がおすすめな人**: コスパ重視、日本語サポートが必要な方
**△△がおすすめな人**: 機能重視、将来の拡張性を重視する方`,
          display_mode: "markdown",
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "気になった方はこちら",
          cta_button_text: "詳細を確認",
          style: "inline",
        },
      },
    ],
  },

  // === ハウツー記事 ===
  {
    id: "how_to",
    name: "ハウツー記事",
    description: "手順解説型。ステップバイステップで行動を促す",
    icon: "🛠️",
    theme: {
      primary_color: "#F59E0B",
      secondary_color: "#D97706",
      bg_color: "#FFFBEB",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "【完全版】○○のやり方を初心者向けに解説",
          subtitle: "この通りにやれば誰でもできます",
          reading_time_min: 12,
          category_label: "ハウツー",
          layout: "full_width",
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: `## 必要なもの

- ○○（無料）
- △△アカウント
- 30分の作業時間

## Step 1: ○○を準備する

まずは...

## Step 2: 設定を行う

次に...

## Step 3: 実行する

最後に...

## よくある質問

**Q: ○○は必須ですか？**
A: はい。△△の代替も可能です。

**Q: どのくらいで成果が出ますか？**
A: 平均1-2週間です。`,
          display_mode: "markdown",
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "この手順で始めてみよう",
          cta_button_text: "無料で始める",
          style: "inline",
        },
      },
    ],
  },

  // === 事例紹介 ===
  {
    id: "case_study",
    name: "事例紹介",
    description: "導入事例・成功事例のストーリーで信頼性を構築",
    icon: "📊",
    theme: {
      primary_color: "#3B82F6",
      secondary_color: "#1E40AF",
      bg_color: "#F0F9FF",
      font: "system-ui",
    },
    blocks: () => [
      {
        id: nanoid(),
        type: "article_header",
        props: {
          title: "【事例】○○社が△△を導入して売上3倍になった話",
          reading_time_min: 6,
          category_label: "事例紹介",
          layout: "full_width",
        },
      },
      {
        id: nanoid(),
        type: "social_proof",
        props: {
          type: "counter",
          metrics: [
            { label: "売上", value: 300, icon: "📈" },
            { label: "コスト削減", value: 50, icon: "💰" },
            { label: "満足度", value: 98, icon: "😊" },
          ],
          animation: true,
        },
      },
      {
        id: nanoid(),
        type: "article_body",
        props: {
          content_markdown: `## 企業概要

○○社（従業員50名、製造業）

## 課題

導入前は...

## 解決策

○○を導入し...

## 結果

導入後3ヶ月で...`,
          display_mode: "markdown",
        },
      },
      {
        id: nanoid(),
        type: "testimonial",
        props: {
          quote: "導入して本当に良かった。もっと早く始めていればよかったです。",
          author: "○○社 代表取締役",
          role: "",
        },
      },
      {
        id: nanoid(),
        type: "viral_cta",
        props: {
          heading: "同じ成果を出しませんか？",
          cta_button_text: "無料相談を予約",
          style: "inline",
        },
      },
    ],
  },
];

/**
 * テンプレートIDからテンプレートを取得
 */
export function getArticleTemplate(templateId: ArticleTemplate): TemplateDefinition | undefined {
  return ARTICLE_TEMPLATES.find((t) => t.id === templateId);
}
