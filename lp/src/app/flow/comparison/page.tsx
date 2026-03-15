import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EC販売との違い | 単品決済ロットLP vs 従来のEC",
  description:
    "単品決済ロットLPマーケットプレイスと従来のEC販売の違いを分かりやすく比較。初期費用0円・成果報酬型の料金体系で始められます。",
};

type ComparisonRow = {
  label: string;
  traditional: string;
  ours: string;
  highlight?: boolean;
};

const comparisonRows: ComparisonRow[] = [
  {
    label: "初期費用",
    traditional: "数十万〜数百万円（サイト構築・システム導入）",
    ours: "0円（完全無料）",
    highlight: true,
  },
  {
    label: "月額費用",
    traditional: "月額数万〜数十万円（サーバー・保守・決済手数料）",
    ours: "0円（基本無料）",
    highlight: true,
  },
  {
    label: "料金体系",
    traditional: "固定費 + 売上手数料（二重コスト）",
    ours: "成果報酬型のみ（売れた時だけ）",
    highlight: true,
  },
  {
    label: "販売単位",
    traditional: "1個単位の小売販売が中心",
    ours: "ロット（まとまり）単位の卸売・BtoB取引",
  },
  {
    label: "取引形態",
    traditional: "BtoC中心（消費者向け）",
    ours: "BtoB中心（メーカー↔バイヤー）+ クリエイター経由のBtoC",
  },
  {
    label: "商品の信頼性",
    traditional: "出品者の自己申告・レビュー頼み",
    ours: "5層プルーフチェーンで客観的に証明",
  },
  {
    label: "商品検索",
    traditional: "キーワード検索・カテゴリ絞り込み",
    ours: "AIエージェントが5因子スコアリングで自動マッチング",
  },
  {
    label: "集客・販促",
    traditional: "自社で広告運用（費用がかかる）",
    ours: "クリエイターが画像・動画付きLPで集客（成果報酬で連携）",
  },
  {
    label: "LP作成",
    traditional: "外部ツール or 制作会社に依頼（数万〜数十万円）",
    ours: "ブロックエディタで画像・動画を自由に配置（無料）",
  },
  {
    label: "決済",
    traditional: "ECカート + 決済代行（審査・導入に時間がかかる）",
    ours: "Stripe連携でワンクリック決済（即日利用可能）",
  },
  {
    label: "帳票管理",
    traditional: "別途会計ソフトや手作業",
    ours: "見積書・請求書・納品書をプラットフォーム内で完結",
  },
  {
    label: "在庫管理",
    traditional: "自社システム or 手動管理",
    ours: "ロット管理 + WMS/IoT連携 + リアルタイム追跡",
  },
  {
    label: "アフィリエイト",
    traditional: "ASP（A8等）に別途登録・管理",
    ours: "プラットフォーム内蔵のアフィリエイト機能",
  },
  {
    label: "オークション",
    traditional: "非対応（固定価格のみ）",
    ours: "ロット単位のオークション・自動入札",
  },
];

const pricingPoints = [
  {
    icon: "💰",
    title: "初期費用 0円",
    desc: "サイト構築費・システム導入費は一切不要。アカウント登録だけで即日開始できます。",
  },
  {
    icon: "📊",
    title: "月額費用 0円",
    desc: "サーバー費・保守費・基本利用料はすべて無料。固定費ゼロでリスクなく始められます。",
  },
  {
    icon: "🎯",
    title: "成果報酬型",
    desc: "商品が売れた時だけ手数料が発生。売上がなければコストもゼロ。あなたのビジネスに寄り添う料金体系です。",
  },
];

