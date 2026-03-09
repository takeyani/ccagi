import Link from "next/link";
import { requireBuyerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function BuyerAgentsPage() {
  const { buyerId, supabase } = await requireBuyerId();

  const { data: agents } = await supabase
    .from("buying_agents")
    .select("*")
    .eq("owner_id", buyerId)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "エージェント名" },
    {
      key: "status",
      label: "ステータス",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (a: any) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            a.status === "有効"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {a.status}
        </span>
      ),
    },
    { key: "keyword", label: "キーワード" },
    {
      key: "last_run_at",
      label: "最終実行",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (a: any) =>
        a.last_run_at
          ? new Date(a.last_run_at).toLocaleString("ja-JP")
          : "未実行",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">購買エージェント</h1>
        <Link
          href="/buyer/agents/new"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium text-sm"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={agents ?? []}
        editHref={(a) => `/buyer/agents/${a.id}`}
      />
    </div>
  );
}
