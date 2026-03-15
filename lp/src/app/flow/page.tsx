import type { Metadata } from "next";
import Link from "next/link";
import { MakerScreenGallery, AgentScreenGallery, CreatorScreenGallery } from "@/components/flow/FlowScreenGallery";

export const metadata: Metadata = {
  title: "業務フロー | メーカー・代理店向けガイド",
  description:
    "単品決済ロットLPマーケットプレイスにおけるメーカー・代理店の業務フローを分かりやすく解説します。",
};

/* ── 型定義 ── */
type Step = {
  number: string;
  title: string;
  description: string;
  details: string[];
  color: string;
};

type FlowConnection = {
  from: string;
  to: string;
  label: string;
};

/* ── データ ── */

const makerSteps: Step[] = [
  {
    number: "01",
    title: "パートナー登録",
    description: "メーカーとしてアカウントを作成し、企業情報を登録します。",
    details: [
      "会社名・所在地・連絡先の登録",
      "パートナー種別「メーカー」を選択",
      "管理者によるアカウント承認",
    ],
    color: "#2563eb",
  },
  {
    number: "02",
    title: "商品登録",
    description: "販売する商品の情報を登録し、ロット（在庫）を作成します。",
    details: [
      "商品名・説明・画像・基本価格を設定",
      "ロット番号・在庫数・有効期限を管理",
      "Stripe連携で決済を自動化",
    ],
    color: "#2563eb",
  },
  {
    number: "03",
    title: "5層プルーフチェーン",
    description: "商品の信頼性を証明する5段階の証明書類を登録します。",
    details: [
      "L1: 事業者証明（営業許可証・署名）",
      "L2: 商品証明（成分表・検査結果）",
      "L3: 在庫証明（バーコード/WMS/IoT連携）",
      "L4: 所有権履歴（出品→購入→移管の追跡）",
      "L5: 配送証明（追跡番号・写真・署名）",
    ],
    color: "#2563eb",
  },
  {
    number: "04",
    title: "問い合わせ対応",
    description: "バイヤーからの問い合わせに対応し、商談を進めます。",
    details: [
      "新規問い合わせの確認・回答",
      "ステータス管理（新規→対応中→承諾/辞退）",
      "見積書・請求書・納品書の作成",
    ],
    color: "#2563eb",
  },
  {
    number: "05",
    title: "受注・出荷",
    description: "決済完了後、商品を出荷し配送証明を記録します。",
    details: [
      "Stripe経由の決済確認",
      "出荷手配・追跡番号の登録",
      "配送証明（L5）の記録・完了",
    ],
    color: "#2563eb",
  },
];

const agentSteps: Step[] = [
  {
    number: "01",
    title: "代理店登録",
    description: "代理店としてアカウントを作成し、親メーカーと紐付けます。",
    details: [
      "会社名・連絡先の登録",
      "パートナー種別「代理店」を選択",
      "親パートナー（メーカー）との紐付け",
    ],
    color: "#7c3aed",
  },
  {
    number: "02",
    title: "商品の取り扱い",
    description: "メーカーの商品を自社ラインナップとして展開します。",
    details: [
      "取り扱い商品の選定・登録",
      "独自の価格設定・販売戦略",
      "在庫状況のリアルタイム確認",
    ],
    color: "#7c3aed",
  },
  {
    number: "03",
    title: "LP作成・販促",
    description: "クリエイター機能でカスタムLPを作成し、販売チャネルを拡大します。",
    details: [
      "ブロックエディタでLP作成",
      "コレクション（商品一覧）ページの構築",
      "アフィリエイトコードで成果を追跡",
    ],
    color: "#7c3aed",
  },
  {
    number: "04",
    title: "バイヤー対応",
    description: "購入エージェント経由の問い合わせに対応し、商談をまとめます。",
    details: [
      "スコアリングされた問い合わせへの対応",
      "見積書の作成・送付",
      "価格交渉・条件調整",
    ],
    color: "#7c3aed",
  },
  {
    number: "05",
    title: "帳票管理・精算",
    description: "取引に関する帳票を管理し、メーカーとの精算を行います。",
    details: [
      "請求書・納品書の発行",
      "税区分（10%/8%）の自動計算",
      "アフィリエイト報酬の確認",
    ],
    color: "#7c3aed",
  },
];

