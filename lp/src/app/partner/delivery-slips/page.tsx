import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function DeliverySlipsListPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: slips } = await supabase
    .from("delivery_slips")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  const statusBadge: Record<string, string> = {
    下書き: "bg-gray-100 text-gray-600",
    発行済み: "bg-green-100 text-green-700",
  };

  const columns = [
    { key: "document_number", label: "納品番号" },
    { key: "buyer_company_name", label: "宛先" },
    { key: "subject", label: "件名" },
    {
      key: "total",
      label: "合計",
      render: (s: Record<string, unknown>) =>
        `¥${(s.total as number).toLocaleString()}`,
    },
    {
      key: "status",
      label: "ステータス",
      render: (s: Record<string, unknown>) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge[s.status as string] ?? "bg-gray-100 text-gray-600"}`}
        >
          {s.status as string}
        </span>
      ),
    },
    {
      key: "issue_date",
      label: "発行日",
      render: (s: Record<string, unknown>) =>
        new Date(s.issue_date as string).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">納品書一覧</h1>
        <Link
          href="/partner/delivery-slips/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={slips ?? []}
        editHref={(s) => `/partner/delivery-slips/${s.id}`}
      />
    </div>
  );
}
