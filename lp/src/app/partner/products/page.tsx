import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { DataTable } from "@/components/admin/DataTable";

export default async function PartnerProductsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "name", label: "商品名" },
    {
      key: "base_price",
      label: "価格",
      render: (p: { base_price: number }) =>
        `¥${p.base_price.toLocaleString()}`,
    },
    { key: "slug", label: "スラッグ" },
    {
      key: "is_active",
      label: "状態",
      render: (p: { is_active: boolean }) => (
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
          href="/partner/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規登録
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={products ?? []}
        editHref={(p) => `/partner/products/${p.id}`}
      />
    </div>
  );
}
