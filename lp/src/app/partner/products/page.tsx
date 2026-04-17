import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">商品名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">バーコード</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">価格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状態</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  商品がありません。「新規登録」または「CSV一括登録」から追加してください。
                </td>
              </tr>
            ) : (
              products.map((p: { id: string; name: string; barcode?: string; base_price: number; slug: string; is_active: boolean }) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.barcode || "-"}</td>
                  <td className="px-4 py-3">¥{p.base_price?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {p.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/partner/products/${p.id}`} className="text-orange-600 hover:underline text-xs">
                      編集
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
