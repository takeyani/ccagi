import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { Tag } from "@/lib/types";

export default async function AdminTagsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "タグ名" },
    {
      key: "tag_type",
      label: "タイプ",
      render: (t: Tag) => (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
          {t.tag_type}
        </span>
      ),
    },
    { key: "slug", label: "スラッグ" },
    {
      key: "sort_order",
      label: "並び順",
    },
    {
      key: "is_active",
      label: "状態",
      render: (t: Tag) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            t.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {t.is_active ? "有効" : "無効"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">タグ管理</h1>
        <Link
          href="/admin/tags/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={tags ?? []}
        editHref={(t) => `/admin/tags/${t.id}`}
      />
    </div>
  );
}