const creatorSteps: Step[] = [
  {
    number: "01",
    title: "クリエイター登録",
    description: "アフィリエイトアカウントを作成し、固有コードを取得します。",
    details: [
      "メールアドレスでアフィリエイト登録",
      "プロフィール（名前・アバター・SNSリンク）を設定",
      "固有アフィリエイトコードの取得",
    ],
    color: "#ec4899",
  },
  {
    number: "02",
    title: "商品リサーチ",
    description: "マーケットプレイスから紹介したい商品を探し、プルーフで品質を確認します。",
    details: [
      "商品カタログ・ランキングから商品を検索",
      "プルーフチェーンで信頼性を確認",
      "自分のフォロワー層に合った商品を選定",
    ],
    color: "#ec4899",
  },
  {
    number: "03",
    title: "LP作成（画像・動画対応）",
    description: "ブロックエディタで画像・動画を自由に配置し、商品紹介ページをデザインします。",
    details: [
      "画像アップロード（JPG/PNG/WebP/SVG、最大10MB）",
      "動画埋め込み（YouTube/Vimeo URL、MP4アップロード）",
      "ギャラリー・スライダーで複数メディアを表示",
      "ヒーローに背景画像を設定",
      "テーマカラー・フォントのカスタマイズ",
    ],
    color: "#ec4899",
  },
  {
    number: "04",
    title: "公開・拡散",
    description: "LPを公開し、SNS・YouTube・ブログなどで拡散します。",
    details: [
      "ワンクリックで公開（/c/コード/スラッグ）",
      "SNS・YouTube概要欄にリンク設置",
      "?ref=コード パラメータで流入を自動追跡",
    ],
    color: "#ec4899",
  },
  {
    number: "05",
    title: "成果確認・報酬獲得",
    description: "アナリティクスで閲覧数・コンバージョンを確認し、報酬を獲得します。",
    details: [
      "LP別の閲覧数・CV数・CV率を確認",
      "報酬 = 購入金額 x コミッション率 で自動計算",
      "リファラルテーブルで全成果を一覧確認",
    ],
    color: "#ec4899",
  },
];

const connections: FlowConnection[] = [
  { from: "メーカー", to: "プラットフォーム", label: "商品・プルーフ登録" },
  { from: "プラットフォーム", to: "代理店", label: "商品データ連携" },
  { from: "代理店", to: "バイヤー", label: "LP・販促" },
  { from: "バイヤー", to: "プラットフォーム", label: "購入エージェント検索" },
  { from: "プラットフォーム", to: "メーカー/代理店", label: "問い合わせ通知" },
  { from: "メーカー/代理店", to: "バイヤー", label: "見積・受注・出荷" },
  { from: "クリエイター", to: "プラットフォーム", label: "LP作成・画像/動画アップ" },
  { from: "クリエイター", to: "バイヤー", label: "LP経由の集客" },
];

/* ── コンポーネント ── */

