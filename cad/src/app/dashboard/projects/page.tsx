import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/dashboard/DataTable";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("cad_projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "プロジェクト名" },
    { key: "description", label: "説明" },
    {
      key: "status",
      label: "ステータス",
      render: (item: { status: string }) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.status === "active" ? "アクティブ" : "アーカイブ"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "作成日",
      render: (item: { created_at: string }) =>
        new Date(item.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">プロジェクト一覧</h1>
        <Link
          href="/dashboard/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          新規プロジェクト
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={projects ?? []}
        editHref={(item) => `/dashboard/projects/${item.id}`}
        editLabel="詳細"
      />
    </div>
  );
}
