import { requireBuyerId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function BuyerOrdersPage() {
  const { buyerId } = await requireBuyerId();
  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from("agent_results")
    .select(
      `*,
       buying_agents!inner(owner_id, name),
       products(name, slug),
       lots(lot_number, price)`
    )
    .eq("buying_agents.owner_id", buyerId)
    .eq("status", "購入済み")
    .order("created_at", { ascending: false });

  const columns = [
    {
      key: "products",
      label: "商品名",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (r: any) => r.products?.name ?? "-",
    },
    {
      key: "lots",
      label: "ロット",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (r: any) => r.lots?.lot_number ?? "-",
    },
    {
      key: "buying_agents",
      label: "エージェント",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (r: any) => r.buying_agents?.name ?? "-",
    },
    {
      key: "total_score",
      label: "スコア",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (r: any) => Number(r.total_score).toFixed(1),
    },
    {
      key: "created_at",
      label: "日時",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (r: any) => new Date(r.created_at).toLocaleString("ja-JP"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">購入履歴</h1>
      <DataTable columns={columns} data={orders ?? []} />
    </div>
  );
}