const advantages = [
  {
    icon: "🔐",
    title: "プルーフチェーンで信頼を可視化",
    desc: "従来のECではレビューに頼るしかなかった商品の信頼性を、事業者証明・商品証明・在庫証明・所有権履歴・配送証明の5層で客観的に証明します。",
  },
  {
    icon: "🤖",
    title: "AIエージェントが最適商品を発見",
    desc: "従来の検索はキーワード頼み。単品決済ロットLPでは、認証・プルーフ・タグ・スペック・価格の5因子でAIが自動スコアリングし、バイヤーに最適な商品を提案します。",
  },
  {
    icon: "🎨",
    title: "クリエイターエコノミーで集客",
    desc: "広告費をかけずに、インフルエンサーや映像クリエイターが画像・動画付きLPを作成。成果報酬型なので、メーカーもクリエイターもリスクなく連携できます。",
  },
  {
    icon: "📦",
    title: "ロット単位のBtoB取引に最適化",
    desc: "1個単位の小売ではなく、まとまったロットでの取引を前提に設計。カートン入数・最小注文数量・成分表など、BtoBに必要な情報を標準搭載しています。",
  },
  {
    icon: "📝",
    title: "帳票・決済をワンストップで",
    desc: "見積書・請求書・納品書の作成からStripe決済まで、すべてプラットフォーム内で完結。別途の会計ソフトや決済サービスの契約は不要です。",
  },
  {
    icon: "🏷️",
    title: "オークション・自動入札",
    desc: "従来のECにはない、ロット単位のオークション機能。自動入札で手間なく最適価格での取引を実現します。",
  },
];

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">業務フロー</Link>
            <a href="#comparison" className="text-gray-600 hover:text-gray-900">比較表</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">料金</a>
            <a href="#advantages" className="text-gray-600 hover:text-gray-900">優位性</a>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-indigo-300 tracking-wider mb-3">COMPARISON GUIDE</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            従来のEC販売と<br />何が違うのか？
          </h1>
          <p className="text-indigo-200/80 max-w-2xl mx-auto leading-relaxed mb-6">
            単品決済ロットLPは、従来のECとはまったく異なるアプローチで
            BtoB取引を革新します。初期費用0円・成果報酬型で、
            リスクなく始められるマーケットプレイスです。
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-6 py-3">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-bold">初期費用 0円 ・ 月額 0円 ・ 成果報酬型</span>
          </div>
        </div>
      </section>

      {/* 料金の強調 */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-center text-lg font-bold text-gray-900 mb-2">料金体系</h3>
          <p className="text-center text-sm text-gray-500 mb-8">固定費ゼロ。売れた時だけ手数料が発生するシンプルな成果報酬型</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPoints.map((p) => (
              <div key={p.title} className="text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                  {p.icon}
                </div>
                <h4 className="font-extrabold text-gray-900 text-lg mb-2">{p.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 text-center">
            <p className="text-lg font-extrabold text-gray-900 mb-1">
              従来のEC：初期費用 数十万円 + 月額 数万円 + 売上手数料
            </p>
            <p className="text-lg font-extrabold text-indigo-600">
              単品決済ロットLP：初期費用 0円 + 月額 0円 + 成果報酬のみ
            </p>
            <p className="text-sm text-gray-500 mt-2">
              売上が立つまで一切コストがかからないので、リスクゼロで始められます
            </p>
          </div>
        </div>
      </section>

      {/* 比較表 */}
      <section id="comparison" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="mb-10 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            COMPARISON TABLE
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">従来EC vs 単品決済ロットLP</h2>
          <p className="text-gray-500 text-sm">主要な14項目で比較</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-5 py-4 font-bold text-gray-600 w-1/5">項目</th>
                <th className="text-left px-5 py-4 font-bold text-gray-400 w-2/5">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    従来のEC販売
                  </span>
                </th>
                <th className="text-left px-5 py-4 font-bold text-indigo-600 w-2/5">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                    単品決済ロットLP
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i} className={`border-b last:border-0 ${row.highlight ? "bg-indigo-50/50" : ""}`}>
                  <td className="px-5 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-5 py-3 text-gray-500">{row.traditional}</td>
                  <td className={`px-5 py-3 ${row.highlight ? "font-bold text-indigo-600" : "text-gray-700"}`}>
                    {row.ours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 優位性の詳細 */}
      <section id="advantages" className="bg-slate-900 text-white py-16 mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-medium text-indigo-400 tracking-wider mb-3 text-center">
            KEY ADVANTAGES
          </p>
          <h2 className="text-2xl font-extrabold text-center mb-3">
            従来ECにはない6つの優位性
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            単品決済ロットLPが提供する、BtoB取引に最適化された独自の機能
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="text-2xl mb-3">{a.icon}</div>
                <h4 className="font-bold text-sm mb-2">{a.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* こんな企業におすすめ */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">こんな企業・個人におすすめ</h2>
        <p className="text-gray-500 text-sm text-center mb-10">従来のECで感じていた課題を解決します</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🏭</div>
            <h3 className="font-bold text-gray-900 mb-2">メーカー</h3>
            <ul className="text-sm text-gray-500 space-y-1.5">
              <li>- ECサイト構築の初期費用を抑えたい</li>
              <li>- 商品の品質・信頼性を客観的に証明したい</li>
              <li>- BtoB取引をデジタル化したい</li>
              <li>- 帳票管理を一元化したい</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-bold text-gray-900 mb-2">バイヤー</h3>
            <ul className="text-sm text-gray-500 space-y-1.5">
              <li>- 信頼できる仕入先を効率的に見つけたい</li>
              <li>- 成分・認証を条件に検索したい</li>
              <li>- オークションで最適価格を実現したい</li>
              <li>- 複数サプライヤーを一括管理したい</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold text-gray-900 mb-2">クリエイター</h3>
            <ul className="text-sm text-gray-500 space-y-1.5">
              <li>- 初期費用0円で収益化を始めたい</li>
              <li>- 画像・動画を使ったLPで商品を紹介したい</li>
              <li>- 広告費なしでアフィリエイト収益を得たい</li>
              <li>- 成果報酬型で安心して活動したい</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-xl">💰</span>
            <span className="font-bold">初期費用 0円 ・ 月額 0円 ・ 成果報酬型</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-3">
            リスクゼロで始めましょう
          </h2>
          <p className="text-indigo-100 text-sm mb-8">
            初期費用も月額費用も不要。売上が発生して初めて手数料が発生する、
            完全成果報酬型のマーケットプレイスです。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 text-sm transition">
              無料で登録する
            </Link>
            <Link href="/flow" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              業務フローを見る
            </Link>
            <Link href="/flow/buyer" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              バイヤーガイド
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
