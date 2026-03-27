import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "健康食品・化粧品 BtoB向けシステム | 単品決済ロットLP",
  description:
    "健康食品・化粧品・サプリメントをBtoB（企業間取引）で販売するためのシステム紹介です。成分証明・法定表示義務への対応を含みます。",
};

const proofRequirements = [
  { layer: "L1", name: "事業者証明", required: "◎ 必須", note: "製造販売業許可証・営業許可証。食品なら保健所の営業許可", icon: "🏢" },
  { layer: "L2", name: "商品証明", required: "◎ 必須", note: "成分規格書・微生物検査結果・安定性試験・アレルギー表示。化粧品は全成分表示", icon: "📋" },
  { layer: "L3", name: "在庫証明", required: "◎ 必須", note: "ロット番号・賞味期限・保管温度帯の管理。温度管理が必要な商品はIoT連携推奨", icon: "📦" },
  { layer: "L4", name: "所有権履歴", required: "自動", note: "受発注レコードからシステムが自動生成。トレーサビリティに活用", icon: "🔗" },
  { layer: "L5", name: "配送証明", required: "◎ 必須", note: "追跡番号・温度記録（冷蔵冷凍の場合）・受取確認", icon: "🚚" },
];

const documents = [
  { name: "見積書", desc: "取引先への価格提示。ロット単位での数量・単価を記載", icon: "📝" },
  { name: "請求書", desc: "納品後の支払い請求。インボイス番号・消費税区分を明記", icon: "💴" },
  { name: "納品書", desc: "商品引渡し明細。ロット番号・賞味期限を記載して照合に使用", icon: "📦" },
  { name: "成分規格書", desc: "商品の成分情報。取引先への品質保証として提供", icon: "🧪" },
  { name: "発注書", desc: "購入企業からの正式発注。ロット番号・数量・納期を確定", icon: "📋" },
];

const features = [
  { icon: "🧪", title: "成分管理", desc: "成分表・アレルギー情報・添加物を商品ごとに登録" },
  { icon: "📅", title: "賞味期限管理", desc: "ロット単位で賞味期限を管理。期限切れ在庫を自動アラート" },
  { icon: "🌡️", title: "温度管理", desc: "冷蔵・冷凍・常温の保管条件をロットに紐付け" },
  { icon: "🤖", title: "販売エージェント", desc: "AIが取引先の購入傾向を分析し最適な提案を実行" },
  { icon: "🔍", title: "購買エージェント", desc: "AIがバイヤーの条件（成分・原産地等）に合う商品を検索" },
  { icon: "📊", title: "気配値ボード", desc: "同一商品の出品価格帯を一覧。仕入れの相場感を把握" },
  { icon: "🤝", title: "共同購入", desc: "複数企業の注文をまとめて大口価格を実現" },
  { icon: "📈", title: "売上レポート", desc: "商品別・取引先別の売上。賞味期限別の在庫回転率も確認" },
];

const targetUsers = [
  { role: "メーカー", examples: "健康食品メーカー、化粧品会社、サプリメント製造業、食品加工業", what: "自社製品を卸売先企業に販売" },
  { role: "販売代理店", examples: "健康食品卸、美容ディーラー、薬局卸売業者、輸出商社", what: "メーカー商品を取引先に販売・営業" },
  { role: "購入企業（バイヤー）", examples: "ドラッグストア、エステサロン、通販会社、輸出商社、病院・クリニック", what: "品質が保証された商品を仕入れ" },
];

const legalNotes = [
  { title: "食品表示法", desc: "原材料名・アレルギー・栄養成分の表示が義務。特に海外輸入品は日本語表示が必須", icon: "📋" },
  { title: "薬機法（化粧品）", desc: "全成分表示義務。製造販売業許可が必要。効能効果の表現に制限あり", icon: "💊" },
  { title: "健康増進法", desc: "虚偽・誇大な表示の禁止。科学的根拠のない効能表示はNG", icon: "⚖️" },
  { title: "景品表示法", desc: "商品の品質・価格等について消費者に誤認を与える表示の禁止", icon: "🔍" },
];

export default function HealthBtoBPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">フロー全体</Link>
            <Link href="/flow/general-btob" className="text-gray-600 hover:text-gray-900">一般商材 BtoB</Link>
            <Link href="/flow/general-btoc" className="text-gray-600 hover:text-gray-900">一般商材 BtoC</Link>
            <Link href="/flow/health-btoc" className="text-gray-600 hover:text-gray-900">健康食品 BtoC</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            健康食品・化粧品 × BtoB
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            健康食品・化粧品のBtoB向けシステム
          </h1>
          <p className="text-rose-200 max-w-2xl mx-auto leading-relaxed">
            健康食品・化粧品・サプリメントの企業間取引に特化。
            成分管理・賞味期限・温度管理・法定表示義務への対応など、このカテゴリー固有の要件をすべてカバーします。
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
                <p className="text-sm text-rose-600 font-medium">{u.what}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 法規制に関する注意事項 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">関連法規・表示義務</h2>
          <p className="text-gray-500 text-sm mb-6">健康食品・化粧品の取引には以下の法規制への対応が必要です</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {legalNotes.map((l) => (
              <div key={l.title} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{l.icon}</span>
                  <h4 className="font-bold text-amber-900 text-sm">{l.title}</h4>
                </div>
                <p className="text-xs text-amber-800">{l.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs text-red-700">
              <span className="font-bold">出品制限：</span>
              食品表示法に基づく日本語表示が不足している商品（特に海外輸入品）、成分規格書・検査結果の提出ができない商品は出品をお断りする場合があります。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">BtoB取引フロー</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              {[
                { step: "1", title: "商品・成分登録", desc: "成分表・検査結果・アレルギー情報を登録", color: "bg-rose-100 text-rose-700" },
                { step: "2", title: "ロット管理", desc: "ロット番号・賞味期限・保管温度を設定", color: "bg-amber-100 text-amber-700" },
                { step: "3", title: "AIマッチング", desc: "バイヤーの条件（成分・原産地等）でマッチング", color: "bg-purple-100 text-purple-700" },
                { step: "4", title: "見積・商談", desc: "見積書作成。ロット単位での価格交渉", color: "bg-blue-100 text-blue-700" },
                { step: "5", title: "納品・追跡", desc: "温度管理付き配送。ロット番号で追跡", color: "bg-green-100 text-green-700" },
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">プルーフチェーン（健康食品・化粧品BtoB）</h2>
          <p className="text-gray-500 text-sm mb-6">このカテゴリーではL1〜L3が<span className="font-bold text-red-600">必須</span>です。成分・品質の証明が取引の前提となります。</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofRequirements.map((p) => (
              <div key={p.layer} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{p.layer}</span>
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
        </section>

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">BtoB帳票管理</h2>
          <p className="text-gray-500 text-sm mb-6">企業間取引に必要な帳票を自動生成。ロット番号・賞味期限を帳票に自動反映。インボイス対応済み。</p>
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">健康食品・化粧品BtoB向け機能</h2>
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
            <Link href="/flow/general-btob" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-rose-400 transition">一般商材 BtoB</Link>
            <Link href="/flow/general-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-rose-400 transition">一般商材 BtoC</Link>
            <Link href="/flow/health-btoc" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-rose-400 transition">健康食品・化粧品 BtoC</Link>
            <Link href="/awards" className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-amber-400 transition">🏆 アワード</Link>
          </div>
          <Link href="/flow" className="mt-4 inline-block text-sm text-rose-600 hover:text-rose-800">
            ← 業務フロー全体へ戻る
          </Link>
        </section>

      </div>
    </div>
  );
}
