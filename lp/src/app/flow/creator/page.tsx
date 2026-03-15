import type { Metadata } from "next";
import Link from "next/link";
import { CreatorScreenGallery } from "@/components/flow/FlowScreenGallery";

export const metadata: Metadata = {
  title: "クリエイター業務フロー | インフルエンサー・映像クリエイター向け",
  description:
    "単品決済ロットLPマーケットプレイスでインフルエンサーや映像クリエイターがLP作成・アフィリエイトで収益化する方法を解説します。",
};

type Step = {
  number: string;
  title: string;
  description: string;
  details: string[];
};

const creatorSteps: Step[] = [
  {
    number: "01",
    title: "クリエイター登録",
    description: "アフィリエイトアカウントを作成し、クリエイターモードを有効化します。",
    details: [
      "メールアドレスでアフィリエイト登録",
      "プロフィール（名前・アバター・SNSリンク）を設定",
      "固有のアフィリエイトコードを取得",
      "クリエイターモード（is_creator）を有効化",
      "コミッション率の確認",
    ],
  },
  {
    number: "02",
    title: "商品を選ぶ・リサーチ",
    description: "マーケットプレイスから紹介したい商品をリサーチし、LPの題材を決めます。",
    details: [
      "商品カタログから魅力的な商品を検索",
      "ランキングページで人気商品をチェック",
      "プルーフチェーンで品質・信頼性を確認",
      "ロットの在庫・価格・有効期限を確認",
      "自分のフォロワー層に合った商品を選定",
    ],
  },
  {
    number: "03",
    title: "LP（ランディングページ）作成",
    description:
      "ブロックエディタで商品紹介ページを自由にデザインします。画像・動画も反映可能。コーディング不要。",
    details: [
      "ヒーロー：キャッチコピー＋背景画像の設定",
      "画像ブロック：商品写真やバナーをアップロード（JPG/PNG/WebP/SVG）",
      "動画ブロック：YouTube/Vimeo URLの埋め込み、MP4アップロード対応",
      "ギャラリーブロック：複数画像をグリッド/スライダーで表示",
      "商品情報：詳細スペック・価格・商品画像の表示",
      "特徴ブロック：商品の魅力をアイコン付きで訴求",
      "テスティモニアル：レビュー・体験談",
      "FAQ：よくある質問セクション",
      "CTA：購入ボタン・お問い合わせ導線",
      "メディアライブラリ：アップロード済み画像・動画を一元管理",
      "テーマカラー・フォントのカスタマイズ",
    ],
  },
  {
    number: "04",
    title: "コレクション作成",
    description: "複数商品をまとめたキュレーションページを作成し、テーマ別に紹介します。",
    details: [
      "「おすすめ○○ 10選」などのテーマページ",
      "タグ・パートナー・キーワードでフィルタリング",
      "商品グリッドの自動表示",
      "フィルターバーで閲覧者が絞り込み可能",
      "特定商品の含める/除外する設定",
    ],
  },
  {
    number: "05",
    title: "公開・拡散",
    description:
      "作成したLPを公開し、SNSやブログ、YouTube概要欄などで拡散します。",
    details: [
      "ワンクリックで公開（/c/あなたのコード/スラッグ）",
      "SNS（Instagram, X, TikTok）でシェア",
      "YouTube概要欄・ブログ記事にリンク設置",
      "外部サイトにiframeウィジェットを埋め込み",
      "?ref=コード パラメータで流入を自動追跡",
    ],
  },
  {
    number: "06",
    title: "成果確認・報酬獲得",
    description:
      "アナリティクスで成果を確認し、コンバージョンに応じた報酬を獲得します。",
    details: [
      "LP/コレクション別の閲覧数を確認",
      "コンバージョン数（購入完了）の追跡",
      "報酬 = 購入金額 x コミッション率 で自動計算",
      "リファラルテーブルで全成果を一覧確認",
      "高パフォーマンスLPの分析・改善",
    ],
  },
];

