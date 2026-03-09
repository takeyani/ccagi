import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminDeliverySlipsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: slips } = await supabase
    .from("delivery_slips")
    .select("*, partners(company_name)")
    .order("created_at", { ascending: false });

  const statusBadge: Record<string, string> = {
    下書き: "bg-gray-100 text-gray-600",
    発行済み: "bg-green-100 text-green-700",
  };

  const columns = [
    { key: "document_number", label: "納品番号" },
    {
      key: "partners",
      label: "取引先",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (s: any) => s.partners?.company_name ?? "-",
    },
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
      <h1 className="text-2xl font-bold mb-6">納品書一覧（全取引先）</h1>
      <DataTable columns={columns} data={slips ?? []} />
    </div>
  );
}
