import { createSupabaseServerClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  gratitude: { label: "感謝", icon: "🙏", color: "bg-amber-100 text-amber-800" },
  emotion: { label: "感動", icon: "✨", color: "bg-pink-100 text-pink-800" },
  choice_reason: { label: "選択理由", icon: "💡", color: "bg-blue-100 text-blue-800" },
  goal: { label: "ゴール", icon: "🎯", color: "bg-green-100 text-green-800" },
  other: { label: "その他", icon: "📝", color: "bg-gray-100 text-gray-800" },
};

export default async function AdminNonFinancialPage() {
  const supabase = await createSupabaseServerClient();

  const { data: insights } = await supabase
    .from("non_financial_insights")
    .select("*, products(name), partners(company_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const counts: Record<string, number> = { gratitude: 0, emotion: 0, choice_reason: 0, goal: 0, other: 0 };
  for (const row of insights || []) {
    const cat = row.category as string;
    if (cat in counts) counts[cat]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">非財務インサイト（全体）</h1>
      <p className="text-sm text-gray-500 mb-6">全パートナーの感謝・感動・選択理由・ゴールを一元管理</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {Object.entries(CATEGORY_LABELS).map(([key, { label, icon, color }]) => (
          <div key={key} className="bg-white rounded-xl border shadow-sm p-4 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts[key] || 0}</p>
            <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-orange-50/40 border border-orange-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-orange-800">
          合計 <span className="font-bold">{total}</span> 件（RAGデータベース蓄積中）。
          pgvector有効化後、ベクトル検索によるAI分析が可能になります。
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">カテゴリ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">内容</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">パートナー</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">日時</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(insights || []).map((row: Record<string, unknown>) => {
              const cat = CATEGORY_LABELS[row.category as string] || CATEGORY_LABELS.other;
              return (
                <tr key={row.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cat.color}`}>
                      {cat.icon} {cat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-md">
                    <p className="truncate">{row.content as string}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {(row.products as { name: string } | null)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {(row.partners as { company_name: string } | null)?.company_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(row.created_at as string).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