const useCases = [
  {
    role: "インフルエンサー",
    icon: "📱",
    color: "#ec4899",
    scenarios: [
      {
        title: "Instagramストーリーで商品紹介",
        desc: "フォロワーに刺さるビジュアルのLPを作成し、ストーリーの「リンク」から誘導。購入が発生するたびに報酬を獲得。",
      },
      {
        title: "テーマ別コレクションの発信",
        desc: "「2026年おすすめスキンケア」などのコレクションページを作成。定期的に更新して継続的な流入を実現。",
      },
      {
        title: "ライブコマース連動",
        desc: "インスタライブやTikTokライブ中に商品LPのリンクを共有。リアルタイムの購買を促進。",
      },
    ],
  },
  {
    role: "映像クリエイター",
    icon: "🎬",
    color: "#f59e0b",
    scenarios: [
      {
        title: "YouTube概要欄にLP設置",
        desc: "レビュー動画の概要欄にアフィリエイトLP のリンクを設置。動画視聴者を購入ページへ自然に誘導。",
      },
      {
        title: "商品紹介動画 × 専用LP",
        desc: "商品の使用シーンを映像で伝え、詳細情報はLPに集約。動画とLPの相乗効果でコンバージョンを最大化。",
      },
      {
        title: "埋め込みウィジェット活用",
        desc: "自社ブログやポートフォリオサイトにiframeで商品ウィジェットを埋め込み。閲覧者が離脱せず購入可能。",
      },
    ],
  },
  {
    role: "ブロガー・ライター",
    icon: "✍️",
    color: "#6366f1",
    scenarios: [
      {
        title: "比較記事 × コレクションページ",
        desc: "ブログの比較記事から単品決済ロットLPのコレクションページへリンク。読者が商品を一覧で比較し購入できる導線を構築。",
      },
      {
        title: "SEO記事で長期流入",
        desc: "検索上位を狙った記事にアフィリエイトリンクを設置。オーガニック流入で継続的な報酬を獲得。",
      },
      {
        title: "メルマガ・ニュースレター連携",
        desc: "定期配信のメルマガにLPリンクを掲載。読者の購買意欲が高いタイミングで訴求。",
      },
    ],
  },
];

const lpBlocks = [
  { name: "hero", label: "ヒーロー", desc: "キャッチコピー＋背景画像", icon: "🖼️" },
  { name: "product_info", label: "商品情報", desc: "名前・価格・画像・説明", icon: "📝" },
  { name: "lot_details", label: "ロット詳細", desc: "在庫・有効期限", icon: "📦" },
  { name: "image", label: "画像", desc: "JPG/PNG/WebP/SVGアップロード", icon: "🌅" },
  { name: "video", label: "動画", desc: "YouTube/Vimeo/MP4埋め込み", icon: "🎬" },
  { name: "gallery", label: "ギャラリー", desc: "複数画像グリッド表示", icon: "📸" },
  { name: "slider", label: "スライダー", desc: "画像・動画のカルーセル", icon: "🎞️" },
  { name: "text", label: "テキスト", desc: "自由文章ブロック", icon: "📄" },
  { name: "features", label: "特徴", desc: "アイコン付き特徴リスト", icon: "⭐" },
  { name: "testimonial", label: "体験談", desc: "ユーザーレビュー", icon: "💬" },
  { name: "faq", label: "FAQ", desc: "よくある質問", icon: "❓" },
  { name: "cta", label: "CTA", desc: "購入ボタン", icon: "🔘" },
  { name: "divider", label: "区切り", desc: "セクション区切り線", icon: "➖" },
  { name: "collection_grid", label: "商品グリッド", desc: "商品一覧表示", icon: "🗂️" },
  { name: "collection_filter", label: "フィルターバー", desc: "絞り込みUI", icon: "🔍" },
];

function StepCard({ step, color, gallery }: { step: Step; color: string; gallery?: React.ReactNode }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: color }}
        >
          {step.number}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
      </div>
      <div className="pb-10">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
        <ul className="space-y-1.5">
          {step.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              {d}
            </li>
          ))}
        </ul>
        {gallery}
      </div>
    </div>
  );
}

