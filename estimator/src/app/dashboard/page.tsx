import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default async function DashboardPage() {
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
        <StatsCard label="見積もり数" value={0} />
        <StatsCard label="顧客数" value={0} />
        <StatsCard label="受注金額合計" value="¥0" />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold">最近の見積もり</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">見積番号</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">案件名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">合計金額</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  見積もりがありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
