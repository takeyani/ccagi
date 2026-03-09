import { requireBuyerId } from "@/lib/auth";
import { PartnerStatsCard } from "@/components/partner/StatsCard";

export default async function BuyerDashboardPage() {
  const { buyerId, supabase } = await requireBuyerId();

  const [
    { count: agentCount },
    { count: pendingCount },
    { count: purchasedCount },
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
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4">
        <PartnerStatsCard label="エージェント数" value={agentCount ?? 0} />
        <PartnerStatsCard label="未確認結果" value={pendingCount ?? 0} />
        <PartnerStatsCard label="購入済み" value={purchasedCount ?? 0} />
      </div>
    </div>
  );
}
