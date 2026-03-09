import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import Link from "next/link";

export default async function AdminCreatorDesignsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: designs } = await supabase
    .from("creator_lp_designs")
    .select("*, affiliates(name, code)")
    .order("created_at", { ascending: false });

  const columns = [
    {
      key: "creator",
      label: "クリエイター",
      render: (d: Record<string, unknown>) => {
        const aff = d.affiliates as Record<string, unknown> | null;
        return aff ? `${aff.name} (${aff.code})` : "-";
      },
    },
    { key: "slug", label: "スラッグ" },
    {
      key: "is_published",
      label: "状態",
      render: (d: Record<string, unknown>) =>
        d.is_published ? (
          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            公開中
          </span>
        ) : (
          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            下書き
          </span>
        ),
    },
    { key: "views_count", label: "PV数" },
    {
      key: "created_at",
      label: "作成日",
      render: (d: Record<string, unknown>) =>
        new Date(d.created_at as string).toLocaleDateString("ja-JP"),
    },
    {
      key: "actions",
      label: "",
      render: (d: Record<string, unknown>) => {
        const aff = d.affiliates as Record<string, unknown> | null;
        const code = aff?.code as string;
        const slug = d.slug as string;
        const lotId = d.lot_id as string;
        return d.is_published && code && slug && lotId ? (
          <Link
            href={`/c/${code}/${slug}/${lotId}`}
            target="_blank"
            className="text-indigo-600 hover:text-indigo-800 text-xs"
          >
            プレビュー
          </Link>
        ) : null;
      },
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Creator LP 管理</h1>
      <DataTable columns={columns} data={designs ?? []} />
    </div>
  );
}
