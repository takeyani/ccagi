import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/estimation/engine";

export default async function EstimatesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: estimates } = await supabase
    .from("estimator_estimates")
    .select("id, estimate_number, title, project_type, status, total, customer_company_name, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">見積もり一覧</h1>
        <Link
          href="/dashboard/estimates/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規見積もり作成
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">見積番号</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">案件名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">顧客</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">合計金額</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {(!estimates || estimates.length === 0) ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    見積もりがありません
                  </td>
                </tr>
              ) : (
                estimates.map((est) => (
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
                    <td className="px-4 py-3 text-gray-500">{est.customer_company_name || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={est.status} />
                    </td>
                    <td className="px-4 py-3 text-right">¥{formatCurrency(est.total)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(est.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/estimates/${est.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
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
