import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getLots() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin.from("user_profiles").select("partner_id").eq("id", user.id).maybeSingle();
    if (!profile?.partner_id) return null;

    const { data } = await admin
      .from("lots")
      .select("*, products!inner(name, partner_id)")
      .eq("products.partner_id", profile.partner_id)
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch {
    return null;
  }
}

export default async function PartnerLotsPage() {
  const lots = await getLots();
  if (lots === null) redirect("/login");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ロット管理</h1>
        <Link href="/partner/lots/new" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium">
          新規作成
        </Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">ロット番号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">商品</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">在庫</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">販売価格</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">賞味期限</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">ロットがありません</td></tr>
            ) : (
              lots.map((l: { id: string; lot_number: string; products: { name: string }; stock: number; status: string; price: number | null; expiration_date: string | null }) => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{l.lot_number}</td>
                  <td className="px-4 py-3">{l.products?.name ?? "-"}</td>
                  <td className="px-4 py-3">{l.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      l.status === "販売中" ? "bg-green-100 text-green-700" : l.status === "売切れ" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                    }`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3">{l.price ? `¥${l.price.toLocaleString()}` : "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{l.expiration_date ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/partner/lots/${l.id}`} className="text-orange-600 hover:underline text-xs">編集</Link>
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
