import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, partners(company_name)")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "商品名" },
    {
      key: "partner_id",
      label: "取引先",
      render: (p: Record<string, unknown>) =>
        (p.partners as { company_name: string } | null)?.company_name ?? "-",
    },
    {
      key: "base_price",
      label: "価格",
      render: (p: Product) => `¥${p.base_price.toLocaleString()}`,
    },
    { key: "slug", label: "スラッグ" },
    {
      key: "is_active",
      label: "状態",
      render: (p: Product) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            p.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {p.is_active ? "有効" : "無効"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={products ?? []}
        editHref={(p) => `/admin/products/${p.id}`}
      />
    </div>
  );
}
