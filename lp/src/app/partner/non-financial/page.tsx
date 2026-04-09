import { requirePartnerId } from "@/lib/auth";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  gratitude: { label: "感謝", icon: "🙏", color: "bg-amber-100 text-amber-800" },
  emotion: { label: "感動", icon: "✨", color: "bg-pink-100 text-pink-800" },
  choice_reason: { label: "選択理由", icon: "💡", color: "bg-blue-100 text-blue-800" },
  goal: { label: "ゴール", icon: "🎯", color: "bg-green-100 text-green-800" },
  other: { label: "その他", icon: "📝", color: "bg-gray-100 text-gray-800" },
};

export default async function PartnerNonFinancialPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: insights } = await supabase
    .from("non_financial_insights")
    .select("*, products(name)")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(100);

  // カテゴリ別集計
  const counts: Record<string, number> = { gratitude: 0, emotion: 0, choice_reason: 0, goal: 0, other: 0 };
  for (const row of insights || []) {
    const cat = row.category as string;
    if (cat in counts) counts[cat]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">非財務インサイト</h1>
      <p className="text-sm text-gray-500 mb-6">お客様の感謝・感動・選択理由・ゴールを可視化します</p>

      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {Object.entries(CATEGORY_LABELS).map(([key, { label, icon, color }]) => (
          <div key={key} className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts[key] || 0}</p>
            <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${color}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-orange-50/40 border border-orange-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-orange-800">
          合計 <span className="font-bold">{total}</span> 件のインサイトが収集されています。
          このデータはRAGデータベースに蓄積され、AI分析やレポート生成に活用できます。
        </p>
      </div>

      {/* インサイト一覧 */}
      <div className="space-y-3">
        {(insights || []).map((insight: Record<string, unknown>) => {
          const cat = CATEGORY_LABELS[insight.category as string] || CATEGORY_LABELS.other;
          const product = insight.products as { name: string } | null;
          return (
            <div key={insight.id as string} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
                  {cat.icon} {cat.label}
                </span>
                {product && (
                  <span className="text-xs text-gray-400">{product.name}</span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(insight.created_at as string).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{insight.content as string}</p>
              {insight.customer_segment ? (
                <p className="text-xs text-gray-400 mt-2">回答者: {String(insight.customer_segment)}</p>
              ) : null}
            </div>
          );
        })}
        {(!insights || insights.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p>まだインサイトが収集されていません</p>
            <p className="text-xs mt-1">商品ページのアンケートから回答が届くと、ここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
}
