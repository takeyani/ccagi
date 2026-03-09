import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { BoardThread } from "@/lib/types";

export default async function AdminBoardsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: threads } = await supabase
    .from("board_threads")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "title", label: "タイトル" },
    { key: "author_name", label: "投稿者" },
    {
      key: "target_type",
      label: "対象",
      render: (t: BoardThread) =>
        t.target_type === "lot" ? "ロット" : "商品",
    },
    {
      key: "created_at",
      label: "作成日",
      render: (t: BoardThread) =>
        new Date(t.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">掲示板管理</h1>
      </div>
      <DataTable
        columns={columns}
        data={threads ?? []}
        editHref={(t) => `/admin/boards/${t.id}`}
      />
    </div>
  );
}
