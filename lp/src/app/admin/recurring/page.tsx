import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { RecurringOrder } from "@/lib/types";

export default async function AdminRecurringPage() {
  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("recurring_orders")
    .select("*, products(name), partners(company_name)")
    .order("created_at", { ascending: false });

  type Row = RecurringOrder & {
    products: { name: string } | null;
    partners: { company_name: string } | null;
  };

  const columns = [
    {
      key: "products",
      label: "商品名",
      render: (o: Row) => o.products?.name ?? "-",
    },
    { key: "customer_name", label: "顧客名" },
    { key: "frequency", label: "頻度" },
    { key: "quantity", label: "数量" },
    {
      key: "next_delivery_date",
      label: "次回配送日",
    },
    {
      key: "status",
      label: "ステータス",
      render: (o: Row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            o.status === "有効"
              ? "bg-green-100 text-green-800"
              : o.status === "一時停止"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {o.status}
        </span>
      ),
    },
    { key: "total_deliveries", label: "累計配送" },
    {
      key: "created_at",
      label: "登録日",
      render: (o: Row) => new Date(o.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">定期購入管理</h1>
      <DataTable
        columns={columns}
        data={orders ?? []}
        editHref={(o) => `/admin/recurring/${o.id}`}
      />
    </div>
  );
}
