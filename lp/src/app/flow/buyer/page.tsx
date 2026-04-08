import type { Metadata } from "next";
import Link from "next/link";
import { BuyerScreenGallery } from "@/components/flow/FlowScreenGallery";

export const metadata: Metadata = {
  title: "バイヤー業務フロー | 購入エージェントガイド",
  description:
    "Cross Infinityマーケットプレイスにおけるバイヤーの業務フローを解説。購入エージェントによる自動検索・スコアリングから購入までの流れ。",
};

type Step = {
  number: string;
  title: string;
  description: string;
  details: string[];
};

const buyerSteps: Step[] = [
  {
    number: "01",
    title: "アカウント登録",
    description: "バイヤーとしてアカウントを作成し、調達条件の基本設定を行います。",
    details: [
      "メールアドレスでサインアップ",
      "企業情報・担当者情報の入力",
      "調達カテゴリ・予算帯の初期設定",
    ],
  },
  {
    number: "02",
    title: "購入エージェント作成",
    description: "自動検索ボットを作成し、詳細な条件を設定してベストな商品を自動で見つけます。",
    details: [
      "キーワード・カテゴリ・価格帯・原産国のハードフィルタ設定",
      "認証条件：認証済みパートナー限定・有効期限内チェック",
      "プルーフ必須レイヤー指定（L1〜L5の各層を個別に要求可能）",
      "成分条件：カテキン含有量≥80%、残留農薬=不検出など数値・文字列で指定",
      "スペック条件：原産地・製造方法・JAN CODE有無などを必須/優先で設定",
      "スコアリング重み（認証/プルーフ/タグ/スペック/価格）の調整",
    ],
  },
  {
    number: "03",
    title: "エージェント実行・結果確認",
    description: "エージェントが5因子スコアリングで商品を自動評価し、認証・成分の詳細まで確認できます。",
    details: [
      "認証詳細：認証ステータス・有効期限・各プルーフ層の確認状況を一覧表示",
      "成分・スペック詳細：指定条件ごとの適合結果を✓/✗で表示",
      "商品スペック：品番・カートン入数・サイズ・重量を確認",
      "成分表PDF：メーカー提出の成分規格書をその場で閲覧",
      "総合スコアでランキング → 最低点以下は除外",
      "結果から直接問い合わせを作成",
    ],
  },
  {
    number: "04",
    title: "問い合わせ・商談",
    description: "気になった商品のメーカー/販売代理店に問い合わせを送り、条件交渉を行います。",
    details: [
      "エージェント結果から直接問い合わせを作成",
      "希望価格・数量・備考を添えて送信",
      "メーカー/販売代理店からの回答を待つ（承諾/辞退）",
      "見積書の確認・条件の再調整",
    ],
  },
  {
    number: "05",
    title: "購入・決済",
    description: "商談がまとまったら、Stripe経由で安全に決済を完了します。",
    details: [
      "通常購入：箱単位で数量を指定して即時購入",
      "オークション入札：希望額を提示して競り",
      "自動入札：上限額を設定して自動入札を有効化",
      "Stripe Checkoutで安全なカード決済",
    ],
  },
  {
    number: "06",
    title: "納品・履歴管理",
    description: "注文の進捗を追跡し、過去の購入履歴を管理します。",
    details: [
      "配送追跡番号で出荷状況を確認",
      "配送証明（L5プルーフ）で到着を検証",
      "注文履歴・自動入札ログの一覧確認",
      "リピート購入やエージェント条件の改善",
    ],
  },
];

const scoringFactors = [
  {
    name: "認証スコア",
    weight: 80,
    icon: "🏅",
    desc: "パートナーの認証状態を評価。認証済み=100pt、未認証=30pt、期限切れ=10pt",
    color: "#2563eb",
  },
  {
    name: "プルーフスコア",
    weight: 60,
    icon: "🔐",
    desc: "5層プルーフチェーンの登録状況。事業者30% + 商品40% + 在庫30%で算出",
    color: "#7c3aed",
  },
  {
    name: "タグ一致",
    weight: 50,
    icon: "🏷️",
    desc: "指定したタグ条件との一致率。完全一致で100pt",
    color: "#059669",
  },
  {
    name: "スペック一致",
    weight: 40,
    icon: "📋",
    desc: "成分・原材料・製造方法など仕様条件との適合度",
    color: "#d97706",
  },
  {
    name: "価格スコア",
    weight: 30,
    icon: "💰",
    desc: "設定した予算範囲内での価格位置。範囲内中央が最高スコア",
    color: "#dc2626",
  },
];

