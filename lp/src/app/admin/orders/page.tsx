import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: purchases } = await supabase
    .from("lot_purchases")
    .select("*, lots(lot_number, price, products(name, base_price))")
    .order("created_at", { ascending: false });

  const columns = [
    {
      key: "lots",
      label: "商品",
      render: (p: Record<string, unknown>) => {
        const lot = p.lots as {
          lot_number: string;
          products: { name: string } | null;
        } | null;
        return lot?.products?.name ?? "-";
      },
    },
    {
      key: "lot_number",
      label: "ロット番号",
      render: (p: Record<string, unknown>) => {
        const lot = p.lots as { lot_number: string } | null;
        return lot?.lot_number ?? "-";
      },
    },
    {
      key: "price",
      label: "金額",
      render: (p: Record<string, unknown>) => {
        const lot = p.lots as {
          price: number | null;
          products: { base_price: number } | null;
        } | null;
        const price = lot?.price ?? lot?.products?.base_price ?? 0;
        return `¥${price.toLocaleString()}`;
      },
    },
    { key: "stripe_session_id", label: "Stripe Session" },
    { key: "created_at", label: "購入日時" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">注文一覧</h1>
      <DataTable
        columns={columns}
        data={purchases ?? []}
      />
    </div>
  );
}
