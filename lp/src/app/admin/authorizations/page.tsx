import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "商品承認管理" };

const statusBadge: Record<string, string> = {
  "申請中": "bg-yellow-100 text-yellow-800",
  "承認済み": "bg-green-100 text-green-800",
  "却下": "bg-red-100 text-red-800",
  "取消": "bg-gray-100 text-gray-600",
};

export default async function AdminAuthorizationsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: authorizations } = await supabase
    .from("product_authorizations")
    .select("*, products(name), partners!product_authorizations_authorized_party_id_fkey(company_name)")
    .order("created_at", { ascending: false });

  const counts = {
    total: authorizations?.length ?? 0,
    pending: authorizations?.filter((a) => a.status === "申請中").length ?? 0,
    approved: authorizations?.filter((a) => a.status === "承認済み").length ?? 0,
    rejected: authorizations?.filter((a) => a.status === "却下").length ?? 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">商品承認管理</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-xs text-gray-500">全承認</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
          <p className="text-xs text-gray-500">申請中</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
          <p className="text-xs text-gray-500">承認済み</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
          <p className="text-xs text-gray-500">却下</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">商品</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">承認先</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">種別</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">許可アクション</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">申請日</th>
            </tr>
          </thead>
          <tbody>
            {(authorizations ?? []).map((auth: Record<string, unknown>) => {
              const product = auth.products as { name: string } | null;
              const partner = auth.partners as { company_name: string } | null;
              const status = auth.status as string;
              return (
                <tr key={auth.id as string} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{product?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{partner?.company_name ?? (auth.authorized_party_type === "creator" ? "クリエイター" : "-")}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{auth.authorized_party_type as string}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {Array.isArray(auth.authorized_actions) ? (auth.authorized_actions as string[]).join(", ") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[status] ?? "bg-gray-100 text-gray-600"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(auth.created_at as string).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              );
            })}
            {(!authorizations || authorizations.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">承認データがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
