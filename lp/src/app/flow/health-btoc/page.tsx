import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "健康食品・化粧品 BtoC向けシステム | 単品決済ロットLP",
  description:
    "健康食品・化粧品・サプリメントを個人消費者向けに販売するためのシステム紹介です。",
};

const proofRequirements = [
  { layer: "L1", name: "事業者証明", required: "◎ 必須", note: "製造販売業許可証・特商法に基づく表記", icon: "🏢" },
  { layer: "L2", name: "商品証明", required: "◎ 必須", note: "全成分表示・アレルギー表示・検査結果。消費者の安全に直結", icon: "📋" },
  { layer: "L3", name: "在庫証明", required: "◎ 必須", note: "ロット番号・賞味期限・保管温度帯の管理", icon: "📦" },
  { layer: "L4", name: "所有権履歴", required: "自動", note: "受発注レコードからシステムが自動生成", icon: "🔗" },
  { layer: "L5", name: "配送証明", required: "◎ 必須", note: "追跡番号・温度記録（冷蔵の場合）・配達完了写真", icon: "🚚" },
];

const documents = [
  { name: "領収書", desc: "購入者への支払い証明。電子発行で即日対応", icon: "🧾" },
  { name: "購入明細", desc: "商品名・成分情報・ロット番号を記載した詳細明細", icon: "📄" },
  { name: "返品伝票", desc: "返品・交換時の処理記録。未開封条件等の規定に連動", icon: "↩️" },
  { name: "成分情報カード", desc: "購入者向けの成分・使用方法の説明カード", icon: "💊" },
];

const features = [
  { icon: "🛒", title: "LP作成ツール", desc: "ビフォーアフター・使用方法の動画付きLP作成" },
  { icon: "🤖", title: "購買エージェント", desc: "AIが肌質・アレルギー・目的に合う商品を提案" },
  { icon: "📱", title: "SNS連携", desc: "Instagram・TikTok・YouTubeで美容レビューを拡散" },
  { icon: "🧪", title: "成分検索", desc: "特定成分を含む/含まない商品を消費者が検索可能" },
  { icon: "🏷️", title: "定期購入", desc: "サプリ・化粧品の定期便をLP上で設定可能" },
  { icon: "🔔", title: "再入荷通知", desc: "人気商品の再入荷を消費者に自動でお知らせ" },
  { icon: "🏅", title: "レビュー・評価", desc: "肌質別・年齢別のレビューで購入判断をサポート" },
  { icon: "📈", title: "コンバージョン分析", desc: "LP閲覧→購入の転換率をクリエイターが確認" },
];

const targetUsers = [
  { role: "メーカー", examples: "化粧品会社、サプリメントメーカー、健康食品製造業、オーガニックブランド", what: "自社製品を消費者に直接販売（D2C）" },
  { role: "クリエイター", examples: "美容系インフルエンサー、健康系YouTuber、エステティシャン、管理栄養士", what: "専門知識を活かしたLP作成で商品を紹介・販売" },
  { role: "個人購入者", examples: "美容に関心がある消費者、健康志向の方、アレルギーで成分が気になる方", what: "成分が確認でき安心して購入" },
];

export default function HealthBtoCPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">フロー全体</Link>
            <Link href="/flow/general-btob" className="text-gray-600 hover:text-gray-900">一般商材 BtoB</Link>
            <Link href="/flow/general-btoc" className="text-gray-600 hover:text-gray-900">一般商材 BtoC</Link>
            <Link href="/flow/health-btob" className="text-gray-600 hover:text-gray-900">健康食品 BtoB</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            健康食品・化粧品 × BtoC
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            健康食品・化粧品のBtoC向けシステム
          </h1>
          <p className="text-purple-200 max-w-2xl mx-auto leading-relaxed">
            化粧品・サプリメント・健康食品を、美容・健康の専門知識を持つクリエイターのLPを通じて個人消費者に販売。
            成分検索・肌質別レビュー・AIおすすめで、消費者が「自分に合う商品」を見つけられます。
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
                <p className="text-sm text-purple-600 font-medium">{u.what}</p>
              </div>
            ))}
          </div>
        </section>

        {/* クリエイターの専門性が重要 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">なぜ専門クリエイターが重要なのか</h2>
          <p className="text-gray-500 text-sm mb-6">健康食品・化粧品は「自分に合うか」が購入判断の決め手。専門知識を持つクリエイターが橋渡しします。</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "成分の解説力", desc: "「ヒアルロン酸とは？」「ビタミンCの効果は？」を動画・画像で分かりやすく解説", icon: "🧪" },
              { title: "使用感のリアルレビュー", desc: "テクスチャー・香り・肌への変化を実際の使用動画で紹介", icon: "📹" },
              { title: "肌質・体質別の提案", desc: "「乾燥肌向け」「敏感肌OK」など、ターゲットを絞ったLP作成", icon: "🎯" },
            ].map((item) => (
              <div key={item.title} className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoC販売フロー</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              {[
                { step: "1", title: "商品・成分登録", desc: "メーカーが成分表・検査結果と共に商品を登録", color: "bg-rose-100 text-rose-700" },
                { step: "2", title: "LP作成", desc: "美容クリエイターが使用感動画付きLPを作成", color: "bg-pink-100 text-pink-700" },
                { step: "3", title: "SNS拡散", desc: "Instagram・TikTokで美容レビューとして拡散", color: "bg-purple-100 text-purple-700" },
                { step: "4", title: "成分確認・購入", desc: "消費者が成分を確認してLP経由で購入", color: "bg-green-100 text-green-700" },
                { step: "5", title: "配送・レビュー", desc: "温度管理付き配送。肌質別レビューを投稿", color: "bg-amber-100 text-amber-700" },
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">プルーフチェーン（健康食品・化粧品BtoC）</h2>
          <p className="text-gray-500 text-sm mb-6">消費者の安全に直結するカテゴリーのため、L1〜L3が<span className="font-bold text-red-600">必須</span>です。</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofRequirements.map((p) => (
              <div key={p.layer} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{p.layer}</span>
                  <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                </div>
                <div className="mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.required === "◎ 必須" ? "bg-red-50 text-red-600" :
                    p.required === "○ 推奨" ? "bg-amber-50 text-amber-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>{p.required}</span>
                </div>
                <p className="text-xs text-gray-500">{p.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs text-red-700">
              <span className="font-bold">出品制限：</span>
              成分規格書・検査結果の提出ができない商品、日本語での法定表示が不足している商品（特に海外輸入品）は出品をお断りする場合があります。薬機法に抵触する効能効果の表記があるLPは掲載できません。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">BtoC帳票管理</h2>
          <p className="text-gray-500 text-sm mb-6">個人向け取引に必要な帳票を自動生成。成分情報カードも同梱可能。</p>
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">健康食品・化粧品BtoC向け機能</h2>
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
            <Link href="/flow/general-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-400 transition">一般商材 BtoB</Link>
            <Link href="/flow/general-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-400 transition">一般商材 BtoC</Link>
            <Link href="/flow/health-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-400 transition">健康食品・化粧品 BtoB</Link>
          </div>
          <Link href="/flow" className="mt-4 inline-block text-sm text-purple-600 hover:text-purple-800">
            ← 業務フロー全体へ戻る
          </Link>
        </section>

      </div>
    </div>
  );
}
