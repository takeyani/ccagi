import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminAffiliatesPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: affiliates }, { data: referrals }] = await Promise.all([
    supabase
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  // Fetch creator designs
  const { data: creatorDesigns } = await supabase
    .from("creator_lp_designs")
    .select("id, affiliate_id, slug, is_published, views_count")
    .order("created_at", { ascending: false });

  const affiliateColumns = [
    { key: "name", label: "名前" },
    { key: "email", label: "メール" },
    { key: "code", label: "コード" },
    {
      key: "is_creator",
      label: "タイプ",
      render: (a: Record<string, unknown>) =>
        a.is_creator ? (
          <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            クリエイター
          </span>
        ) : (
          <span className="text-gray-400 text-xs">アフィリエイター</span>
        ),
    },
    {
      key: "commission_rate",
      label: "手数料率",
      render: (a: Record<string, unknown>) => `${a.commission_rate}%`,
    },
    { key: "created_at", label: "登録日" },
  ];

  const referralColumns = [
    { key: "affiliate_code", label: "コード" },
    {
      key: "amount",
      label: "金額",
      render: (r: Record<string, unknown>) =>
        `¥${(r.amount as number).toLocaleString()}`,
    },
    {
      key: "commission",
      label: "コミッション",
      render: (r: Record<string, unknown>) =>
        `¥${(r.commission as number).toLocaleString()}`,
    },
    { key: "created_at", label: "日時" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">アフィリエイト管理</h1>
        <h2 className="text-lg font-semibold mb-3">アフィリエイター一覧</h2>
        <DataTable
          columns={affiliateColumns}
          data={affiliates ?? []}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">紹介実績</h2>
        <DataTable
          columns={referralColumns}
          data={referrals ?? []}
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Creator LP デザイン</h2>
        <DataTable
          columns={[
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
          ]}
          data={creatorDesigns ?? []}
        />
      </div>
    </div>
  );
}
