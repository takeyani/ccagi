import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "一般商材 BtoB向けシステム | Cross Infinity",
  description:
    "家電・アパレル・工業製品などの一般商材をBtoB（企業間取引）で販売するためのシステム紹介です。",
};

/* ── データ ── */

const proofRequirements = [
  { layer: "L1", name: "事業者証明", required: "○ 推奨", note: "営業許可証・法人登記", icon: "🏢" },
  { layer: "L2", name: "商品証明", required: "○ 任意", note: "PSE等の規格適合証明があると信頼度UP", icon: "📋" },
  { layer: "L3", name: "在庫証明", required: "◎ 必須", note: "バーコード・倉庫管理（WMS）連携", icon: "📦" },
  { layer: "L4", name: "所有権履歴", required: "自動", note: "受発注レコードからシステムが自動生成", icon: "🔗" },
  { layer: "L5", name: "配送証明", required: "◎ 必須", note: "追跡番号・受取確認", icon: "🚚" },
];

const documents = [
  { name: "見積書", desc: "取引先への価格提示。数量・単価・有効期限を記載", icon: "📝" },
  { name: "請求書", desc: "納品後の支払い請求。インボイス番号対応", icon: "💴" },
  { name: "納品書", desc: "商品引渡し時の明細。検品時の照合に使用", icon: "📦" },
  { name: "発注書", desc: "購入企業からの正式発注。数量・納期を確定", icon: "📋" },
];

const features = [
  { icon: "🏷️", title: "SKU管理", desc: "型番・カラー・サイズ単位で在庫を正確に管理" },
  { icon: "📊", title: "気配値ボード", desc: "同一商品の出品価格帯を一覧。相場感を把握" },
  { icon: "🤖", title: "販売エージェント", desc: "AIが最適な価格設定・ターゲットバイヤーを提案" },
  { icon: "🔍", title: "購買エージェント", desc: "AIがバイヤーの条件に合う商品を自動検索" },
  { icon: "🤝", title: "共同購入（入札集約）", desc: "複数企業の注文をまとめて大口価格を実現" },
  { icon: "📧", title: "メール配信", desc: "新商品・キャンペーンを取引先に一斉通知" },
  { icon: "🏅", title: "レビュー・評価", desc: "取引先からの評価で信頼度を蓄積" },
  { icon: "📈", title: "売上レポート", desc: "商品別・取引先別の売上をリアルタイム分析" },
];

const targetUsers = [
  { role: "メーカー", examples: "家電メーカー、アパレルブランド、工業製品メーカー、雑貨メーカー", what: "自社商品を企業向けに卸販売" },
  { role: "販売代理店", examples: "商社、問屋、営業代行会社、卸売業者", what: "メーカー商品を取引先ネットワークで販売" },
  { role: "購入企業（バイヤー）", examples: "小売チェーン、輸出商社、量販店、専門店", what: "仕入れ先の発見・相見積もり・発注" },
];

export default function GeneralBtoBPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">Cross Infinity</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">フロー全体</Link>
            <Link href="/flow/general-btoc" className="text-gray-600 hover:text-gray-900">一般商材 BtoC</Link>
            <Link href="/flow/health-btob" className="text-gray-600 hover:text-gray-900">健康食品 BtoB</Link>
            <Link href="/flow/health-btoc" className="text-gray-600 hover:text-gray-900">健康食品 BtoC</Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-orange-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            一般商材 × BtoB
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            一般商材のBtoB向けシステム
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto leading-relaxed">
            家電・アパレル・工業製品・雑貨など、幅広い一般商材を企業間で取引するためのプラットフォームです。
            SKU管理・BtoB帳票・AIエージェントによるマッチングで、効率的な企業間取引を実現します。
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* 対象ユーザー */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">このページが対象の方</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {targetUsers.map((u) => (
              <div key={u.role} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">{u.role}</h3>
                <p className="text-xs text-gray-500 mb-3">{u.examples}</p>
                <p className="text-sm text-orange-600 font-medium">{u.what}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 取引フロー */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoB取引フロー</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              {[
                { step: "1", title: "商品登録", desc: "メーカーがSKU単位で商品・価格を登録", color: "bg-blue-100 text-blue-700" },
                { step: "2", title: "AIマッチング", desc: "販売/購買エージェントが最適な取引先を発見", color: "bg-purple-100 text-purple-700" },
                { step: "3", title: "見積・商談", desc: "見積書の作成、数量・納期の調整", color: "bg-amber-100 text-amber-700" },
                { step: "4", title: "発注・決済", desc: "Stripe決済またはBtoB請求書払い", color: "bg-green-100 text-green-700" },
                { step: "5", title: "出荷・納品", desc: "配送証明で確実に届いたことを記録", color: "bg-pink-100 text-pink-700" },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center font-bold text-sm mb-2`}>{s.step}</div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                  {i < 4 && <div className="hidden md:block absolute right-0 text-gray-300">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* プルーフチェーン */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">プルーフチェーン（一般商材BtoB）</h2>
          <p className="text-gray-500 text-sm mb-6">一般商材のBtoB取引で必要な証明項目</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofRequirements.map((p) => (
              <div key={p.layer} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50/40 px-2 py-0.5 rounded-full">{p.layer}</span>
                  <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
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

        {/* BtoB帳票 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">BtoB帳票管理</h2>
          <p className="text-gray-500 text-sm mb-6">企業間取引に必要な帳票をシステムで自動生成。インボイス制度対応済み。</p>
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
          <div className="mt-4 bg-orange-50/40 border border-orange-200 rounded-xl p-4">
            <p className="text-xs text-orange-700">
              <span className="font-bold">インボイス対応：</span>
              適格請求書発行事業者番号（T+13桁）を登録すると、すべての帳票にインボイス番号が自動反映されます。
            </p>
          </div>
        </section>

        {/* 主な機能 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoB取引で使える機能</h2>
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

        {/* 他カテゴリーへのリンク */}
        <section className="bg-gray-100 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">他のカテゴリー・取引形態</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/flow/general-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 transition">一般商材 BtoC</Link>
            <Link href="/flow/health-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 transition">健康食品・化粧品 BtoB</Link>
            <Link href="/flow/health-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-400 transition">健康食品・化粧品 BtoC</Link>
            <Link href="/awards" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-amber-400 transition">🏆 アワード</Link>
          </div>
          <Link href="/flow" className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-800">
            ← 業務フロー全体へ戻る
          </Link>
        </section>

      </div>
    </div>
  );
}
