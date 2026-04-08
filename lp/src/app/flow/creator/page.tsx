import type { Metadata } from "next";
import Link from "next/link";
import { CreatorScreenGallery } from "@/components/flow/FlowScreenGallery";

export const metadata: Metadata = {
  title: "クリエイター業務フロー | インフルエンサー・映像クリエイター向け",
  description:
    "Cross Infinityマーケットプレイスでインフルエンサーや映像クリエイターがLP作成・アフィリエイトで収益化する方法を解説します。",
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
      "ポイント還元率の確認",
    ],
  },
  {
    number: "02",
    title: "販売許可取得・価格設定",
    description: "メーカーから販売許可を取得し、許可された価格範囲内で販売価格を設定します。",
    details: [
      "メーカーに販売許可をリクエスト",
      "メーカーが販売価格の上限・下限を設定して許可",
      "許可範囲内で販売価格を自由に設定",
      "プルーフチェーンで品質・信頼性を確認",
      "卸値と販売価格の差分がクリエイターの利益",
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
    title: "成果確認・利益獲得",
    description:
      "アナリティクスで売上を確認。販売価格と卸値の差分がクリエイターの利益です。",
    details: [
      "LP/コレクション別の閲覧数を確認",
      "コンバージョン数（購入完了）の追跡",
      "利益 = 販売価格 - 卸値（仕入れ価格）",
      "売上・利益のリアルタイム確認",
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
        desc: "ブログの比較記事からCross Infinityのコレクションページへリンク。読者が商品を一覧で比較し購入できる導線を構築。",
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
          <Link href="/" className="font-bold text-gray-900">Cross Infinity</Link>
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
              利益 = 販売価格 - 卸値（仕入れ価格）
            </p>
            <p className="text-xs text-gray-500 mt-1">
              メーカーから販売許可を取得 → 卸値に利益を上乗せしてLPで販売
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

      {/* デザイン・動画で伝えることの重要性 */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <p className="text-sm font-medium text-pink-500 tracking-wider mb-3 text-center">
          WHY DESIGN &amp; VIDEO MATTER
        </p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          なぜデザインと動画で伝えることが重要なのか？
        </h2>
        <p className="text-gray-500 text-sm text-center max-w-2xl mx-auto mb-10">
          スペック表だけでは伝わらない。「見せ方」が購買を決める時代です。
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-bold text-red-800 mb-4">テキストだけのECページ</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 商品スペックの羅列で、違いが分からない</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 写真は白背景のカタログ写真だけ</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 「なぜこの商品がいいのか」が伝わらない</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> どの商品も同じに見えてしまう</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 専門知識がないと選べない</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-green-800 mb-4">クリエイターのLP</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> 使用シーンの動画で「自分ごと化」できる</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> 美しいデザインで商品の魅力が伝わる</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> 「この人が薦めるなら」という信頼</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> 専門家の視点で「なぜ良いか」を解説</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> 証明データと合わせて信頼性が倍増</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 text-center mb-6">クリエイターの3つの力</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">デザインの力</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                同じ商品でも見せ方を変えるだけで購買率は数倍変わります。色使い、レイアウト、写真の切り取り方。プロのデザインが商品の価値を引き上げます。
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎬</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">動画の力</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                テキストの5,000倍の情報量。実際に使っている様子、質感、サイズ感。動画なら3秒で伝わることが、文章では伝えきれません。
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">❓</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">問いの力</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                「この成分は何のため？」「なぜこの製法にこだわるのか？」。専門家だからこそ投げかけられる問いが、バイヤーの判断材料になります。証明データがその答えを裏付けます。
              </p>
            </div>
          </div>
          <div className="mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700">
              <span className="font-bold">デザイン × 動画 × 問い × 証明</span> = 「選ばれる理由」が完成する
            </p>
            <p className="text-xs text-gray-500 mt-1">
              クリエイターが伝え、証明が裏付ける。この組み合わせが最強の販売力です。
            </p>
          </div>
        </div>
      </section>

      {/* SNS連携 */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-pink-400 tracking-wider mb-3 text-center">
            SNS INTEGRATION
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            ワンクリックで複数SNSに連携
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-2xl mx-auto">
            作成したLPは、すべての主要SNSに簡単にシェアできます。
            各SNSに最適化されたプレビューが自動生成されます。
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { name: "Instagram", icon: "📸", color: "from-pink-500 to-purple-600", features: ["ストーリーズリンク", "フィード投稿", "リール連動"] },
              { name: "X (Twitter)", icon: "🐦", color: "from-gray-700 to-gray-900", features: ["OGPカード自動生成", "ポスト連携", "スレッド投稿"] },
              { name: "TikTok", icon: "🎵", color: "from-gray-900 to-pink-600", features: ["プロフィールリンク", "動画説明欄", "ショップ連携"] },
              { name: "YouTube", icon: "▶️", color: "from-red-600 to-red-700", features: ["概要欄リンク", "カード挿入", "エンドスクリーン"] },
              { name: "LINE", icon: "💬", color: "from-green-500 to-green-600", features: ["リッチメッセージ", "LINEシェア", "公式アカウント連携"] },
              { name: "Facebook", icon: "👤", color: "from-blue-600 to-blue-700", features: ["OGPプレビュー", "ページ投稿", "マーケットプレイス"] },
            ].map((sns) => (
              <div key={sns.name} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${sns.color} px-3 py-2 text-center`}>
                  <span className="text-xl">{sns.icon}</span>
                  <p className="text-xs font-bold mt-0.5">{sns.name}</p>
                </div>
                <div className="p-3 space-y-1">
                  {sns.features.map((f) => (
                    <p key={f} className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="text-green-400">✓</span> {f}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-center mb-4">LP → SNS連携の流れ</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {[
                { step: "LPを作成", icon: "🎨" },
                { step: "シェアボタンをクリック", icon: "📤" },
                { step: "SNSを選択", icon: "📱" },
                { step: "最適プレビュー自動生成", icon: "✨" },
                { step: "投稿完了", icon: "🎉" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl mb-1">{item.icon}</div>
                    <p className="text-[10px] text-gray-400 max-w-[80px]">{item.step}</p>
                  </div>
                  {i < 4 && <span className="text-gray-600 hidden sm:block">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs font-bold text-pink-400">OGP自動生成</p>
                <p className="text-[10px] text-gray-400">SNSでシェアした時に美しいプレビューカードが自動で表示</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs font-bold text-pink-400">UTMパラメータ自動付与</p>
                <p className="text-[10px] text-gray-400">どのSNSから流入したかを自動で追跡。効果測定も簡単</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs font-bold text-pink-400">QRコード生成</p>
                <p className="text-[10px] text-gray-400">オフラインイベントや名刺にも。QRコードでLPに誘導</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 報酬シミュレーション */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">利益シミュレーション</h2>
        <p className="text-gray-500 text-sm text-center mb-10">卸値に20%上乗せして販売した場合の利益例</p>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">卸値（仕入れ）</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">販売価格</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">月間販売数</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">月間利益</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cost: "¥3,000", price: "¥3,600", qty: "30箱", profit: "¥18,000" },
                { cost: "¥3,000", price: "¥3,600", qty: "100箱", profit: "¥60,000" },
                { cost: "¥5,000", price: "¥6,000", qty: "50箱", profit: "¥50,000" },
                { cost: "¥5,000", price: "¥6,000", qty: "200箱", profit: "¥200,000" },
              ].map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3">{row.cost}</td>
                  <td className="px-4 py-3">{row.price}</td>
                  <td className="px-4 py-3">{row.qty}</td>
                  <td className="px-4 py-3 text-right font-bold text-pink-600">{row.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 公開プロフィール */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-pink-400 tracking-wider mb-3 text-center">
            PUBLIC PROFILE
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            クリエイター・インフルエンサー公開プロフィール
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-2xl mx-auto">
            あなたの実績・専門性・フォロワー数を公開プロフィールとして表示。
            メーカーからの販売許可リクエストが届きやすくなり、バイヤーからの信頼も獲得できます。
          </p>

          {/* プロフィールカード例 */}
          <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 h-20" />
            <div className="px-6 pb-6 -mt-8">
              <div className="w-16 h-16 bg-slate-700 border-4 border-slate-800 rounded-full flex items-center justify-center text-2xl mb-3">
                👩‍🎨
              </div>
              <h3 className="font-bold text-lg">クリエイター名</h3>
              <p className="text-xs text-gray-400 mb-3">美容・コスメ専門 | 映像クリエイター</p>
              <div className="flex gap-3 mb-4">
                {[
                  { label: "フォロワー", value: "50K" },
                  { label: "販売実績", value: "128件" },
                  { label: "評価", value: "4.9" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-700/50 rounded-lg px-3 py-2 text-center flex-1">
                    <p className="text-xs font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["化粧品", "スキンケア", "サプリ", "オーガニック"].map((tag) => (
                  <span key={tag} className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex gap-2">
                {["Instagram", "YouTube", "TikTok"].map((sns) => (
                  <span key={sns} className="text-[10px] bg-slate-700 text-gray-300 px-2 py-1 rounded">{sns}</span>
                ))}
              </div>
            </div>
          </div>

          {/* プロフィールに表示される情報 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "👤", title: "基本情報", desc: "クリエイター名、アバター画像、自己紹介文、専門ジャンル" },
              { icon: "📊", title: "実績データ", desc: "販売件数、総売上ランク、LP作成数、コンバージョン率" },
              { icon: "📱", title: "SNSリンク", desc: "Instagram、YouTube、TikTok、X、ブログなどの連携アカウント" },
              { icon: "👥", title: "フォロワー数", desc: "各SNSのフォロワー数を自動取得して表示（任意公開）" },
              { icon: "🏅", title: "評価・レビュー", desc: "メーカーやバイヤーからの評価。信頼性の指標になります" },
              { icon: "🏷️", title: "得意カテゴリー", desc: "取り扱い実績のある商品カテゴリーをタグで表示" },
              { icon: "🎬", title: "ポートフォリオ", desc: "過去に作成したLPや動画のサンプルギャラリー" },
              { icon: "📅", title: "活動履歴", desc: "最近の販売実績や新規LP作成の活動状況" },
              { icon: "🤝", title: "提携メーカー", desc: "販売許可を得ているメーカーのロゴ・リンクを表示" },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* プロフィール公開のメリット */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-pink-950/50 border border-pink-800/50 rounded-xl p-5">
              <h4 className="font-bold text-pink-400 text-sm mb-2">メーカーからのオファー増加</h4>
              <p className="text-xs text-gray-400">実績やフォロワー数が可視化されることで、メーカーから直接販売許可のオファーが届きます。</p>
            </div>
            <div className="bg-purple-950/50 border border-purple-800/50 rounded-xl p-5">
              <h4 className="font-bold text-purple-400 text-sm mb-2">バイヤーからの信頼獲得</h4>
              <p className="text-xs text-gray-400">評価スコアや販売実績が見えることで、LP経由の購入コンバージョン率が向上します。</p>
            </div>
            <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-xl p-5">
              <h4 className="font-bold text-indigo-400 text-sm mb-2">クリエイター同士の連携</h4>
              <p className="text-xs text-gray-400">得意ジャンルの異なるクリエイター同士でコラボLP作成。お互いのフォロワーにリーチ。</p>
            </div>
          </div>

          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400">
              プロフィールの公開範囲は自分で設定できます。フォロワー数やSNSリンクの表示/非表示は個別に選択可能です。
            </p>
          </div>
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
          &copy; 2026 Cross Infinity. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
