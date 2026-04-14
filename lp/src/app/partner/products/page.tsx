import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/DataTable";

async function getProducts() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("partner_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.partner_id) return [];

    const { data: products } = await admin
      .from("products")
      .select("*")
      .eq("partner_id", profile.partner_id)
      .order("created_at", { ascending: false });

    return products ?? [];
  } catch {
    return [];
  }
}

export default async function PartnerProductsPage() {
  const products = await getProducts();

  const columns = [
    { key: "name", label: "商品名" },
    {
      key: "base_price",
      label: "価格",
      render: (p: { base_price: number }) =>
        `¥${p.base_price?.toLocaleString() ?? 0}`,
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
        <div className="flex gap-2">
          <Link
            href="/partner/products/import"
            className="border border-orange-600 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50/40 text-sm font-medium"
          >
            CSV一括登録
          </Link>
          <Link
            href="/partner/products/new"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
          >
            新規登録
          </Link>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={products}
        editHref={(p) => `/partner/products/${p.id}`}
      />
    </div>
  );
}
