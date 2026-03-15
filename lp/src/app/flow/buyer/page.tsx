import type { Metadata } from "next";
import Link from "next/link";
import { BuyerScreenGallery } from "@/components/flow/FlowScreenGallery";

export const metadata: Metadata = {
  title: "バイヤー業務フロー | 購入エージェントガイド",
  description:
    "単品決済ロットLPマーケットプレイスにおけるバイヤーの業務フローを解説。購入エージェントによる自動検索・スコアリングから購入までの流れ。",
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
    description: "気になった商品のメーカー/代理店に問い合わせを送り、条件交渉を行います。",
    details: [
      "エージェント結果から直接問い合わせを作成",
      "希望価格・数量・備考を添えて送信",
      "メーカー/代理店からの回答を待つ（承諾/辞退）",
      "見積書の確認・条件の再調整",
    ],
  },
  {
    number: "05",
    title: "購入・決済",
    description: "商談がまとまったら、Stripe経由で安全に決済を完了します。",
    details: [
      "通常購入：ロット単位での即時購入",
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
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">メーカー・代理店</Link>
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
            <p className="text-sm text-gray-500 mb-4">ロット単位で即時購入。表示価格でそのまま決済できます。</p>
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

      {/* 他のフローへのリンク */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold mb-3">他のフローガイドも確認する</h2>
          <p className="text-emerald-100 text-sm mb-8">各ロールの業務フローを詳しく解説しています。</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/flow" className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-lg hover:bg-emerald-50 text-sm transition">
              メーカー・代理店フロー
            </Link>
            <Link href="/flow/creator" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              クリエイターフロー
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
