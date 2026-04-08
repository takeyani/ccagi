import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "一般商材 BtoC向けシステム | Cross Infinity",
  description:
    "家電・アパレル・雑貨などの一般商材を個人消費者向けに販売するためのシステム紹介です。",
};

const proofRequirements = [
  { layer: "L1", name: "事業者証明", required: "○ 推奨", note: "営業許可証・特商法に基づく表記", icon: "🏢" },
  { layer: "L2", name: "商品証明", required: "○ 任意", note: "商品画像・仕様書があると信頼度UP", icon: "📋" },
  { layer: "L3", name: "在庫証明", required: "◎ 必須", note: "SKU単位でリアルタイム在庫管理", icon: "📦" },
  { layer: "L4", name: "所有権履歴", required: "自動", note: "受発注レコードからシステムが自動生成", icon: "🔗" },
  { layer: "L5", name: "配送証明", required: "◎ 必須", note: "追跡番号・配達完了写真", icon: "🚚" },
];

const documents = [
  { name: "領収書", desc: "購入者への支払い証明。電子発行で即日対応", icon: "🧾" },
  { name: "購入明細", desc: "商品名・数量・価格の詳細明細書", icon: "📄" },
  { name: "返品伝票", desc: "返品・交換時の処理記録。返金手続きに連動", icon: "↩️" },
  { name: "納品書", desc: "商品同梱の納品明細。ギフト時は金額非表示も可能", icon: "📦" },
];

const features = [
  { icon: "🛒", title: "LP作成ツール", desc: "クリエイターが画像・動画でLPを簡単作成" },
  { icon: "🤖", title: "購買エージェント", desc: "AIが消費者の好みに合う商品を自動提案" },
  { icon: "📱", title: "SNS連携", desc: "Instagram・TikTok・YouTubeへワンクリック共有" },
  { icon: "🏷️", title: "クーポン・セール", desc: "期間限定割引・クーポンコード発行" },
  { icon: "🔔", title: "再入荷通知", desc: "売り切れ商品の再入荷を自動でお知らせ" },
  { icon: "🎯", title: "おすすめ商品", desc: "閲覧履歴・購入傾向から最適な商品を提案" },
  { icon: "🏅", title: "レビュー・評価", desc: "購入者レビューで商品の信頼度を可視化" },
  { icon: "📈", title: "コンバージョン分析", desc: "LP閲覧→購入のコンバージョンを計測" },
];

const targetUsers = [
  { role: "メーカー", examples: "家電メーカー、アパレルブランド、雑貨メーカー、D2Cブランド", what: "自社商品を消費者に直接販売" },
  { role: "クリエイター", examples: "映像クリエイター、インフルエンサー、デザイナー、ブロガー", what: "メーカー商品のLPを作成して販売・収益化" },
  { role: "個人購入者", examples: "一般消費者、ギフト購入者、まとめ買い希望者", what: "信頼できる商品を安心して購入" },
];

export default function GeneralBtoCPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">Cross Infinity</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">フロー全体</Link>
            <Link href="/flow/general-btob" className="text-gray-600 hover:text-gray-900">一般商材 BtoB</Link>
            <Link href="/flow/health-btob" className="text-gray-600 hover:text-gray-900">健康食品 BtoB</Link>
            <Link href="/flow/health-btoc" className="text-gray-600 hover:text-gray-900">健康食品 BtoC</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            一般商材 × BtoC
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            一般商材のBtoC向けシステム
          </h1>
          <p className="text-emerald-200 max-w-2xl mx-auto leading-relaxed">
            家電・アパレル・雑貨などをクリエイターのLPを通じて個人消費者に販売。
            SNS連携・レビュー機能・AIおすすめで、消費者に「見つけてもらえる」仕組みを提供します。
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">このページが対象の方</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {targetUsers.map((u) => (
              <div key={u.role} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">{u.role}</h3>
                <p className="text-xs text-gray-500 mb-3">{u.examples}</p>
                <p className="text-sm text-emerald-600 font-medium">{u.what}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoC販売フロー</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              {[
                { step: "1", title: "商品登録", desc: "メーカーが商品情報・画像・価格を登録", color: "bg-blue-100 text-blue-700" },
                { step: "2", title: "LP作成", desc: "クリエイターが画像・動画でLPを作成", color: "bg-pink-100 text-pink-700" },
                { step: "3", title: "SNS拡散", desc: "Instagram・TikTok等で商品を紹介", color: "bg-purple-100 text-purple-700" },
                { step: "4", title: "購入・決済", desc: "LP経由でStripe決済。カード・コンビニ対応", color: "bg-green-100 text-green-700" },
                { step: "5", title: "配送・レビュー", desc: "追跡付き配送。届いたらレビュー投稿", color: "bg-amber-100 text-amber-700" },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center font-bold text-sm mb-2`}>{s.step}</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">プルーフチェーン（一般商材BtoC）</h2>
          <p className="text-gray-500 text-sm mb-6">消費者が安心して購入できるための証明項目</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofRequirements.map((p) => (
              <div key={p.layer} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.layer}</span>
                  <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                </div>
                <div className="mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.required === "◎ 必須" ? "bg-red-50 text-red-600" :
                    p.required === "○ 推奨" ? "bg-amber-50 text-amber-600" :
                    p.required === "○ 任意" ? "bg-gray-100 text-gray-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>{p.required}</span>
                </div>
                <p className="text-xs text-gray-500">{p.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">BtoC帳票管理</h2>
          <p className="text-gray-500 text-sm mb-6">個人向け取引に必要な帳票を自動生成。</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {documents.map((d) => (
              <div key={d.name} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-3">
                <span className="text-2xl">{d.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{d.name}</h4>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoC販売で使える機能</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-100 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">他のカテゴリー・取引形態</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/flow/general-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-emerald-400 transition">一般商材 BtoB</Link>
            <Link href="/flow/health-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-emerald-400 transition">健康食品・化粧品 BtoB</Link>
            <Link href="/flow/health-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-emerald-400 transition">健康食品・化粧品 BtoC</Link>
            <Link href="/awards" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-amber-400 transition">🏆 アワード</Link>
          </div>
          <Link href="/flow" className="mt-4 inline-block text-sm text-emerald-600 hover:text-emerald-800">
            ← 業務フロー全体へ戻る
          </Link>
        </section>

      </div>
    </div>
  );
}
