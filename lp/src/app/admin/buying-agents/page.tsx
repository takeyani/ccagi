import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminBuyingAgentsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: agents } = await supabase
    .from("buying_agents")
    .select("*, user_profiles(display_name)")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "エージェント名" },
    {
      key: "user_profiles",
      label: "オーナー",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (a: any) => a.user_profiles?.display_name ?? a.owner_id,
    },
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
    {
      key: "created_at",
      label: "作成日",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (a: any) => new Date(a.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">購買エージェント一覧</h1>
      <DataTable columns={columns} data={agents ?? []} />
    </div>
  );
}
