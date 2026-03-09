import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function InvoicesListPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  const statusBadge: Record<string, string> = {
    下書き: "bg-gray-100 text-gray-600",
    送付済み: "bg-blue-100 text-blue-700",
    入金済み: "bg-green-100 text-green-700",
    期限超過: "bg-red-100 text-red-600",
    取消: "bg-yellow-100 text-yellow-700",
  };

  const columns = [
    { key: "document_number", label: "請求番号" },
    { key: "buyer_company_name", label: "宛先" },
    { key: "subject", label: "件名" },
    {
      key: "total",
      label: "合計",
      render: (inv: Record<string, unknown>) =>
        `¥${(inv.total as number).toLocaleString()}`,
    },
    {
      key: "status",
      label: "ステータス",
      render: (inv: Record<string, unknown>) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadge[inv.status as string] ?? "bg-gray-100 text-gray-600"}`}
        >
          {inv.status as string}
        </span>
      ),
    },
    {
      key: "issue_date",
      label: "発行日",
      render: (inv: Record<string, unknown>) =>
        new Date(inv.issue_date as string).toLocaleDateString("ja-JP"),
    },
    {
      key: "due_date",
      label: "支払期限",
      render: (inv: Record<string, unknown>) =>
        inv.due_date
          ? new Date(inv.due_date as string).toLocaleDateString("ja-JP")
          : "-",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <Link
          href="/partner/invoices/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={invoices ?? []}
        editHref={(inv) => `/partner/invoices/${inv.id}`}
      />
    </div>
  );
}
