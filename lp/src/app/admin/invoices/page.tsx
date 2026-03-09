import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminInvoicesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, partners(company_name)")
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
    {
      key: "partners",
      label: "取引先",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (inv: any) => inv.partners?.company_name ?? "-",
    },
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
      render: (inv: Record<string, unknown>) => {
        const s = inv.status as string;
        // 期限超過ハイライト
        const isOverdue =
          s === "送付済み" &&
          inv.due_date &&
          new Date(inv.due_date as string) < new Date();
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              isOverdue
                ? "bg-red-100 text-red-700"
                : statusBadge[s] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {isOverdue ? "期限超過" : s}
          </span>
        );
      },
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
      <h1 className="text-2xl font-bold mb-6">請求書一覧（全取引先）</h1>
      <DataTable columns={columns} data={invoices ?? []} />
    </div>
  );
}
