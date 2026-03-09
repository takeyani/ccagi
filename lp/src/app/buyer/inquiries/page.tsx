import { requireBuyerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function BuyerInquiriesPage() {
  const { buyerId, supabase } = await requireBuyerId();

  const { data: inquiries } = await supabase
    .from("agent_inquiries")
    .select(
      `*,
       products(name),
       lots(lot_number, price),
       partners(company_name)`
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      新規: "bg-blue-100 text-blue-700",
      対応中: "bg-yellow-100 text-yellow-700",
      承諾: "bg-green-100 text-green-700",
      辞退: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const columns = [
    {
      key: "products",
      label: "商品名",
      render: (i: any) => i.products?.name ?? "-",
    },
    {
      key: "lots",
      label: "ロット",
      render: (i: any) => i.lots?.lot_number ?? "-",
    },
    {
      key: "partner",
      label: "取引先",
      render: (i: any) => i.partners?.company_name ?? "-",
    },
    {
      key: "buyer_price",
      label: "希望価格",
      render: (i: any) =>
        i.buyer_price != null ? `¥${Number(i.buyer_price).toLocaleString()}` : "-",
    },
    {
      key: "buyer_quantity",
      label: "数量",
      render: (i: any) => i.buyer_quantity ?? "-",
    },
    {
      key: "partner_status",
      label: "ステータス",
      render: (i: any) => statusBadge(i.partner_status),
    },
    {
      key: "rejection_reason",
      label: "辞退理由",
      render: (i: any) =>
        i.rejection_reason ? (
          <span className="text-red-600 text-xs">{i.rejection_reason}</span>
        ) : (
          "-"
        ),
    },
    {
      key: "created_at",
      label: "送信日",
      render: (i: any) =>
        new Date(i.created_at).toLocaleDateString("ja-JP"),
    },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">注文リスト</h1>
      {(!inquiries || inquiries.length === 0) ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-gray-400">
          まだ注文はありません。エージェントの結果から注文してください。
        </div>
      ) : (
        <DataTable columns={columns} data={inquiries} />
      )}
    </div>
  );
}