function StepCard({ step, gallery }: { step: Step; gallery?: React.ReactNode }) {
  return (
    <div className="relative flex gap-5">
      {/* 左：番号＋縦線 */}
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: step.color }}
        >
          {step.number}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
      </div>
      {/* 右：内容 */}
      <div className="pb-10">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
        <ul className="space-y-1.5">
          {step.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: step.color }}
              />
              {d}
            </li>
          ))}
        </ul>
        {gallery}
      </div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 className="text-center text-lg font-bold text-gray-900 mb-8">
        全体の取引フロー
      </h3>

      {/* 上段：メーカー → 単品決済ロットLP → 代理店 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {[
          { id: "maker", label: "メーカー", sub: "商品開発・製造", color: "#2563eb" },
          { id: "platform", label: "単品決済ロットLP", sub: "マーケットプレイス", color: "#0f172a" },
          { id: "agent", label: "代理店", sub: "販売・販促", color: "#7c3aed" },
        ].map((node, i) => (
          <div key={node.id} className="flex items-center gap-4">
            <div
              className="w-36 text-center rounded-xl p-4 text-white"
              style={{ background: node.color }}
            >
              <div className="font-bold text-sm">{node.label}</div>
              <div className="text-xs opacity-80 mt-0.5">{node.sub}</div>
            </div>
            {i < 2 && (
              <div className="flex flex-col items-center gap-0.5">
                <svg width="48" height="24" viewBox="0 0 48 24">
                  <defs>
                    <marker id={`ah-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6" fill="#94a3b8" />
                    </marker>
                    <marker id={`ahr-${i}`} markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                      <path d="M6,0 L0,3 L6,6" fill="#94a3b8" />
                    </marker>
                  </defs>
                  <line x1="4" y1="8" x2="44" y2="8" stroke="#94a3b8" strokeWidth="1.5" markerEnd={`url(#ah-${i})`} />
                  <line x1="44" y1="16" x2="4" y2="16" stroke="#94a3b8" strokeWidth="1.5" markerEnd={`url(#ahr-${i})`} />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 下段：バイヤー（左）とクリエイター（右） */}
      <div className="flex justify-center gap-16 mt-2">
        {/* バイヤー */}
        <div className="flex flex-col items-center gap-2">
          <svg width="24" height="32" viewBox="0 0 24 32">
            <defs>
              <marker id="ah-d" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
                <path d="M0,0 L3,6 L6,0" fill="#94a3b8" />
              </marker>
              <marker id="ah-u" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
                <path d="M0,6 L3,0 L6,6" fill="#94a3b8" />
              </marker>
            </defs>
            <line x1="8" y1="2" x2="8" y2="28" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ah-d)" />
            <line x1="16" y1="28" x2="16" y2="2" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ah-u)" />
          </svg>
          <div className="w-36 text-center rounded-xl p-4 text-white" style={{ background: "#059669" }}>
            <div className="font-bold text-sm">バイヤー</div>
            <div className="text-xs opacity-80 mt-0.5">購入・調達</div>
          </div>
        </div>
        {/* クリエイター */}
        <div className="flex flex-col items-center gap-2">
          <svg width="24" height="32" viewBox="0 0 24 32">
            <defs>
              <marker id="ah-d2" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
                <path d="M0,0 L3,6 L6,0" fill="#94a3b8" />
              </marker>
              <marker id="ah-u2" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
                <path d="M0,6 L3,0 L6,6" fill="#94a3b8" />
              </marker>
            </defs>
            <line x1="8" y1="2" x2="8" y2="28" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ah-d2)" />
            <line x1="16" y1="28" x2="16" y2="2" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ah-u2)" />
          </svg>
          <div className="w-36 text-center rounded-xl p-4 text-white" style={{ background: "#ec4899" }}>
            <div className="font-bold text-sm">クリエイター</div>
            <div className="text-xs opacity-80 mt-0.5">LP作成・集客</div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-500">
        {connections.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 h-0.5 bg-gray-400 shrink-0" />
            <span>
              {c.from} → {c.to}：{c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── ページ本体 ── */

export default function FlowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">
            単品決済ロットLP
          </Link>
          <nav className="flex gap-6 text-sm">
            <a href="#overview" className="text-gray-600 hover:text-gray-900">
              全体像
            </a>
            <a href="#maker" className="text-gray-600 hover:text-gray-900">
              メーカー
            </a>
            <a href="#agent" className="text-gray-600 hover:text-gray-900">
              代理店
            </a>
            <a href="#creator" className="text-gray-600 hover:text-gray-900">
              クリエイター
            </a>
            <Link href="/flow/buyer" className="text-gray-600 hover:text-gray-900">
              バイヤー
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-blue-400 tracking-wider mb-3">
            BUSINESS FLOW GUIDE
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            業務フローガイド
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            単品決済ロットLPマーケットプレイスにおける、メーカー・代理店・クリエイターの
            業務の流れを分かりやすく解説します。商品登録から受注・出荷、
            LP作成・収益化まで、すべてのステップをカバーします。
          </p>
        </div>
      </section>

      {/* 全体フロー図 */}
      <section id="overview" className="max-w-5xl mx-auto px-6 -mt-10 mb-16 relative z-10">
        <FlowDiagram />
      </section>

      {/* ロール比較 */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              メーカー
            </div>
            <h3 className="font-bold text-gray-900 mb-2">商品を製造・提供する企業</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- 自社商品の登録・在庫管理</li>
              <li>- 5層プルーフチェーンで信頼性を証明</li>
              <li>- バイヤーからの問い合わせに対応</li>
              <li>- 帳票管理（見積書・請求書・納品書）</li>
              <li>- グループウェアで社内連携</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <div className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              代理店
            </div>
            <h3 className="font-bold text-gray-900 mb-2">メーカー商品を販売する企業</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- メーカー商品の取り扱い・独自価格設定</li>
              <li>- カスタムLP作成で販売チャネルを拡大</li>
              <li>- アフィリエイトコードで成果を追跡</li>
              <li>- バイヤーとの商談・見積対応</li>
              <li>- メーカーとの精算・報酬管理</li>
            </ul>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
            <div className="inline-block bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              クリエイター
            </div>
            <h3 className="font-bold text-gray-900 mb-2">LP作成で商品を拡散・収益化</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- 画像・動画を使ったLP作成</li>
              <li>- コレクションページで商品キュレーション</li>
              <li>- SNS・YouTube・ブログで拡散</li>
              <li>- アフィリエイトコードで成果追跡</li>
              <li>- コンバージョン報酬を自動計算</li>
            </ul>
          </div>
        </div>
      </section>

      {/* メーカーフロー */}
      <section id="maker" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            MAKER FLOW
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            メーカーの業務フロー
          </h2>
          <p className="text-gray-500 text-sm">
            商品の登録から受注・出荷までの一連の流れ
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {makerSteps.map((step) => (
            <StepCard key={step.number} step={step} gallery={<MakerScreenGallery stepNumber={step.number} />} />
          ))}
        </div>
      </section>

      {/* 代理店フロー */}
      <section id="agent" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            AGENT FLOW
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            代理店の業務フロー
          </h2>
          <p className="text-gray-500 text-sm">
            メーカー商品の取り扱いから販促・精算までの一連の流れ
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {agentSteps.map((step) => (
            <StepCard key={step.number} step={step} gallery={<AgentScreenGallery stepNumber={step.number} />} />
          ))}
        </div>
      </section>

      {/* クリエイターフロー */}
      <section id="creator" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10">
          <span className="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            CREATOR FLOW
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            クリエイターのLP作成フロー
          </h2>
          <p className="text-gray-500 text-sm">
            画像・動画を活用したLP作成から収益化までの流れ
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {creatorSteps.map((step) => (
            <StepCard key={step.number} step={step} gallery={<CreatorScreenGallery stepNumber={step.number} />} />
          ))}
        </div>
      </section>

      {/* プルーフチェーン詳細 */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-blue-400 tracking-wider mb-3 text-center">
            PROOF CHAIN
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            5層プルーフチェーン
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            商品の信頼性をエンドツーエンドで証明する5段階の検証システム
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { layer: "L1", title: "事業者証明", desc: "営業許可証\n生産者署名", icon: "🏢" },
              { layer: "L2", title: "商品証明", desc: "成分規格書\n検査結果", icon: "📋" },
              { layer: "L3", title: "在庫証明", desc: "目視/バーコード\nWMS/IoT", icon: "📦" },
              { layer: "L4", title: "所有権履歴", desc: "出品→購入→\n落札→移管", icon: "🔗" },
              { layer: "L5", title: "配送証明", desc: "追跡番号\n写真・署名", icon: "🚚" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center h-full">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xs font-bold text-blue-400 mb-1">{item.layer}</div>
                  <div className="font-bold text-sm mb-2">{item.title}</div>
                  <div className="text-xs text-gray-400 whitespace-pre-line">{item.desc}</div>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-gray-600 text-sm">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section id="features" className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          主な機能
        </h2>
        <p className="text-gray-500 text-sm text-center mb-10">
          メーカー・代理店が利用できるプラットフォーム機能
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard icon="📦" title="商品・在庫管理" description="商品登録、ロット管理、在庫のリアルタイム追跡" />
          <FeatureCard icon="🔐" title="プルーフチェーン" description="5層の信頼性証明で商品の品質を保証" />
          <FeatureCard icon="🤖" title="購入エージェント" description="バイヤーの自動検索＆5因子スコアリング" />
          <FeatureCard icon="💳" title="Stripe決済" description="クレジットカード決済をワンクリックで" />
          <FeatureCard icon="🎨" title="LP作成ツール" description="ブロックエディタでカスタムLPを構築" />
          <FeatureCard icon="📊" title="アフィリエイト" description="コード追跡で成果報酬を自動計算" />
          <FeatureCard icon="📝" title="帳票管理" description="見積書・請求書・納品書の作成・管理" />
          <FeatureCard icon="💬" title="グループウェア" description="メッセージ・タスク・ファイル共有" />
          <FeatureCard icon="🏷️" title="オークション" description="ロット単位の競り・自動入札機能" />
          <FeatureCard icon="📈" title="ランキング" description="パートナー・商品のスコアランキング" />
          <FeatureCard icon="🔌" title="埋め込みウィジェット" description="外部サイトにiframeで商品表示" />
          <FeatureCard icon="📋" title="アンケート" description="バイヤー向けのサーベイ作成・集計" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold mb-3">
            パートナー登録を始めましょう
          </h2>
          <p className="text-blue-100 text-sm mb-8">
            メーカー・代理店として登録し、単品決済ロットLPマーケットプレイスで
            ビジネスを拡大しませんか？
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 text-sm transition"
            >
              無料で登録する
            </Link>
            <Link
              href="/flow/comparison"
              className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition"
            >
              従来ECとの違い
            </Link>
            <Link
              href="/"
              className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-slate-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs">
          &copy; 2026 単品決済ロットLP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
