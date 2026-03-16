import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "アワード（デイリー・週間・月間） | 単品決済ロットLP",
  description:
    "カテゴリー別・集計単位別のデイリー・週間・月間アワード。売上・評価・プルーフチェーン・クリエイター実績などを自動集計し、優秀なパートナーを表彰します。",
};

/* ── 型定義 ── */

type AwardCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

type AwardMetric = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unit: string;
  targets: string[];
};

type AwardTier = {
  rank: string;
  label: string;
  icon: string;
  color: string;
  benefit: string;
};

/* ── データ ── */

const categories: AwardCategory[] = [
  { id: "food", name: "食品", icon: "🍱", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { id: "cosmetics", name: "化粧品・健康食品", icon: "💄", color: "text-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  { id: "electronics", name: "家電・電子機器", icon: "📱", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { id: "apparel", name: "洋服・ファッション", icon: "👕", color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "service", name: "サービス・コンサル", icon: "💼", color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
  { id: "digital", name: "映像・デジタル商品", icon: "🎬", color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { id: "industrial", name: "産業用・工業製品", icon: "🏭", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
];

const metrics: AwardMetric[] = [
  {
    id: "sales_volume",
    name: "月間売上高",
    icon: "💰",
    description: "当月の総売上金額（税抜）でランキング。カテゴリー内で最も売上の大きいパートナーを表彰。",
    unit: "円",
    targets: ["メーカー", "販売代理店"],
  },
  {
    id: "sales_count",
    name: "月間販売件数",
    icon: "📦",
    description: "当月の受注件数でランキング。多くの取引を成立させたパートナーを表彰。",
    unit: "件",
    targets: ["メーカー", "販売代理店"],
  },
  {
    id: "review_score",
    name: "平均レビュースコア",
    icon: "⭐",
    description: "バイヤーからの平均評価点（5点満点）。最低10件以上のレビューが対象条件。",
    unit: "点",
    targets: ["メーカー", "販売代理店", "クリエイター"],
  },
  {
    id: "proof_score",
    name: "プルーフチェーンスコア",
    icon: "🔐",
    description: "5層プルーフチェーンの達成率。証明書類の充実度と品質をスコア化。",
    unit: "%",
    targets: ["メーカー"],
  },
  {
    id: "creator_conversion",
    name: "LP コンバージョン率",
    icon: "🎯",
    description: "LP閲覧数に対する購入完了率。最もLP経由で購入を生み出したクリエイターを表彰。",
    unit: "%",
    targets: ["クリエイター"],
  },
  {
    id: "creator_sales",
    name: "クリエイター月間売上",
    icon: "🎨",
    description: "クリエイターのLP経由で発生した月間売上合計。影響力の大きさを評価。",
    unit: "円",
    targets: ["クリエイター"],
  },
  {
    id: "new_buyer_acquisition",
    name: "新規バイヤー獲得数",
    icon: "👥",
    description: "当月に初回購入したバイヤーの数。新規顧客を最も多く獲得したパートナーを表彰。",
    unit: "人",
    targets: ["メーカー", "販売代理店", "クリエイター"],
  },
  {
    id: "repeat_rate",
    name: "リピート率",
    icon: "🔄",
    description: "2回以上購入したバイヤーの割合。継続的な信頼関係を築いているパートナーを評価。",
    unit: "%",
    targets: ["メーカー", "販売代理店"],
  },
  {
    id: "auction_volume",
    name: "オークション落札総額",
    icon: "🔨",
    description: "オークション経由の月間落札総額。オークションを活用して取引を活性化した出品者を表彰。",
    unit: "円",
    targets: ["メーカー", "販売代理店"],
  },
  {
    id: "group_purchase",
    name: "共同購入成立数",
    icon: "🤝",
    description: "共同購入グループの成立件数。まとめ買いの仕組みを活用した取引の回数。",
    unit: "件",
    targets: ["メーカー", "販売代理店"],
  },
  {
    id: "affiliate_referral",
    name: "アフィリエイト紹介数",
    icon: "📣",
    description: "紹介リンク経由で新規登録・購入に至ったユーザー数。プラットフォーム拡大への貢献度。",
    unit: "人",
    targets: ["クリエイター"],
  },
  {
    id: "response_speed",
    name: "問い合わせ応答速度",
    icon: "⚡",
    description: "バイヤーからの問い合わせに対する平均応答時間。迅速な対応をしたパートナーを評価。",
    unit: "時間",
    targets: ["メーカー", "販売代理店"],
  },
];

const tiers: AwardTier[] = [
  { rank: "1st", label: "ゴールド", icon: "🥇", color: "from-amber-400 to-yellow-500", benefit: "トップページ掲載 + 次月手数料1%OFF + ゴールドバッジ" },
  { rank: "2nd", label: "シルバー", icon: "🥈", color: "from-gray-300 to-gray-400", benefit: "カテゴリーページ掲載 + 次月手数料0.5%OFF + シルバーバッジ" },
  { rank: "3rd", label: "ブロンズ", icon: "🥉", color: "from-amber-600 to-orange-700", benefit: "ランキングページ掲載 + ブロンズバッジ" },
  { rank: "TOP10", label: "ノミネート", icon: "🏅", color: "from-indigo-400 to-blue-500", benefit: "ランキングページ掲載 + ノミネートバッジ" },
];

const months = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

/* ── コンポーネント ── */

function MetricCard({ metric }: { metric: AwardMetric }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{metric.icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{metric.name}</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">{metric.description}</p>
          <div className="flex flex-wrap gap-1">
            {metric.targets.map((t) => (
              <span key={t} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ページ ── */

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">単品決済ロットLP</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/flow" className="text-gray-600 hover:text-gray-900">フロー全体</Link>
            <Link href="/flow/buyer" className="text-gray-600 hover:text-gray-900">バイヤー</Link>
            <Link href="/flow/creator" className="text-gray-600 hover:text-gray-900">クリエイター</Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            DAILY / WEEKLY / MONTHLY AWARDS
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            アワード（デイリー・週間・月間）
          </h1>
          <p className="text-amber-200 max-w-2xl mx-auto leading-relaxed">
            カテゴリー別・集計単位別に、優秀なメーカー・販売代理店・クリエイターをデイリー・週間・月間で自動表彰。
            定量データに基づく透明な評価で、プラットフォーム全体の品質を高めます。
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* 3つの集計期間 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">3つの集計期間</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
            デイリー・週間・月間の3つの期間でそれぞれ自動集計。短期の勢いも中長期の実力も評価します。
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* デイリー */}
            <div className="bg-white rounded-2xl border-2 border-green-400 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">📅</div>
                <div>
                  <h3 className="font-bold text-gray-900">デイリーアワード</h3>
                  <p className="text-xs text-green-600 font-medium">毎日 0:00 自動集計</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-800 mb-1">集計タイミング</p>
                  <p className="text-xs text-green-700">毎日0:00に前日分を自動集計。翌朝にはランキングが更新。</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-1">デイリー専用指標</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-1"><span className="text-green-500">-</span> 本日の売上トップ</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">-</span> 本日の販売件数トップ</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">-</span> 本日の新規バイヤー獲得数</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">-</span> 本日のオークション落札額トップ</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">-</span> 本日のLP閲覧数トップ（クリエイター）</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-bold text-green-700 mb-1">表彰</p>
                <p className="text-xs text-green-600">各カテゴリーTOP3を「Today&apos;s Best」として表示。バッジはなし（実績として蓄積）。</p>
              </div>
            </div>

            {/* 週間 */}
            <div className="bg-white rounded-2xl border-2 border-blue-400 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📊</div>
                <div>
                  <h3 className="font-bold text-gray-900">週間アワード</h3>
                  <p className="text-xs text-blue-600 font-medium">毎週月曜 0:00 自動集計</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-800 mb-1">集計タイミング</p>
                  <p className="text-xs text-blue-700">毎週月曜0:00に前週（月〜日）分を自動集計。週明けにランキング更新。</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-1">週間専用指標</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間売上高トップ</li>
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間販売件数トップ</li>
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間レビュースコアトップ</li>
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間コンバージョン率トップ（クリエイター）</li>
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間共同購入成立数トップ</li>
                    <li className="flex items-center gap-1"><span className="text-blue-500">-</span> 週間アフィリエイト紹介数トップ</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-700 mb-1">表彰</p>
                <p className="text-xs text-blue-600">各カテゴリーTOP5を「Weekly Star」として表示。ウィークリーバッジを付与。</p>
              </div>
            </div>

            {/* 月間 */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <h3 className="font-bold text-gray-900">月間アワード</h3>
                  <p className="text-xs text-amber-600 font-medium">毎月1日 0:00 自動集計</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-amber-800 mb-1">集計タイミング</p>
                  <p className="text-xs text-amber-700">毎月1日0:00に前月分を自動集計。12の評価軸×7カテゴリーで確定。</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-1">月間の全12指標で評価</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> 売上高・販売件数・レビュースコア</li>
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> プルーフチェーンスコア</li>
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> LPコンバージョン率・クリエイター売上</li>
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> 新規バイヤー獲得・リピート率</li>
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> オークション・共同購入・紹介数</li>
                    <li className="flex items-center gap-1"><span className="text-amber-500">-</span> 問い合わせ応答速度</li>
                  </ul>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-700 mb-1">表彰</p>
                <p className="text-xs text-amber-600">ゴールド/シルバー/ブロンズ/ノミネート。手数料割引+バッジ付与。3ヶ月連続ゴールドで殿堂入り。</p>
              </div>
            </div>
          </div>

          {/* 比較表 */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 font-bold text-gray-700 border-b">項目</th>
                  <th className="text-center py-3 px-4 font-bold text-green-700 border-b">📅 デイリー</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-700 border-b">📊 週間</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-700 border-b">🏆 月間</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: "集計タイミング", daily: "毎日 0:00", weekly: "毎週月曜 0:00", monthly: "毎月1日 0:00" },
                  { item: "集計期間", daily: "前日（24時間）", weekly: "前週（月〜日）", monthly: "前月（1ヶ月）" },
                  { item: "表彰人数", daily: "各指標 TOP3", weekly: "各指標 TOP5", monthly: "各指標 TOP10" },
                  { item: "バッジ付与", daily: "なし（実績蓄積）", weekly: "Weekly Star", monthly: "ゴールド/シルバー/ブロンズ" },
                  { item: "手数料割引", daily: "なし", weekly: "なし", monthly: "ゴールド: 1%OFF / シルバー: 0.5%OFF" },
                  { item: "ページ掲載", daily: "Today&apos;s Best", weekly: "Weekly ランキング", monthly: "月間アワードページ + トップページ" },
                  { item: "通知", daily: "ダッシュボード表示", weekly: "メール通知", monthly: "メール通知 + バッジ付与通知" },
                  { item: "アーカイブ", daily: "30日間保存", weekly: "52週分保存", monthly: "無期限保存" },
                ].map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2.5 px-4 font-medium text-gray-700 border-b border-gray-100">{row.item}</td>
                    <td className="text-center py-2.5 px-4 text-gray-600 border-b border-gray-100">{row.daily}</td>
                    <td className="text-center py-2.5 px-4 text-gray-600 border-b border-gray-100">{row.weekly}</td>
                    <td className="text-center py-2.5 px-4 text-gray-600 border-b border-gray-100">{row.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 自動集計の仕組み */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">自動集計の仕組み</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
            デイリー・週間・月間すべてCronジョブで自動集計。手動の審査は不要です。
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "データ蓄積", desc: "取引・レビュー・プルーフ登録など全データをリアルタイムで蓄積", icon: "📊" },
              { step: "2", title: "定期自動集計", desc: "デイリー(毎日)・週間(毎週月曜)・月間(毎月1日)にCronジョブで自動計算", icon: "🤖" },
              { step: "3", title: "ランキング確定", desc: "各カテゴリー×各指標でTOP3/5/10を抽出しランク付け", icon: "🏆" },
              { step: "4", title: "表彰・通知", desc: "受賞者にダッシュボード/メール通知。バッジと特典を自動付与", icon: "📧" },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">{s.step}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 表彰ティア */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">表彰ランクと特典</h2>
          <p className="text-gray-500 text-sm text-center mb-10">各指標×各カテゴリーの上位者に自動でランクと特典を付与します</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.rank} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <div className={`inline-block bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                  {tier.rank}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{tier.label}</h4>
                <p className="text-xs text-gray-500">{tier.benefit}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs text-amber-800">
              <span className="font-bold">累積表彰制度：</span>
              3ヶ月連続ゴールドで「殿堂入り」バッジを付与。年間MVPは12月に特別表彰されます。
            </p>
          </div>
        </section>

        {/* 対象カテゴリー */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">対象カテゴリー</h2>
          <p className="text-gray-500 text-sm text-center mb-10">7つのカテゴリーごとに独立したアワードが実施されます</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className={`${cat.bgColor} ${cat.borderColor} border rounded-xl p-4 text-center`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h4 className={`font-bold text-sm ${cat.color}`}>{cat.name}</h4>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400 text-center">
            カテゴリーをまたいで活動するパートナーは、複数カテゴリーで同時受賞が可能です
          </p>
        </section>

        {/* 集計指標（12軸） */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">12の評価軸</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
            売上だけでなく、品質・信頼性・対応速度・クリエイター貢献など多角的に評価。
            それぞれの強みに光が当たる仕組みです。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.id} metric={m} />
            ))}
          </div>
        </section>

        {/* カテゴリー × 指標 マトリックス */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">カテゴリー × 評価軸マトリックス</h2>
          <p className="text-gray-500 text-sm text-center mb-10">
            各カテゴリーで適用される評価軸の一覧。カテゴリーの特性に応じて評価軸が異なります。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-3 font-bold text-gray-700 border-b border-gray-200 sticky left-0 bg-gray-100">評価軸</th>
                  {categories.map((cat) => (
                    <th key={cat.id} className="text-center py-3 px-2 font-bold border-b border-gray-200 min-w-[60px]">
                      <div className="text-lg">{cat.icon}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{cat.name.split("・")[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, i) => (
                  <tr key={metric.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2.5 px-3 font-medium text-gray-700 border-b border-gray-100 sticky left-0" style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <span className="mr-1">{metric.icon}</span> {metric.name}
                    </td>
                    {categories.map((cat) => {
                      const applicable = (() => {
                        // カテゴリー特性に応じた適用判定
                        if (metric.id === "proof_score" && (cat.id === "service" || cat.id === "digital")) return "△";
                        if (metric.id === "auction_volume" && cat.id === "service") return "−";
                        if (metric.id === "group_purchase" && cat.id === "service") return "−";
                        return "◎";
                      })();
                      return (
                        <td key={cat.id} className="text-center py-2.5 px-2 border-b border-gray-100">
                          <span className={
                            applicable === "◎" ? "text-green-600 font-bold" :
                            applicable === "△" ? "text-amber-500" :
                            "text-gray-300"
                          }>{applicable}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-4 text-[10px] text-gray-500 justify-center">
            <span>◎ 対象</span>
            <span>△ 一部対象（カテゴリー特性による）</span>
            <span>− 対象外</span>
          </div>
        </section>

        {/* 月間カレンダー */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">アワードカレンダー</h2>
          <p className="text-gray-500 text-sm text-center mb-10">毎月のスケジュールと年間特別アワード</p>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {months.map((month, i) => (
              <div key={month} className={`rounded-xl border p-4 text-center ${i === 11 ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}>
                <p className="text-xs text-gray-400 mb-1">{2026}年</p>
                <p className={`font-bold ${i === 11 ? "text-amber-700" : "text-gray-900"}`}>{month}</p>
                <p className="text-[10px] text-gray-500 mt-1">月間アワード</p>
                {i === 11 && <p className="text-[10px] text-amber-600 font-bold mt-0.5">+ 年間MVP</p>}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4 text-center">集計スケジュール</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-green-600 mb-2">📅 デイリー</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { time: "毎日 0:00", event: "前日分の自動集計", icon: "⚙️" },
                    { time: "毎日 0:30", event: "Today&apos;s Best 更新", icon: "🏅" },
                    { time: "常時", event: "リアルタイムでデータ蓄積", icon: "📊" },
                  ].map((s) => (
                    <div key={s.time} className="bg-green-50 rounded-lg p-2.5 text-center">
                      <span className="text-base">{s.icon}</span>
                      <p className="font-bold text-gray-900 text-[11px] mt-0.5">{s.time}</p>
                      <p className="text-[10px] text-gray-500">{s.event}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 mb-2">📊 週間</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { time: "毎週月曜 0:00", event: "前週分（月〜日）の自動集計", icon: "⚙️" },
                    { time: "毎週月曜 1:00", event: "Weekly Star ランキング更新", icon: "⭐" },
                    { time: "毎週月曜 2:00", event: "受賞者にメール通知", icon: "📧" },
                  ].map((s) => (
                    <div key={s.time} className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <span className="text-base">{s.icon}</span>
                      <p className="font-bold text-gray-900 text-[11px] mt-0.5">{s.time}</p>
                      <p className="text-[10px] text-gray-500">{s.event}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 mb-2">🏆 月間</p>
                <div className="grid sm:grid-cols-4 gap-2">
                  {[
                    { time: "1日 0:00", event: "前月データ自動集計", icon: "⚙️" },
                    { time: "2日", event: "ランキング確定・通知", icon: "📧" },
                    { time: "3日", event: "アワードページ公開", icon: "🏆" },
                    { time: "〜月末", event: "当月データ蓄積", icon: "📊" },
                  ].map((s) => (
                    <div key={s.time} className="bg-amber-50 rounded-lg p-2.5 text-center">
                      <span className="text-base">{s.icon}</span>
                      <p className="font-bold text-gray-900 text-[11px] mt-0.5">{s.time}</p>
                      <p className="text-[10px] text-gray-500">{s.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* アワードページの表示例 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">アワードページの表示イメージ</h2>
          <p className="text-gray-500 text-sm text-center mb-10">自動生成されるアワードページのレイアウト例</p>

          {/* 期間切り替えタブ */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { label: "📅 デイリー", color: "bg-green-100 text-green-700 border-green-300" },
              { label: "📊 週間", color: "bg-blue-100 text-blue-700 border-blue-300" },
              { label: "🏆 月間", color: "bg-amber-100 text-amber-700 border-amber-300" },
            ].map((tab, i) => (
              <span key={tab.label} className={`text-xs px-4 py-2 rounded-full font-bold border ${i === 2 ? tab.color : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {tab.label}
              </span>
            ))}
          </div>

          {/* プレビュー */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
            <div className="text-center mb-6">
              <p className="text-xs text-amber-600 font-bold tracking-wider">2026年3月度</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-1">月間アワード 🏆</h3>
              <p className="text-xs text-gray-400 mt-1">集計期間: 2026/03/01 〜 2026/03/31</p>
            </div>

            {/* カテゴリータブ例 */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {categories.slice(0, 4).map((cat, i) => (
                <span key={cat.id} className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  i === 0 ? "bg-orange-100 text-orange-700 border border-orange-300" : "bg-gray-100 text-gray-500"
                }`}>
                  {cat.icon} {cat.name}
                </span>
              ))}
              <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">...</span>
            </div>

            {/* ランキング例 */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { metric: "月間売上高", icon: "💰" },
                { metric: "平均レビュースコア", icon: "⭐" },
                { metric: "プルーフチェーンスコア", icon: "🔐" },
                { metric: "LP コンバージョン率", icon: "🎯" },
              ].map((m) => (
                <div key={m.metric} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 text-xs mb-3">
                    <span className="mr-1">{m.icon}</span>{m.metric}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { rank: "🥇", name: "○○食品株式会社", value: "表示", barWidth: "w-full" },
                      { rank: "🥈", name: "△△メーカー", value: "表示", barWidth: "w-4/5" },
                      { rank: "🥉", name: "□□ブランド", value: "表示", barWidth: "w-3/5" },
                    ].map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <span>{entry.rank}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-gray-700 font-medium">{entry.name}</span>
                            <span className="text-gray-400">{entry.value}</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full">
                            <div className={`h-full bg-amber-400 rounded-full ${entry.barWidth}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              ※ 上記はレイアウトの参考イメージです。実際の数値は集計結果に基づき自動表示されます。
            </p>
          </div>
        </section>

        {/* ロール別ランキング */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">ロール別ランキング</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
            メーカー・販売代理店・クリエイター・紹介者それぞれの視点で独立したランキングを自動生成。各ロールの貢献度を正当に評価します。
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* メーカーランキング */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏭</span>
                  <div>
                    <h3 className="font-bold">メーカーランキング</h3>
                    <p className="text-blue-200 text-xs">カテゴリー別×メーカー単位</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { icon: "💰", metric: "カテゴリー別 売上高ランキング", desc: "各カテゴリー内でのメーカー別月間売上額" },
                  { icon: "📦", metric: "販売件数ランキング", desc: "受注件数の多いメーカーを表彰" },
                  { icon: "⭐", metric: "バイヤー評価ランキング", desc: "平均レビュースコアの高いメーカー" },
                  { icon: "🔐", metric: "プルーフチェーン達成ランキング", desc: "証明書類の充実度が高いメーカー" },
                  { icon: "👥", metric: "新規バイヤー獲得ランキング", desc: "新規取引先を最も多く獲得したメーカー" },
                  { icon: "🔄", metric: "リピート率ランキング", desc: "バイヤーのリピート購入率が高いメーカー" },
                  { icon: "⚡", metric: "問い合わせ対応速度ランキング", desc: "バイヤーへの応答が最も早いメーカー" },
                ].map((item) => (
                  <div key={item.metric} className="flex items-start gap-2 text-xs">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.metric}</p>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 販売代理店ランキング */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-purple-600 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h3 className="font-bold">販売代理店ランキング</h3>
                    <p className="text-purple-200 text-xs">代理店の営業実績評価</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { icon: "💰", metric: "代理店別 売上高ランキング", desc: "LP経由・直接販売合計の月間売上額" },
                  { icon: "📦", metric: "販売件数ランキング", desc: "成立した取引件数の多い代理店" },
                  { icon: "🏭", metric: "取り扱いメーカー数ランキング", desc: "多くのメーカー商品を販売している代理店" },
                  { icon: "👥", metric: "新規バイヤー開拓ランキング", desc: "新規の購入企業を獲得した代理店" },
                  { icon: "🤝", metric: "共同購入成立ランキング", desc: "共同購入グループをまとめた件数" },
                  { icon: "🔨", metric: "オークション落札総額ランキング", desc: "オークション経由の取引額が大きい代理店" },
                ].map((item) => (
                  <div key={item.metric} className="flex items-start gap-2 text-xs">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.metric}</p>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* クリエイターランキング */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-pink-600 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h3 className="font-bold">クリエイターランキング</h3>
                    <p className="text-pink-200 text-xs">LP作成・SNS拡散の成果評価</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { icon: "💰", metric: "LP経由 売上高ランキング", desc: "クリエイターのLP経由で発生した月間売上合計" },
                  { icon: "🎯", metric: "コンバージョン率ランキング", desc: "LP閲覧→購入完了率の高いクリエイター" },
                  { icon: "👁️", metric: "LP閲覧数ランキング", desc: "最も多くの閲覧を集めたLPの作成者" },
                  { icon: "📱", metric: "SNS流入ランキング", desc: "SNS経由のLP流入が最も多いクリエイター" },
                  { icon: "⭐", metric: "バイヤー評価ランキング", desc: "LP購入者からの評価が高いクリエイター" },
                  { icon: "🎬", metric: "LP作成数ランキング", desc: "アクティブなLP数が多いクリエイター" },
                  { icon: "🏭", metric: "提携メーカー数ランキング", desc: "多くのメーカーから販売許可を得ているクリエイター" },
                ].map((item) => (
                  <div key={item.metric} className="flex items-start gap-2 text-xs">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.metric}</p>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 紹介者ランキング */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-amber-600 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📣</span>
                  <div>
                    <h3 className="font-bold">紹介者ランキング</h3>
                    <p className="text-amber-200 text-xs">グループ紹介フィー・アフィリエイト評価</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { icon: "👥", metric: "紹介登録数ランキング", desc: "紹介リンク経由で新規登録したユーザー数" },
                  { icon: "💰", metric: "紹介経由 売上高ランキング", desc: "紹介したメンバーの合計売上額" },
                  { icon: "🏭", metric: "メーカー紹介ランキング", desc: "プラットフォームに紹介したメーカー数" },
                  { icon: "🎤", metric: "インフルエンサー紹介ランキング", desc: "紹介したクリエイター/インフルエンサー数" },
                  { icon: "📈", metric: "紹介先 継続率ランキング", desc: "紹介した人がアクティブに活動している割合" },
                  { icon: "🤝", metric: "グループ紹介フィー獲得ランキング", desc: "グループ紹介フィーの獲得ポイント合計" },
                ].map((item) => (
                  <div key={item.metric} className="flex items-start gap-2 text-xs">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.metric}</p>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ランキングの閲覧単位 */}
          <div className="mt-8 bg-gray-100 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-4 text-center">ランキングの閲覧単位</h3>
            <p className="text-xs text-gray-500 text-center mb-4">
              すべてのランキングは以下の切り口で絞り込み・閲覧できます
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "集計期間", options: "デイリー / 週間 / 月間", icon: "📅" },
                { label: "カテゴリー", options: "食品 / 化粧品 / 家電 / アパレル / サービス / 映像 / 産業用", icon: "🏷️" },
                { label: "ロール", options: "メーカー / 代理店 / クリエイター / 紹介者", icon: "👤" },
                { label: "地域", options: "全国 / 都道府県別 / 海外", icon: "🌏" },
              ].map((filter) => (
                <div key={filter.label} className="bg-white rounded-xl p-4 text-center">
                  <span className="text-xl">{filter.icon}</span>
                  <p className="font-bold text-gray-900 text-xs mt-1">{filter.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{filter.options}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 受賞バッジの表示 */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">受賞バッジの活用</h2>
          <p className="text-gray-500 text-sm text-center mb-10">受賞バッジはプロフィール・LP・商品ページに自動表示されます</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-3xl mb-3">👤</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">パートナープロフィール</h4>
              <p className="text-xs text-gray-500">プロフィールページに受賞バッジと受賞歴を自動表示。メーカーやバイヤーからの信頼度が向上。</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">LP・商品ページ</h4>
              <p className="text-xs text-gray-500">受賞メーカーの商品ページやクリエイターのLPにバッジが表示され、購入者の安心感を向上。</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">検索結果・ランキング</h4>
              <p className="text-xs text-gray-500">AIエージェントの検索結果やランキングページで受賞バッジが優先表示のシグナルに。</p>
            </div>
          </div>
        </section>

        {/* API連携 */}
        <section className="bg-slate-900 text-white rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-center mb-3">自動生成のしくみ</h2>
          <p className="text-gray-400 text-sm text-center mb-8 max-w-xl mx-auto">
            アワードページは完全自動で生成されます。管理者の手動操作は不要です。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "集計バッチ（3種類）", desc: "デイリー(毎日0:00)・週間(月曜0:00)・月間(1日0:00)の3つのCronジョブが自動起動。12指標×7カテゴリーで集計。", icon: "⏰" },
              { title: "ランキング計算", desc: "デイリーTOP3・週間TOP5・月間TOP10を抽出し、各ランクを自動判定。", icon: "📐" },
              { title: "ページ生成", desc: "集計結果をもとにアワードページを自動レンダリング。デイリー30日・週間52週・月間は無期限アーカイブ。", icon: "🖥️" },
              { title: "通知・バッジ付与", desc: "週間はメール通知、月間はメール+バッジ+手数料割引を自動付与。", icon: "🔔" },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold mb-3">あなたもアワード受賞を目指しませんか？</h2>
          <p className="text-amber-100 text-sm mb-6 max-w-xl mx-auto">
            パートナー登録をすると、自動的にアワードの評価対象になります。
            品質の高い取引を続けることで、バッジと特典を獲得できます。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup" className="bg-white text-amber-700 font-bold px-6 py-3 rounded-lg hover:bg-amber-50 text-sm transition">
              無料で登録する
            </Link>
            <Link href="/flow" className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 text-sm transition">
              業務フローを見る
            </Link>
          </div>
        </section>

      </div>

      <footer className="bg-slate-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs">
          &copy; 2026 単品決済ロットLP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