export default function CreatorFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">メーカー・代理店</Link>
            <Link href="/flow/buyer" className="text-gray-600 hover:text-gray-900">バイヤー</Link>
            <a href="#steps" className="text-gray-600 hover:text-gray-900">フロー</a>
            <a href="#usecases" className="text-gray-600 hover:text-gray-900">活用例</a>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-pink-300 tracking-wider mb-3">CREATOR FLOW GUIDE</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            インフルエンサー・<br />映像クリエイター向けガイド
          </h1>
          <p className="text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            LP作成ツールとアフィリエイト機能を活用して、
            あなたの影響力を収益に変えましょう。
            コーディング不要でプロフェッショナルなLPを構築できます。
          </p>
        </div>
      </section>

      {/* 収益化の仕組み */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-center text-lg font-bold text-gray-900 mb-6">収益化の仕組み</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            {[
              { label: "あなた", sub: "LP作成", icon: "🎨", bg: "#ec4899" },
              { label: "", sub: "", icon: "→", bg: "" },
              { label: "フォロワー", sub: "LP閲覧", icon: "👀", bg: "#8b5cf6" },
              { label: "", sub: "", icon: "→", bg: "" },
              { label: "商品購入", sub: "Stripe決済", icon: "💳", bg: "#059669" },
              { label: "", sub: "", icon: "→", bg: "" },
              { label: "報酬獲得", sub: "自動計算", icon: "💰", bg: "#f59e0b" },
            ].map((item, i) =>
              item.bg ? (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white mb-1.5"
                    style={{ background: item.bg }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              ) : (
                <span key={i} className="text-gray-300 text-xl hidden md:block">
                  {item.icon}
                </span>
              )
            )}
          </div>
          <div className="mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-gray-700">
              報酬 = 購入金額 x コミッション率
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ?ref=あなたのコード でトラッキング → 購入完了時に自動記録
            </p>
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section id="steps" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10">
          <span className="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            STEP BY STEP
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">クリエイターの業務フロー</h2>
          <p className="text-gray-500 text-sm">登録からLP公開・報酬獲得までの6ステップ</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {creatorSteps.map((step) => (
            <StepCard key={step.number} step={step} color="#ec4899" gallery={<CreatorScreenGallery stepNumber={step.number} />} />
          ))}
        </div>
      </section>

      {/* LPブロック一覧 */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-pink-400 tracking-wider mb-3 text-center">
            LP BLOCK EDITOR
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">利用可能なLPブロック</h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            ドラッグ＆ドロップで自由に配置。12種類のブロックを組み合わせてLPを構築
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lpBlocks.map((block) => (
              <div key={block.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-xl mb-2">{block.icon}</div>
                <div className="font-bold text-sm mb-0.5">{block.label}</div>
                <div className="text-xs text-gray-400">{block.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 活用事例 */}
      <section id="usecases" className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          クリエイター別 活用シナリオ
        </h2>
        <p className="text-gray-500 text-sm text-center mb-10">
          あなたのスタイルに合った使い方を見つけてください
        </p>

        <div className="space-y-8">
          {useCases.map((uc) => (
            <div key={uc.role} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{uc.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{uc.role}</h3>
                </div>
              </div>
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {uc.scenarios.map((s, i) => (
                  <div key={i} className="p-5">
                    <h4 className="font-bold text-sm text-gray-900 mb-2">{s.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 報酬シミュレーション */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">報酬シミュレーション</h2>
        <p className="text-gray-500 text-sm text-center mb-10">コミッション率5%の場合の報酬例</p>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-5 py-3 font-medium text-gray-600">月間LP経由売上</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">コンバージョン</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">月間報酬</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sales: "10万円", cv: "10件", reward: "5,000円" },
                { sales: "50万円", cv: "50件", reward: "25,000円" },
                { sales: "100万円", cv: "100件", reward: "50,000円" },
                { sales: "500万円", cv: "500件", reward: "250,000円" },
              ].map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-5 py-3">{row.sales}</td>
                  <td className="px-5 py-3">{row.cv}</td>
                  <td className="px-5 py-3 text-right font-bold text-pink-600">{row.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold mb-3">
            あなたの影響力を収益に変えよう
          </h2>
          <p className="text-pink-100 text-sm mb-8">
            クリエイター登録は無料。今すぐ始めて、
            フォロワーに本当に良い商品を届けましょう。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup" className="bg-white text-purple-700 font-bold px-6 py-3 rounded-lg hover:bg-purple-50 text-sm transition">
              無料でクリエイター登録
            </Link>
            <Link href="/flow" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              メーカー・代理店フロー
            </Link>
            <Link href="/flow/buyer" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              バイヤーフロー
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs">
          &copy; 2026 単品決済ロットLP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
