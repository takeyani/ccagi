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
    description: "商品の信頼性を証明する証明書類を登録します。カテゴリーにより必要な項目が異なります。",
    details: [
      "L1: 事業者証明（営業許可証・署名）── 全カテゴリー推奨",
      "L2: 商品証明（成分表・検査結果）── 食品・化粧品は必須、他は任意",
      "L3: 在庫証明（バーコード/倉庫連携）── 物理商品のみ、デジタル商品は対象外",
      "L4: 所有権履歴（受発注レコードで自動記録）── システムが自動生成",
      "L5: 配送証明（追跡番号・写真・署名）── 物理商品のみ",
    ],
    color: "#2563eb",
  },
  {
    number: "04",
    title: "企画・キャンペーン",
    description: "在庫単位で割引企画を作成し、取引先ごとに特別価格を設定します。",
    details: [
      "在庫（ロット）レベルでキャンペーンを作成",
      "対象取引先を追加して企業別の割引を設定",
      "対象企業は色分け表示で一目で把握",
      "期間限定・まとめ買い割引など柔軟に対応",
    ],
    color: "#2563eb",
  },
  {
    number: "05",
    title: "クリエイター販売許可",
    description: "クリエイターからの販売許可リクエストを審査し、価格範囲を設定して許可します。",
    details: [
      "クリエイターからの販売許可リクエストを確認",
      "販売価格の上限・下限を設定",
      "許可範囲内でクリエイターが自由に価格設定",
      "ブランド価値を守りつつ販路を拡大",
    ],
    color: "#2563eb",
  },
  {
    number: "06",
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
    number: "07",
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
    title: "販売代理店登録",
    description: "販売代理店としてアカウントを作成し、親メーカーと紐付けます。",
    details: [
      "会社名・連絡先の登録（個人事業主も可）",
      "パートナー種別「販売代理店」を選択",
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
    description: "取引に関する帳票を管理し、メーカーとの精算を行います。BtoB/BtoC両対応。",
    details: [
      "BtoB帳票：見積書・請求書・納品書の発行",
      "BtoC帳票：領収書・購入明細・返品伝票の発行",
      "インボイス制度対応：適格請求書番号（T+13桁）を自動反映",
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
    title: "販売許可取得・価格設定",
    description: "メーカーから販売許可を取得し、許可された価格範囲内で販売価格を設定します。",
    details: [
      "メーカーに販売許可をリクエスト",
      "メーカーが販売価格の上限・下限を設定して許可",
      "許可範囲内で販売価格を自由に設定",
      "卸値と販売価格の差分がクリエイターの利益",
    ],
    color: "#ec4899",
  },
  {
    number: "03",
    title: "LP作成（画像・動画対応）",
    description: "メーカー許可済みの商品でLPを作成。卸値+利益の価格で販売ページをデザインします。",
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
    title: "成果確認・利益獲得",
    description: "アナリティクスで売上を確認。販売価格と卸値の差分がクリエイターの利益です。",
    details: [
      "LP別の閲覧数・CV数・CV率を確認",
      "利益 = 販売価格 - 卸値（仕入れ価格）",
      "売上・利益のリアルタイム確認",
    ],
    color: "#ec4899",
  },
];

const connections: FlowConnection[] = [
  { from: "メーカー", to: "プラットフォーム", label: "商品・プルーフ登録" },
  { from: "プラットフォーム", to: "販売代理店", label: "商品データ連携" },
  { from: "販売代理店", to: "バイヤー", label: "LP・販促" },
  { from: "バイヤー", to: "プラットフォーム", label: "購入エージェント検索" },
  { from: "プラットフォーム", to: "メーカー/販売代理店", label: "問い合わせ通知" },
  { from: "メーカー/販売代理店", to: "バイヤー", label: "見積・受注・出荷" },
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

function FlowNode({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div className="w-36 text-center rounded-xl p-4 text-white" style={{ background: color }}>
      <div className="font-bold text-sm">{label}</div>
      <div className="text-xs opacity-80 mt-0.5">{sub}</div>
    </div>
  );
}

function FlowArrow({ direction, label, color = "#94a3b8" }: { direction: "right" | "down" | "left"; label: string; color?: string }) {
  if (direction === "right") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{label}</div>
        <svg width="48" height="12" viewBox="0 0 48 12">
          <defs><marker id={`ar-${label}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d={`M0,0 L6,3 L0,6`} fill={color} /></marker></defs>
          <line x1="2" y1="6" x2="42" y2="6" stroke={color} strokeWidth="2" markerEnd={`url(#ar-${label})`} />
        </svg>
      </div>
    );
  }
  if (direction === "left") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <svg width="48" height="12" viewBox="0 0 48 12">
          <defs><marker id={`al-${label}`} markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d={`M6,0 L0,3 L6,6`} fill={color} /></marker></defs>
          <line x1="46" y1="6" x2="6" y2="6" stroke={color} strokeWidth="2" markerEnd={`url(#al-${label})`} />
        </svg>
        <div className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{label}</div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <svg width="12" height="36" viewBox="0 0 12 36">
        <defs><marker id={`ad-${label}`} markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto"><path d="M0,0 L3,6 L6,0" fill={color} /></marker></defs>
        <line x1="6" y1="2" x2="6" y2="30" stroke={color} strokeWidth="2" markerEnd={`url(#ad-${label})`} />
      </svg>
      <div className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{label}</div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 className="text-center text-lg font-bold text-gray-900 mb-8">
        全体の取引フロー
      </h3>

      {/*
        レイアウト:
        メーカー → プラットフォーム → 代理店
                       ↓                ↓
                   クリエイター    →  LP作成
                       ↓
                   バイヤー（LP経由で購入）
      */}

      {/* 上段：メーカー → プラットフォーム → 代理店 */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <FlowNode label="メーカー" sub="商品開発・製造" color="#2563eb" />
        <FlowArrow direction="right" label="商品・プルーフ登録" color="#2563eb" />
        <FlowNode label="単品決済ロットLP" sub="マーケットプレイス" color="#0f172a" />
        <FlowArrow direction="right" label="商品データ連携" color="#7c3aed" />
        <FlowNode label="販売代理店" sub="メーカー代理店・法人営業" color="#7c3aed" />
      </div>

      {/* 中段：プラットフォーム→クリエイター、クリエイター→LP */}
      <div className="flex justify-center mb-2">
        <div className="w-36" /> {/* メーカー分のスペース */}
        <div className="w-[48px]" /> {/* 矢印分 */}
        <div className="flex flex-col items-center">
          <FlowArrow direction="down" label="商品情報提供" color="#ec4899" />
          <FlowNode label="クリエイター" sub="映像制作者・インフルエンサー" color="#ec4899" />
          <div className="mt-2 bg-pink-50 border border-pink-200 rounded-lg px-4 py-2 text-center">
            <div className="text-[10px] font-bold text-pink-700">画像・動画でLP作成</div>
            <div className="text-[9px] text-pink-500">ブロックエディタで商品を紹介</div>
          </div>
        </div>
      </div>

      {/* 下段：LP → バイヤー（購入） */}
      <div className="flex justify-center mb-2">
        <div className="flex flex-col items-center">
          <FlowArrow direction="down" label="LP経由で集客" color="#059669" />
          <FlowNode label="バイヤー / ユーザー" sub="購入企業(国内・輸出商社)・個人購入者" color="#059669" />
        </div>
      </div>

      {/* 購入フロー（バイヤー→プラットフォーム→メーカー） */}
      <div className="flex justify-center mt-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 flex items-center gap-3">
          <div className="text-[10px] font-bold text-emerald-600">購入フロー:</div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">バイヤー</span>
            <span className="text-gray-400">→ LP閲覧 →</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Stripe決済</span>
            <span className="text-gray-400">→ 注文 →</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">メーカー出荷</span>
            <span className="text-gray-400">→</span>
            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-medium">クリエイター報酬</span>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
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
              販売代理店
            </a>
            <a href="#creator" className="text-gray-600 hover:text-gray-900">
              クリエイター
            </a>
            <a href="#categories" className="text-gray-600 hover:text-gray-900">
              カテゴリー
            </a>
            <Link href="/flow/buyer" className="text-gray-600 hover:text-gray-900">
              バイヤー
            </Link>
            <Link href="/flow/comparison" className="text-gray-600 hover:text-gray-900">
              比較
            </Link>
            <Link href="/awards" className="text-gray-600 hover:text-gray-900">
              アワード
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
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-bold text-blue-800 mb-1">具体的にはどんな人？</p>
              <p className="text-xs text-blue-700 leading-relaxed mb-1">食品メーカー、化粧品会社、家電メーカー、アパレルブランド、サービス事業者、映像制作会社など。自社の商品やサービスを出品・販売します。</p>
              <p className="text-xs font-bold text-blue-800 mt-2 mb-1">なぜ登録するのか？</p>
              <p className="text-xs text-blue-700 leading-relaxed">初期費用ゼロ・成果報酬型で、売れた時だけ手数料が発生。自社ECを持たなくても、クリエイターや代理店が販路を広げてくれるため、少ない労力で全国のバイヤーにリーチできます。</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- 自社商品の登録・在庫管理</li>
              <li>- 5層プルーフチェーンで信頼性を証明</li>
              <li>- バイヤーからの問い合わせに対応</li>
              <li>- 帳票管理（BtoB: 見積書・請求書・納品書 / BtoC: 領収書・購入明細・返品伝票）</li>
              <li>- インボイス制度対応（適格請求書の自動発行）</li>
              <li>- グループウェアで社内連携</li>
              <li>- クリエイターへの販売許可で販路拡大</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <div className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              販売代理店
            </div>
            <h3 className="font-bold text-gray-900 mb-2">メーカー商品を販売する企業・個人</h3>
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-bold text-purple-800 mb-1">具体的にはどんな人？</p>
              <p className="text-xs text-purple-700 leading-relaxed mb-1">メーカーの販売代理店、商社、問屋、営業代行会社、または個人でLPを作成して販売する人など。既存の取引先ネットワークやWebサイトを活用して商品を販売します。</p>
              <p className="text-xs font-bold text-purple-800 mt-2 mb-1">なぜ登録するのか？</p>
              <p className="text-xs text-purple-700 leading-relaxed">在庫リスクなしでメーカー商品を取り扱い可能。LP作成ツールで独自の販売ページを簡単に構築でき、紹介報酬（2%ポイント）も獲得。既存の取引先ネットワークを活かして収益を最大化できます。</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- メーカー商品の取り扱い・独自価格設定</li>
              <li>- カスタムLP作成で販売チャネルを拡大</li>
              <li>- アフィリエイトコードで成果を追跡</li>
              <li>- バイヤーとの商談・見積対応</li>
              <li>- メーカーとの精算・報酬管理</li>
              <li>- キャンペーン連携で特別価格を取引先に提供</li>
            </ul>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
            <div className="inline-block bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              クリエイター
            </div>
            <h3 className="font-bold text-gray-900 mb-2">LP作成で商品を拡散・収益化</h3>
            <div className="bg-pink-100 border border-pink-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-bold text-pink-800 mb-1">具体的にはどんな人？</p>
              <p className="text-xs text-pink-700 leading-relaxed mb-1">映像制作会社、映像クリエイター、インフルエンサー、デザイナーなど、商品のLPを作成して販促する人。SNSやYouTubeのフォロワーを活かして商品を紹介します。</p>
              <p className="text-xs font-bold text-pink-800 mt-2 mb-1">なぜ登録するのか？</p>
              <p className="text-xs text-pink-700 leading-relaxed">仕入れ不要・在庫リスクなしで物販を始められます。メーカーから販売許可をもらい、卸値に利益を上乗せしたLPを作成。売れた分だけ利益になるので、SNSやブログのフォロワーを収益に変えられます。</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>- 画像・動画を使ったLP作成</li>
              <li>- コレクションページで商品キュレーション</li>
              <li>- SNS・YouTube・ブログで拡散</li>
              <li>- 卸値との差分がそのまま利益に</li>
              <li>- コンバージョン・売上を自動計算</li>
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
            販売代理店の業務フロー
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
            5つの「大丈夫？」に答える証明のしくみ
          </h2>
          <p className="text-gray-400 text-center text-sm mb-4 max-w-2xl mx-auto">
            買い手が商品を購入するとき、頭の中にある5つの不安。
            その一つひとつに証拠で答えるのが「5層プルーフチェーン」です。
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 max-w-2xl mx-auto mb-4">
            <p className="text-amber-300 text-sm font-bold mb-1">すべて必須ではありません</p>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              5つの証明は、取り扱うカテゴリーによって必要な項目が変わります。
              例えば映像販売のように在庫が無限にあるデジタル商品では在庫証明（L3）や配送証明（L5）は不要です。
              食品の場合は表示義務があるため商品証明（L2）が必須になります。
              所有権履歴（L4）は受発注のレコードからシステムが自動生成します。
            </p>
          </div>
          <p className="text-gray-500 text-center text-xs mb-10 max-w-xl mx-auto">
            購入エージェント（AI）はこの5つの証明をスコア化して、信頼できる商品を自動で見つけ出します
          </p>

          {/* 5層カード */}
          <div className="space-y-4">
            {[
              {
                layer: "L1", title: "この会社は本物？", subtitle: "事業者の証明", icon: "🏢",
                worry: "聞いたことのない会社だけど、ちゃんとした企業なの？詐欺じゃない？",
                proof: "営業許可証や会社の登記情報を登録。「この会社は実在して、きちんと営業許可を持っています」と証明します。",
                example: "食品なら保健所の営業許可証、化粧品なら製造販売業許可証など",
                agent: "許可証の有無と有効期限をチェック → 切れていたらスコアを下げる",
              },
              {
                layer: "L2", title: "この商品は安全？", subtitle: "商品の証明", icon: "📋",
                worry: "成分は何？検査はしてるの？品質は本当に大丈夫？",
                proof: "成分表・検査結果・品質管理の記録を登録。「この商品は中身がちゃんと分かっていて、検査もクリアしています」と証明します。",
                example: "食品なら成分規格書と微生物検査結果、家電ならPSE適合証明書など",
                agent: "カテゴリーに必要な検査書類が揃っているか確認 → 不足があればスコアを下げる",
              },
              {
                layer: "L3", title: "在庫は本当にある？", subtitle: "在庫の証明（物理商品のみ）", icon: "📦",
                worry: "注文したのに「在庫がありませんでした」とか言われないよね？",
                proof: "実際の在庫を写真・バーコード・倉庫システムで確認。「この在庫は今、確かに存在しています」と証明します。デジタル商品（映像・サービス等）の場合は在庫が無限のため、この証明は不要です。",
                example: "倉庫の写真、バーコード読み取り記録、倉庫管理システム（WMS）との連携データなど",
                agent: "証明方法のレベル（目視 < バーコード < WMS < IoTセンサー）でスコアを変える。デジタル商品はこの項目をスキップ",
              },
              {
                layer: "L4", title: "誰から買うの？怪しくない？", subtitle: "所有権の履歴（自動記録）", icon: "🔗",
                worry: "転売品？偽物じゃない？どういうルートで来た商品なの？",
                proof: "受発注が成立するとシステムが自動でレコードを生成し、権利が譲渡されます。所有者の権利と在庫の保管場所は別々に管理し、最終的に在庫が輸送・納品されたら取引完了となります。",
                example: "メーカー → 販売代理店 → 出品 → 購入 の取引レコードが自動追跡される",
                agent: "ルートが短い（メーカー直→高スコア）、転売を繰り返している→スコアを下げる",
              },
              {
                layer: "L5", title: "ちゃんと届く？", subtitle: "配送の証明（物理商品のみ）", icon: "🚚",
                worry: "お金を払ったのに届かなかったらどうしよう？届いた商品が違ったら？",
                proof: "配送追跡番号、届いた時の写真、受け取りサインを記録。「確かにこの商品が届きました」と証明します。",
                example: "配送会社の追跡番号、配達完了時の写真撮影、受取人の電子署名など",
                agent: "過去の配送証明の完了率をチェック → 未完了が多い売り手はスコアを下げる",
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{item.layer}</span>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400">{item.subtitle}</p>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {/* 買い手の不安 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm">😟</div>
                    <div>
                      <p className="text-xs font-bold text-red-400 mb-0.5">買い手の不安</p>
                      <p className="text-sm text-gray-300">{item.worry}</p>
                    </div>
                  </div>
                  {/* 証明で解決 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm">✅</div>
                    <div>
                      <p className="text-xs font-bold text-green-400 mb-0.5">この証明でこう解決</p>
                      <p className="text-sm text-gray-300">{item.proof}</p>
                    </div>
                  </div>
                  {/* 具体例 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">📎</div>
                    <div>
                      <p className="text-xs font-bold text-amber-400 mb-0.5">たとえばこんな書類</p>
                      <p className="text-sm text-gray-400">{item.example}</p>
                    </div>
                  </div>
                  {/* AIエージェントの判定 */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">🤖</div>
                    <div>
                      <p className="text-xs font-bold text-purple-400 mb-0.5">購入エージェント（AI）はこう判定する</p>
                      <p className="text-sm text-gray-400">{item.agent}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* まとめ図 */}
          <div className="mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-center mb-6">5つの証明で「安心して買える」が完成する</h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {[
                { label: "会社は本物？", color: "bg-blue-500" },
                { label: "商品は安全？", color: "bg-green-500" },
                { label: "在庫はある？", color: "bg-amber-500" },
                { label: "ルートは正当？", color: "bg-purple-500" },
                { label: "届くの確実？", color: "bg-pink-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className={`${item.color} text-white text-xs font-bold px-3 py-1.5 rounded-lg`}>{item.label}</span>
                  {i < 4 && <span className="text-gray-600 mx-1">+</span>}
                </div>
              ))}
              <span className="text-gray-500 mx-2">=</span>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">
                信頼スコア
              </span>
            </div>
            <p className="text-gray-400 text-xs text-center mt-4">
              購入エージェント（AI）は5つの証明をスコア化し、バイヤーの条件に合う信頼できる商品だけを自動で提案します。
              <br />
              証明が多い売り手ほどスコアが高くなり、検索結果の上位に表示されやすくなります。
            </p>
          </div>

          {/* 証明がないとどうなる？ */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-5">
              <h4 className="font-bold text-red-400 text-sm mb-3">証明がない場合</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 会社の実態がわからず不安</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 商品の品質を確認する手段がない</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 在庫切れや欠品のリスク</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> 偽物・転売品をつかまされる可能性</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> お金を払っても届かないリスク</li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span> AIエージェントが判定できない</li>
              </ul>
            </div>
            <div className="bg-green-950/50 border border-green-800/50 rounded-xl p-5">
              <h4 className="font-bold text-green-400 text-sm mb-3">5層すべて証明されている場合</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 実在する企業と確認でき安心</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 検査済み・成分がわかるので安心</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 実際に在庫がある商品だけ表示</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> メーカーからの正規ルートが見える</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 配送を追跡でき確実に届く</li>
                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> AIが高スコア判定→自動で推薦される</li>
              </ul>
            </div>
          </div>

          {/* カテゴリー別の必須/任意テーブル */}
          <div className="mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-center mb-2">カテゴリー別：プルーフチェーン必要項目</h3>
            <p className="text-gray-400 text-xs text-center mb-4">取り扱い商品によって必要な証明は異なります</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 px-2 text-gray-400">カテゴリー</th>
                    <th className="text-center py-2 px-2 text-gray-400">L1 事業者</th>
                    <th className="text-center py-2 px-2 text-gray-400">L2 商品</th>
                    <th className="text-center py-2 px-2 text-gray-400">L3 在庫</th>
                    <th className="text-center py-2 px-2 text-gray-400">L4 所有権</th>
                    <th className="text-center py-2 px-2 text-gray-400">L5 配送</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[
                    { cat: "食品", l1: "◎", l2: "◎", l3: "◎", l4: "自動", l5: "◎", note: "表示義務あり" },
                    { cat: "化粧品・健康食品", l1: "◎", l2: "◎", l3: "◎", l4: "自動", l5: "◎", note: "成分表示義務あり" },
                    { cat: "家電・電子機器", l1: "◎", l2: "○", l3: "◎", l4: "自動", l5: "◎", note: "" },
                    { cat: "洋服・ファッション", l1: "○", l2: "○", l3: "◎", l4: "自動", l5: "◎", note: "" },
                    { cat: "サービス・コンサル", l1: "○", l2: "−", l3: "−", l4: "自動", l5: "−", note: "無形サービス" },
                    { cat: "映像・デジタル商品", l1: "○", l2: "−", l3: "−", l4: "自動", l5: "−", note: "在庫無限" },
                    { cat: "産業用・工業製品", l1: "◎", l2: "○", l3: "◎", l4: "自動", l5: "◎", note: "" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-2 px-2 font-medium">{row.cat} {row.note && <span className="text-amber-400 text-[10px]">※{row.note}</span>}</td>
                      <td className="text-center py-2 px-2">{row.l1}</td>
                      <td className="text-center py-2 px-2">{row.l2}</td>
                      <td className="text-center py-2 px-2">{row.l3}</td>
                      <td className="text-center py-2 px-2">{row.l4}</td>
                      <td className="text-center py-2 px-2">{row.l5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-gray-500">
              <span>◎ 必須</span>
              <span>○ あると信頼度UP（任意）</span>
              <span>− 対象外</span>
              <span>自動 = システムが受発注レコードから自動生成</span>
            </div>
            <p className="mt-2 text-[10px] text-amber-300/70">
              ※ 食品（特に海外輸入品）は日本語での表示義務があり、商品証明（L2）が不足すると出品不可になる場合があります
            </p>
          </div>
        </div>
      </section>

      {/* カテゴリー別の入力項目 */}
      <section id="categories" className="max-w-5xl mx-auto px-6 mb-20">
        <p className="text-sm font-medium text-blue-600 tracking-wider mb-3 text-center">
          CATEGORY FIELDS
        </p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          商品カテゴリーに合わせた入力項目
        </h2>
        <p className="text-gray-500 text-sm text-center mb-4 max-w-2xl mx-auto">
          食品には賞味期限が必要ですが、サービスには不要です。
          カテゴリーを選ぶだけで、その商品に本当に必要な項目だけが表示されます。
        </p>
        <p className="text-gray-400 text-xs text-center mb-10">
          不要な入力を省き、正確な情報だけを効率よく登録できます
        </p>

        <div className="space-y-6">
          {/* 食品 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🍱</span>
              <div>
                <h3 className="font-bold text-gray-900">食品・飲料</h3>
                <p className="text-xs text-gray-500">口に入るものだから、安全に関する項目が必要</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "アレルギー表示", required: true, example: "小麦・卵・乳" },
                    { label: "原材料", required: true, example: "小麦粉、砂糖、バター..." },
                    { label: "カロリー・栄養成分", required: false, example: "1個あたり320kcal" },
                    { label: "保存の仕方", required: true, example: "直射日光を避け常温保存" },
                    { label: "どこで作られたか", required: true, example: "北海道" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                      <span className="text-xs text-gray-400 ml-auto hidden sm:block">例: {f.example}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "賞味期限", required: true, example: "2026/12/31" },
                    { label: "作った日", required: false, example: "2026/06/01" },
                    { label: "温度帯", required: true, example: "常温 / 冷蔵 / 冷凍" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                      <span className="text-xs text-gray-400 ml-auto hidden sm:block">例: {f.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 化粧品 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💄</span>
              <div>
                <h3 className="font-bold text-gray-900">化粧品・スキンケア</h3>
                <p className="text-xs text-gray-500">肌に触れるものだから、成分や使用期限が大切</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "全成分リスト", required: true },
                    { label: "内容量", required: true },
                    { label: "どんな肌向けか", required: false },
                    { label: "製造販売の許可番号", required: true },
                    { label: "どこで作られたか", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "使用期限", required: true },
                    { label: "作った日", required: false },
                    { label: "製造番号", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 家電 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📱</span>
              <div>
                <h3 className="font-bold text-gray-900">家電・ガジェット</h3>
                <p className="text-xs text-gray-500">安全マークや保証が必要。賞味期限は不要</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "電圧（ボルト）", required: true },
                    { label: "消費電力（ワット）", required: false },
                    { label: "安全マーク（PSE）", required: true },
                    { label: "無線の認証マーク（技適）", required: false },
                    { label: "保証期間", required: true },
                    { label: "どこで作られたか", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "シリアル番号の範囲", required: false },
                    { label: "製造日", required: true },
                    { label: "ソフトウェアのバージョン", required: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* アパレル */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👕</span>
              <div>
                <h3 className="font-bold text-gray-900">洋服・ファッション</h3>
                <p className="text-xs text-gray-500">サイズや素材、洗い方の情報が必要。賞味期限は不要</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "素材（綿100%など）", required: true },
                    { label: "サイズ展開（S/M/Lなど）", required: true },
                    { label: "カラー展開", required: true },
                    { label: "洗い方・お手入れ方法", required: true },
                    { label: "どこで作られたか", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "シーズン（春夏/秋冬）", required: false },
                    { label: "サイズ", required: true },
                    { label: "カラー", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* サービス - ハイライト */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💻</span>
              <div>
                <h3 className="font-bold text-gray-900">サービス・オンライン商品</h3>
                <p className="text-xs text-emerald-700 font-bold">賞味期限・重さ・サイズなど物理的な項目はすべて不要！</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "どこで使えるか（エリア）", required: false },
                    { label: "利用ルール", required: true },
                    { label: "キャンセルのルール", required: true },
                    { label: "届け方（オンライン/対面/ダウンロード）", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-emerald-100 text-emerald-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "使える期間（開始日）", required: false },
                    { label: "使える期間（終了日）", required: false },
                    { label: "使える回数", required: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">任意</span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white rounded-lg border border-emerald-200 p-3">
                  <p className="text-xs text-emerald-700 font-bold">不要になる項目</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {["賞味期限", "重さ", "サイズ", "保存方法", "原産国", "原材料"].map((item) => (
                      <span key={item} className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded line-through">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 医薬品 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💊</span>
              <div>
                <h3 className="font-bold text-gray-900">薬・医療機器</h3>
                <p className="text-xs text-gray-500">法律で決められた情報が多く、厳格な管理が必要</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "国の承認番号", required: true },
                    { label: "薬の分類（第1類〜第3類など）", required: true },
                    { label: "有効成分", required: true },
                    { label: "飲み方・使い方", required: true },
                    { label: "副作用の注意点", required: true },
                    { label: "保管の仕方", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold">必須</span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "使用期限", required: true },
                    { label: "作った日", required: true },
                    { label: "ロット番号", required: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold">必須</span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 工業製品 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔧</span>
              <div>
                <h3 className="font-bold text-gray-900">工業製品・部品</h3>
                <p className="text-xs text-gray-500">品質規格や検査データが重要。賞味期限は不要</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">商品に必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "対応する規格（JIS/ISOなど）", required: false },
                    { label: "許容される誤差", required: false },
                    { label: "材質のグレード", required: true },
                    { label: "取得している認証", required: false },
                    { label: "仕様書のリンク", required: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">在庫ごとに必要な情報</p>
                <div className="space-y-1.5">
                  {[
                    { label: "製造日", required: true },
                    { label: "検査した日", required: false },
                    { label: "検査の結果", required: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${f.required ? "bg-red-100 text-red-600 font-bold" : "bg-gray-100 text-gray-500"}`}>
                        {f.required ? "必須" : "任意"}
                      </span>
                      <span className="text-gray-900">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* まとめ比較 */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-bold text-gray-900 text-sm text-center">カテゴリー別：必要な項目の違い</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">項目</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">🍱 食品</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">💄 化粧品</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">📱 家電</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">👕 洋服</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">💻 サービス</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">💊 薬</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">🔧 部品</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "賞味期限・使用期限", values: ["◎", "◎", "−", "−", "−", "◎", "−"] },
                  { label: "アレルギー・成分", values: ["◎", "◎", "−", "−", "−", "◎", "−"] },
                  { label: "サイズ・カラー", values: ["−", "−", "−", "◎", "−", "−", "−"] },
                  { label: "安全マーク・認証", values: ["−", "○", "◎", "−", "−", "◎", "○"] },
                  { label: "保証期間", values: ["−", "−", "◎", "−", "−", "−", "−"] },
                  { label: "保存方法・温度帯", values: ["◎", "−", "−", "−", "−", "◎", "−"] },
                  { label: "利用ルール・キャンセル", values: ["−", "−", "−", "−", "◎", "−", "−"] },
                  { label: "検査データ", values: ["○", "−", "−", "−", "−", "○", "◎"] },
                ].map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`text-center px-3 py-2 ${v === "◎" ? "text-red-500 font-bold" : v === "○" ? "text-blue-500" : "text-gray-300"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
            ◎ 必須 ／ ○ あると便利 ／ − 不要
          </div>
        </div>

        {/* カテゴリー別の手数料率 */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h3 className="font-bold text-white text-sm text-center">カテゴリー別の手数料（成果報酬）</h3>
            <p className="text-indigo-200 text-xs text-center mt-1">売れた時だけ発生。カテゴリーごとに最適な料率を設定</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">カテゴリー</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">手数料</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">うち紹介者</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-500">うちプラットフォーム</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-500">料率の理由</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "🍱 食品・飲料", rate: "12%", referral: "2%", platform: "10%", reason: "在庫回転が早く取引頻度が高い" },
                  { cat: "💄 化粧品・スキンケア", rate: "15%", referral: "3%", platform: "12%", reason: "単価が高く、リピート率も高い" },
                  { cat: "📱 家電・ガジェット", rate: "8%", referral: "1.5%", platform: "6.5%", reason: "単価が高いため低い料率でも成立" },
                  { cat: "👕 洋服・ファッション", rate: "15%", referral: "3%", platform: "12%", reason: "クリエイター拡散効果が高い分野" },
                  { cat: "💻 サービス・オンライン", rate: "20%", referral: "4%", platform: "16%", reason: "原価ほぼゼロ、高い利益率" },
                  { cat: "💊 薬・医療機器", rate: "10%", referral: "2%", platform: "8%", reason: "規制が多く慎重な運用が必要" },
                  { cat: "🔧 工業製品・部品", rate: "6%", referral: "1%", platform: "5%", reason: "大口取引・高単価のため低料率" },
                ].map((row) => (
                  <tr key={row.cat} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.cat}</td>
                    <td className="text-center px-3 py-3 font-bold text-indigo-600">{row.rate}</td>
                    <td className="text-center px-3 py-3 text-amber-600">{row.referral}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{row.platform}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
            手数料は商品が売れた時にのみ発生（成果報酬型）。初期費用・月額費用はすべて0円。紹介者ポイントは全商品の購入に利用可能。
          </div>
        </div>
      </section>

      {/* カテゴリー別システム紹介 */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <p className="text-sm font-medium text-indigo-600 tracking-wider mb-3 text-center">
          CATEGORY × BUSINESS TYPE
        </p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          取扱商品・取引形態に合わせた紹介ページ
        </h2>
        <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
          対象となる商品カテゴリーと取引形態（BtoB / BtoC）によって、必要な機能・証明項目・帳票が異なります。
          あなたのビジネスに最も近いページをご覧ください。
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/flow/general-btob" className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🏭</div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">一般商材 BtoB</h3>
                <p className="text-xs text-gray-500">企業間取引</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">家電・アパレル・工業製品の卸売。SKU管理・見積書・請求書・共同購入。</p>
          </Link>
          <Link href="/flow/general-btoc" className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-emerald-400 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">🛒</div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition">一般商材 BtoC</h3>
                <p className="text-xs text-gray-500">個人消費者向け</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">クリエイターLPでSNS拡散。領収書・返品対応・レビュー・おすすめ機能。</p>
          </Link>
          <Link href="/flow/health-btob" className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-rose-400 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-xl">🧪</div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition">健康食品・化粧品 BtoB</h3>
                <p className="text-xs text-gray-500">企業間取引</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">成分管理・賞味期限・温度管理・法定表示義務対応。L1〜L3必須。</p>
          </Link>
          <Link href="/flow/health-btoc" className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">💊</div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition">健康食品・化粧品 BtoC</h3>
                <p className="text-xs text-gray-500">個人消費者向け</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">美容クリエイターLP・成分検索・肌質別レビュー。消費者の安全が最優先。</p>
          </Link>
        </div>
      </section>

      {/* 機能一覧 */}
      <section id="features" className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          主な機能
        </h2>
        <p className="text-gray-500 text-sm text-center mb-10">
          メーカー・販売代理店・バイヤーが利用できるプラットフォーム機能
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard icon="📦" title="商品・在庫管理" description="商品登録、ロット管理、在庫のリアルタイム追跡" />
          <FeatureCard icon="🔐" title="プルーフチェーン" description="5層の信頼性証明で商品の品質を保証" />
          <FeatureCard icon="🤖" title="購入エージェント" description="バイヤーの自動検索＆5因子スコアリング" />
          <FeatureCard icon="💳" title="Stripe決済" description="クレジットカード決済をワンクリックで" />
          <FeatureCard icon="🎨" title="LP作成ツール" description="ブロックエディタでカスタムLPを構築" />
          <FeatureCard icon="📊" title="アフィリエイト" description="コード追跡で成果報酬を自動計算" />
          <FeatureCard icon="📝" title="帳票管理（BtoB/BtoC両対応）" description="BtoB: 見積書・請求書・納品書 / BtoC: 領収書・購入明細・返品伝票。インボイス番号を自動反映" />
          <FeatureCard icon="💬" title="グループウェア" description="メッセージ・タスク・ファイル共有" />
          <FeatureCard icon="🏷️" title="オークション" description="箱単位から入札可能な競り・自動入札機能" />
          <FeatureCard icon="📈" title="ランキング" description="パートナー・商品のスコアランキング" />
          <FeatureCard icon="🔌" title="埋め込みウィジェット" description="外部サイトにiframeで商品表示" />
          <FeatureCard icon="📋" title="アンケート" description="バイヤー向けのサーベイ作成・集計" />
          <FeatureCard icon="🏷️" title="カテゴリー別入力" description="食品・家電・サービスなど商品に合った項目だけを表示" />
          <FeatureCard icon="📣" title="キャンペーン管理" description="在庫単位で取引先別の割引・限定セールを作成" />
          <FeatureCard icon="📧" title="メール配信" description="新商品やキャンペーン情報をバイヤーに一斉通知" />
          <FeatureCard icon="🔔" title="再入荷通知" description="売り切れ商品の再入荷をバイヤーに自動でお知らせ" />
          <FeatureCard icon="🎯" title="おすすめ商品" description="購入履歴や閲覧傾向からバイヤーに最適な商品を提案" />
          <FeatureCard icon="📉" title="売上レポート" description="商品別・期間別の売上分析とCSVエクスポート" />
          <FeatureCard icon="🏅" title="レビュー・評価" description="バイヤーからの商品レビューで信頼度をアップ" />
          <FeatureCard icon="🔗" title="SNS連携" description="商品ページをSNSでワンクリック共有、OGP自動生成" />
          <FeatureCard icon="📊" title="気配値ボード" description="同じ商品の売り手別・ロット別の価格を一覧表示。最安値や条件の違いが一目でわかる" />
          <FeatureCard icon="🔔" title="価格アラート" description="狙っている商品が希望価格以下になったら自動で通知。買い時を逃さない" />
          <FeatureCard icon="🤝" title="共同購入（入札集約）" description="複数バイヤーの入札をまとめて大口注文に。数量が集まるほど有利な価格を引き出せる" />
          <FeatureCard icon="📈" title="価格推移グラフ" description="商品の過去の取引価格をグラフで表示。相場感をつかんで最適なタイミングで購入" />
          <FeatureCard icon="🔄" title="再出品・転売" description="購入した商品を所有権履歴（L4）付きで再出品。正規ルートが証明された状態で売れる" />
          <FeatureCard icon="⚡" title="即決・入札の選択" description="売り手は即決価格とオークション形式を併用可能。買い手は入札で安く買うチャンスも" />
          <FeatureCard icon="🧮" title="利益シミュレーター" description="仕入れ価格・販売価格・手数料から利益を自動計算。仕入れ判断をサポート" />
          <FeatureCard icon="🌐" title="クロス出品比較" description="同じ商品が複数の売り手から出品されている場合、条件（価格・期限・証明レベル）を横並び比較" />
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
