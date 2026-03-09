import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { Survey } from "@/lib/types";

export default async function AdminSurveysPage() {
  const supabase = await createSupabaseServerClient();
  const { data: surveys } = await supabase
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "title", label: "タイトル" },
    {
      key: "target_type",
      label: "対象",
      render: (s: Survey) => {
        const labels: Record<string, string> = {
          general: "汎用",
          product: "商品",
          lot: "ロット",
        };
        return labels[s.target_type] ?? s.target_type;
      },
    },
    {
      key: "is_active",
      label: "状態",
      render: (s: Survey) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            s.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {s.is_active ? "有効" : "無効"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "作成日",
      render: (s: Survey) =>
        new Date(s.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">アンケート管理</h1>
        <Link
          href="/admin/surveys/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={surveys ?? []}
        editHref={(s) => `/admin/surveys/${s.id}`}
      />
    </div>
  );
}