function StepCard({ step, gallery }: { step: Step; gallery?: React.ReactNode }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-emerald-600">
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
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
              {d}
            </li>
          ))}
        </ul>
        {gallery}
      </div>
    </div>
  );
}

export default function BuyerFlowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">Cross Infinity</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">メーカー・販売代理店</Link>
            <a href="#steps" className="text-gray-600 hover:text-gray-900">業務フロー</a>
            <a href="#scoring" className="text-gray-600 hover:text-gray-900">スコアリング</a>
            <Link href="/flow/creator" className="text-gray-600 hover:text-gray-900">クリエイター</Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-emerald-300 tracking-wider mb-3">BUYER FLOW GUIDE</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            バイヤー向け<br />業務フローガイド
          </h1>
          <p className="text-emerald-200/80 max-w-2xl mx-auto leading-relaxed">
            購入エージェントを活用した自動検索・スコアリングから、
            問い合わせ・商談・購入までの一連の調達フローを解説します。
          </p>
        </div>
      </section>

      {/* メーカーの参入意義 */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 mb-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 shadow-lg text-white">
          <h3 className="text-center text-lg font-bold mb-2">メーカーはなぜこのプラットフォームで売りやすくなるのか？</h3>
          <p className="text-blue-200 text-sm text-center mb-6">従来の営業・ECでは難しかった「売れる仕組み」が自動で動きます</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🤖", title: "購買エージェントが商品を自動で見つける",
                desc: "バイヤーが設定したAIが、条件に合う商品を24時間自動検索。メーカーは営業しなくても、証明を揃えておけば購買エージェントに発見してもらえます。",
              },
              {
                icon: "📊", title: "気配値ボードで常にバイヤーの目に触れる",
                desc: "出品するだけで価格一覧ボードに掲載。同じ商品の中で価格・品質・証明の条件が良ければ、自然とバイヤーから選ばれます。",
              },
              {
                icon: "🎨", title: "クリエイターが勝手にLPを作って売ってくれる",
                desc: "販売許可を出すだけで、クリエイターが動画やSNSでLPを作成・拡散。自社では届かなかった消費者層にリーチできます。",
              },
              {
                icon: "🤝", title: "共同購入で大口注文が自動で集まる",
                desc: "小口バイヤーの入札が集約されて大口注文に。「1社では少量」だった取引が、プラットフォーム上では大口案件に育ちます。",
              },
              {
                icon: "🔐", title: "プルーフチェーンが営業の代わりをする",
                desc: "「安全？」「本物？」の説明をプルーフが自動で証明。商談コストが大幅に下がり、信頼構築に時間をかけなくて済みます。",
              },
              {
                icon: "💰", title: "成果報酬型だから赤字リスクがない",
                desc: "初期費用ゼロ・月額ゼロ。売れた時だけ手数料が発生するので、売れなくても損しない。出品しておくだけで商機が生まれます。",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-blue-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-xs text-center mt-6">
            従来のECでは「出品して待つだけ」でしたが、このプラットフォームでは購買AI・販売AI・クリエイター・共同購入の4つの力が自動で売上を作ります。
          </p>
        </div>
      </section>

      {/* 概要カード */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-center text-lg font-bold text-gray-900 mb-6">バイヤーの全体像</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { step: "条件設定", icon: "⚙️", desc: "検索条件を設定" },
              { step: "自動検索", icon: "🤖", desc: "エージェントが探索" },
              { step: "スコアリング", icon: "📊", desc: "5因子で自動評価" },
              { step: "問い合わせ", icon: "💬", desc: "商談・見積り" },
              { step: "購入", icon: "💳", desc: "Stripe決済" },
              { step: "納品", icon: "📦", desc: "配送・検証" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-1.5">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-900">{item.step}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
                {i < 5 && (
                  <span className="text-gray-300 text-lg hidden md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section id="steps" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            STEP BY STEP
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">バイヤーの業務フロー</h2>
          <p className="text-gray-500 text-sm">登録から納品までの6ステップ</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {buyerSteps.map((step) => (
            <StepCard key={step.number} step={step} gallery={<BuyerScreenGallery stepNumber={step.number} />} />
          ))}
        </div>
      </section>

      {/* スコアリング詳細 */}
      <section id="scoring" className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-emerald-400 tracking-wider mb-3 text-center">
            SCORING SYSTEM
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">5因子スコアリング</h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            購入エージェントが商品を自動評価する5つの評価軸と重み付け
          </p>

          <div className="space-y-4 max-w-2xl mx-auto">
            {scoringFactors.map((factor) => (
              <div key={factor.name} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{factor.icon}</span>
                  <h4 className="font-bold text-sm flex-1">{factor.name}</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: factor.color, opacity: 0.9 }}>
                    重み: {factor.weight}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{factor.desc}</p>
                {/* 重みバー */}
                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${factor.weight}%`, background: factor.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-2xl mx-auto">
            <h4 className="font-bold text-sm mb-2">総合スコアの算出方法</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-mono">
              総合スコア = (認証 x 80 + プルーフ x 60 + タグ x 50 + スペック x 40 + 価格 x 30) / (80 + 60 + 50 + 40 + 30)
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ※ 最低総合スコアを設定すると、基準以下の商品は結果から除外されます
            </p>
          </div>
        </div>
      </section>

      {/* 購入方法の比較 */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">購入方法</h2>
        <p className="text-gray-500 text-sm text-center mb-10">3つの購入方法から状況に応じて選択できます</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-bold text-gray-900 mb-2">通常購入</h3>
            <p className="text-sm text-gray-500 mb-4">箱単位で数量を指定して即時購入。1箱からでも購入できます。</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>- 固定価格で即時購入</li>
              <li>- Stripe Checkoutで安全決済</li>
              <li>- 最もシンプルな購入方法</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🔨</div>
            <h3 className="font-bold text-gray-900 mb-2">オークション入札</h3>
            <p className="text-sm text-gray-500 mb-4">希望額を提示して競り。最高額入札者が落札します。</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>- 手動で入札額を指定</li>
              <li>- リアルタイムの競り状況確認</li>
              <li>- 予算に応じた柔軟な価格交渉</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-gray-900 mb-2">自動入札</h3>
            <p className="text-sm text-gray-500 mb-4">上限額を設定してエージェントが自動で入札します。</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>- 上限額を設定するだけ</li>
              <li>- システムが自動で最適入札</li>
              <li>- 入札ログで全履歴を確認</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 販売エージェント vs 購買エージェント */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-emerald-400 tracking-wider mb-3 text-center">
            DUAL AGENT SYSTEM
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            2つのAIエージェントが取引を加速する
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-2xl mx-auto">
            売り手には「販売エージェント」、買い手には「購買エージェント」。
            それぞれの立場に最適化されたAIが、最良の取引を自動で見つけ出します。
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 販売エージェント */}
            <div className="bg-blue-950/50 border border-blue-800/50 rounded-2xl overflow-hidden">
              <div className="bg-blue-900/50 px-6 py-4 border-b border-blue-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h3 className="font-bold text-blue-300 text-lg">販売エージェント</h3>
                    <p className="text-xs text-blue-400">メーカー・販売代理店・クリエイター向け</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300">
                  「自分の商品を、最も高い価格で、最も多く売りたい」を実現するAI
                </p>
                <div className="space-y-3">
                  {[
                    { icon: "📊", title: "気配値の自動設定", desc: "市場相場・競合価格・在庫状況から最適な出品価格を提案" },
                    { icon: "🔔", title: "入札通知・自動応答", desc: "バイヤーからの入札をリアルタイム通知。条件に合えば自動で承諾" },
                    { icon: "🎯", title: "ターゲットバイヤー検知", desc: "過去の購入履歴やエージェント条件から、自社商品に興味がありそうなバイヤーを検知" },
                    { icon: "📉", title: "在庫回転の最適化", desc: "賞味期限が近いロットは自動で値下げ提案。売れ残りリスクを最小化" },
                    { icon: "💰", title: "価格戦略シミュレーション", desc: "「この価格なら何個売れるか」をAIが予測。利益最大化の価格帯を提案" },
                    { icon: "📣", title: "キャンペーン自動提案", desc: "売れ行きが鈍い商品に対して、割引企画やまとめ買いプランを自動提案" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-blue-300">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 購買エージェント */}
            <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-2xl overflow-hidden">
              <div className="bg-emerald-900/50 px-6 py-4 border-b border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h3 className="font-bold text-emerald-300 text-lg">購買エージェント</h3>
                    <p className="text-xs text-emerald-400">バイヤー向け</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300">
                  「最も信頼できる商品を、最も安い価格で、確実に手に入れたい」を実現するAI
                </p>
                <div className="space-y-3">
                  {[
                    { icon: "🔍", title: "自動検索・スコアリング", desc: "5因子（認証・プルーフ・タグ・スペック・価格）で商品を自動評価" },
                    { icon: "📊", title: "クロス出品比較", desc: "同じ商品が複数の売り手から出ている場合、価格・期限・証明レベルを横並び比較" },
                    { icon: "💰", title: "価格アラート", desc: "狙っている商品が希望価格以下になったら自動で通知。最安値を逃さない" },
                    { icon: "🤝", title: "共同購入の自動マッチング", desc: "同じ商品を狙っている他のバイヤーと入札を集約。大口価格を自動で引き出す" },
                    { icon: "📈", title: "価格推移の分析", desc: "過去の取引価格をグラフ化。「今が買い時か」をAIが判定" },
                    { icon: "🔄", title: "自動入札＆リバランス", desc: "上限額内で最適な入札を自動実行。落札できなければ次の候補に自動切り替え" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-emerald-300">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* エージェント同士の取引 */}
          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-center mb-4">エージェント同士が取引を自動マッチング</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-blue-900/50 border border-blue-700 rounded-xl flex items-center justify-center text-3xl mb-2">🤖</div>
                <p className="text-xs font-bold text-blue-300">販売エージェント</p>
                <p className="text-[10px] text-gray-500">「¥1,000以上で売りたい」</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">条件が合えば</div>
                <div className="flex items-center gap-1">
                  <div className="h-0.5 w-8 bg-amber-500" />
                  <span className="text-amber-400 text-sm">⚡</span>
                  <div className="h-0.5 w-8 bg-amber-500" />
                </div>
                <div className="text-xs font-bold text-amber-400">自動で取引成立</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-900/50 border border-emerald-700 rounded-xl flex items-center justify-center text-3xl mb-2">🤖</div>
                <p className="text-xs font-bold text-emerald-300">購買エージェント</p>
                <p className="text-[10px] text-gray-500">「¥1,200以下で買いたい」</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs text-center mt-4">
              売り手と買い手の条件が一致すると、AIエージェント同士が自動で取引を成立させます。
              <br />
              24時間365日、人手を介さずに最適な取引が生まれ続けます。
            </p>
          </div>
        </div>
      </section>

      {/* 価格比較・入札ツール */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">取引を有利にするツール</h2>
        <p className="text-gray-500 text-sm text-center mb-10">バイヤーの調達コストを下げ、最適な仕入れを支援する機能</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "📊", title: "気配値ボード",
              desc: "同じ商品の売り手別・ロット別の価格を一覧で見られます。最安値、賞味期限、証明レベルの違いが一目でわかるので、条件に合った最適なロットを選べます。",
            },
            {
              icon: "📈", title: "価格推移グラフ",
              desc: "過去の取引価格をグラフで表示。季節変動や需給バランスを把握して、今が買い時かどうかを判断できます。",
            },
            {
              icon: "🔔", title: "価格アラート",
              desc: "狙っている商品に目標価格を設定。その価格以下で出品されたら即座にメールやアプリで通知。買い時を逃しません。",
            },
            {
              icon: "🤝", title: "共同購入（入札集約）",
              desc: "同じ商品を買いたい複数のバイヤーの入札をまとめて大口注文に変換。数量が集まるほど有利な単価を引き出せます。",
            },
            {
              icon: "🧮", title: "利益シミュレーター",
              desc: "仕入れ価格・想定販売価格・手数料・送料を入力すると、利益をリアルタイムで計算。仕入れ判断を数字で裏付け。",
            },
            {
              icon: "🌐", title: "クロス出品比較",
              desc: "同一商品が複数売り手から出品されている場合、価格・賞味期限・プルーフレベル・配送条件を横並びで比較。最良の条件を素早く見つけます。",
            },
          ].map((tool) => (
            <div key={tool.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* プラットフォーム参加状況 */}
      <section className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-amber-400 tracking-wider mb-3 text-center">
            PLATFORM STATS
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            プラットフォームの参加状況
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-2xl mx-auto">
            オークション・共同購入に参加するバイヤーがどの程度いるのか。
            プラットフォームの利用状況をリアルタイムで確認できます。
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "登録ユーザー数", value: "リアルタイム表示", desc: "プラットフォームに登録済みの全ユーザー数", icon: "👥", color: "from-blue-600 to-blue-500" },
              { label: "現在のログイン数", value: "リアルタイム表示", desc: "今この瞬間にログインしているアクティブユーザー数", icon: "🟢", color: "from-green-600 to-green-500" },
              { label: "オークション参加者", value: "リアルタイム表示", desc: "現在進行中のオークションに入札しているユーザー数", icon: "🔨", color: "from-amber-600 to-amber-500" },
              { label: "出品メーカー数", value: "リアルタイム表示", desc: "商品を出品しているメーカー・販売代理店の数", icon: "🏭", color: "from-purple-600 to-purple-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <div className={`inline-block bg-gradient-to-r ${stat.color} text-white text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                  {stat.value}
                </div>
                <p className="text-[10px] text-gray-500">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-4 text-center">オークション・入札の活況指標</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">進行中のオークション数</p>
                <p className="text-lg font-bold text-amber-400">リアルタイム</p>
                <p className="text-[10px] text-gray-500 mt-1">箱単位のオークション件数</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">本日の入札件数</p>
                <p className="text-lg font-bold text-green-400">リアルタイム</p>
                <p className="text-[10px] text-gray-500 mt-1">今日行われた全入札の合計</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">共同購入グループ</p>
                <p className="text-lg font-bold text-blue-400">リアルタイム</p>
                <p className="text-[10px] text-gray-500 mt-1">現在募集中の共同購入グループ数</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-4">
              ※ これらの数値はプラットフォーム上でリアルタイムに更新されます。ダッシュボードから随時確認できます。
            </p>
          </div>

          <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <h4 className="font-bold text-amber-300 text-sm mb-2">なぜ参加状況が重要なのか？</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-amber-200/80">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">-</span>
                <p><span className="font-bold">オークション参加者が多い</span> = 競争が活発 → 売り手にとって有利な価格が付きやすい</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">-</span>
                <p><span className="font-bold">共同購入の参加者が多い</span> = まとまった数量が集まりやすい → 大口割引の交渉力UP</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">-</span>
                <p><span className="font-bold">ログインユーザーが多い時間帯</span> = 出品のタイミング判断に活用</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">-</span>
                <p><span className="font-bold">登録メーカー数の増加</span> = 選べる商品の幅が広がっている証拠</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 他のフローへのリンク */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold mb-3">他のフローガイドも確認する</h2>
          <p className="text-emerald-100 text-sm mb-8">各ロールの業務フローを詳しく解説しています。</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/flow" className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-lg hover:bg-emerald-50 text-sm transition">
              メーカー・販売代理店フロー
            </Link>
            <Link href="/flow/creator" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              クリエイターフロー
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
