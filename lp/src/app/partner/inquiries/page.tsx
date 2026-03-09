import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function PartnerInquiriesPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: inquiries } = await supabase
    .from("agent_inquiries")
    .select(
      `*,
       products(name),
       lots(lot_number),
       user_profiles:buyer_id(display_name)`
    )
    .eq("partner_id", partnerId)
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
      key: "buyer",
      label: "バイヤー",
      render: (i: any) => i.user_profiles?.display_name ?? "-",
    },
    {
      key: "buyer_price",
      label: "希望価格",
      render: (i: any) =>
        i.buyer_price != null
          ? `¥${Number(i.buyer_price).toLocaleString()}`
          : "-",
    },
    {
      key: "total_score",
      label: "スコア",
      render: (i: any) => (
        <span className="font-medium text-teal-600">
          {Number(i.total_score).toFixed(1)}
        </span>
      ),
    },
    {
      key: "partner_status",
      label: "ステータス",
      render: (i: any) => statusBadge(i.partner_status),
    },
    {
      key: "created_at",
      label: "受信日",
      render: (i: any) =>
        new Date(i.created_at).toLocaleDateString("ja-JP"),
    },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">引合い管理</h1>
      <DataTable
        columns={columns}
        data={inquiries ?? []}
        editHref={(i) => `/partner/inquiries/${i.id}`}
      />
    </div>
  );
}
