import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default async function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard label="プロジェクト数" value={0} />
        <StatsCard label="ファイル数" value={0} />
        <StatsCard label="ステータス" value="Active" sub="IFC 3D Viewer" />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">クイックアクセス</h2>
        </div>
        <div className="space-y-3">
          <Link
            href="/dashboard/viewer/local-test"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <span className="font-medium text-blue-600">3Dビューアを開く</span>
            <p className="text-xs text-gray-500 mt-1">ローカルのIFCファイルをドラッグ&ドロップで閲覧</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
