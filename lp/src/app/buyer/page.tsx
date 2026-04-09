import { Suspense } from "react";
import Link from "next/link";
import { requireBuyerId } from "@/lib/auth";
import { PartnerStatsCard } from "@/components/partner/StatsCard";
import { AccessDeniedBanner } from "@/components/shared/AccessDeniedBanner";

export default async function BuyerDashboardPage() {
  const { buyerId, supabase } = await requireBuyerId();

  const [
    { count: agentCount },
    { count: pendingCount },
    { count: purchasedCount },
    { count: inquiryCount },
    { count: activeBidCount },
  ] = await Promise.all([
    supabase
      .from("buying_agents")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", buyerId),
    supabase
      .from("agent_results")
      .select("*, buying_agents!inner(owner_id)", { count: "exact", head: true })
      .eq("buying_agents.owner_id", buyerId)
      .eq("status", "未確認"),
    supabase
      .from("agent_results")
      .select("*, buying_agents!inner(owner_id)", { count: "exact", head: true })
      .eq("buying_agents.owner_id", buyerId)
      .eq("status", "購入済み"),
    supabase
      .from("agent_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", buyerId),
    supabase
      .from("auto_bid_logs")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", buyerId),
  ]);

  // 最近の結果
  const { data: recentResults } = await supabase
    .from("agent_results")
    .select("id, total_score, status, created_at, products(name), buying_agents!inner(owner_id, name)")
    .eq("buying_agents.owner_id", buyerId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <Suspense><AccessDeniedBanner /></Suspense>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        <PartnerStatsCard label="エージェント数" value={agentCount ?? 0} />
        <PartnerStatsCard label="未確認結果" value={pendingCount ?? 0} />
        <PartnerStatsCard label="購入済み" value={purchasedCount ?? 0} />
        <PartnerStatsCard label="注文数" value={inquiryCount ?? 0} />
        <PartnerStatsCard label="自動入札" value={activeBidCount ?? 0} />
      </div>

      {/* 最近の検索結果 */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最近のエージェント結果</h2>
          <Link href="/buyer/agents" className="text-sm text-orange-600 hover:underline">すべて見る</Link>
        </div>
        {(recentResults && recentResults.length > 0) ? (
          <div className="space-y-2">
            {recentResults.map((r: Record<string, unknown>) => {
              const product = r.products as { name: string } | null;
              const agent = r.buying_agents as { name: string } | null;
              const statusColors: Record<string, string> = {
                "未確認": "bg-yellow-100 text-yellow-800",
                "確認済み": "bg-blue-100 text-blue-800",
                "購入済み": "bg-green-100 text-green-800",
                "却下": "bg-gray-100 text-gray-600",
              };
              return (
                <div key={r.id as string} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product?.name ?? "商品"}</p>
                    <p className="text-xs text-gray-500">{agent?.name ?? "エージェント"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-orange-600">{(r.total_score as number)?.toFixed(1)}点</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status as string] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.status as string}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">まだ結果がありません</p>
        )}
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/buyer/agents/new" className="bg-orange-50/40 border border-orange-200 rounded-xl p-4 hover:bg-orange-100/60 transition text-center">
          <span className="text-2xl">🤖</span>
          <p className="text-sm font-medium text-orange-700 mt-1">新しいエージェント作成</p>
        </Link>
        <Link href="/buyer/inquiries" className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition text-center">
          <span className="text-2xl">📋</span>
          <p className="text-sm font-medium text-amber-700 mt-1">注文リストを確認</p>
        </Link>
        <Link href="/buyer/orders" className="bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition text-center">
          <span className="text-2xl">🧾</span>
          <p className="text-sm font-medium text-green-700 mt-1">購入履歴を見る</p>
        </Link>
      </div>
    </div>
  );
}
