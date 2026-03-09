import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/estimation/engine";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Stats
  const { count: totalEstimates } = await supabase
    .from("estimator_estimates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: totalCustomers } = await supabase
    .from("estimator_customers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { data: wonEstimates } = await supabase
    .from("estimator_estimates")
    .select("total")
    .eq("user_id", user!.id)
    .eq("status", "受注");

  const totalRevenue = wonEstimates?.reduce((sum, e) => sum + (e.total || 0), 0) ?? 0;

  // Recent estimates
  const { data: recentEstimates } = await supabase
    .from("estimator_estimates")
    .select("id, estimate_number, title, status, total, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Link
          href="/dashboard/estimates/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規見積もり作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard label="見積もり数" value={totalEstimates ?? 0} />
        <StatsCard label="顧客数" value={totalCustomers ?? 0} />
        <StatsCard
          label="受注金額合計"
          value={`¥${formatCurrency(totalRevenue)}`}
        />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold">最近の見積もり</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  見積番号
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  案件名
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  ステータス
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  合計金額
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  作成日
                </th>
              </tr>
            </thead>
            <tbody>
              {(!recentEstimates || recentEstimates.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    見積もりがありません
                  </td>
                </tr>
              ) : (
                recentEstimates.map((est) => (
                  <tr key={est.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/estimates/${est.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {est.estimate_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{est.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={est.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      ¥{formatCurrency(est.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(est.created_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "下書き": "bg-gray-100 text-gray-700",
    "送付済み": "bg-blue-100 text-blue-700",
    "受注": "bg-green-100 text-green-700",
    "失注": "bg-red-100 text-red-700",
    "アーカイブ": "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
