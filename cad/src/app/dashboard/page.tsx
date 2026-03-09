import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: projectCount } = await supabase
    .from("cad_projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: fileCount } = await supabase
    .from("cad_files")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { data: recentFiles } = await supabase
    .from("cad_files")
    .select("id, file_name, file_size, created_at, project_id, cad_projects(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard label="プロジェクト数" value={projectCount ?? 0} />
        <StatsCard label="ファイル数" value={fileCount ?? 0} />
        <StatsCard label="ステータス" value="Active" sub="IFC 3D Viewer" />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近のファイル</h2>
          <Link
            href="/dashboard/projects"
            className="text-blue-600 text-sm hover:underline"
          >
            すべて表示
          </Link>
        </div>

        {recentFiles && recentFiles.length > 0 ? (
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <Link
                    href={`/dashboard/viewer/${file.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {file.file_name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(file.cad_projects as unknown as { name: string } | null)?.name ?? "不明"} ・{" "}
                    {formatBytes(file.file_size)}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(file.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            まだファイルがありません。プロジェクトを作成してIFCファイルをアップロードしましょう。
          </p>
        )}
      </div>
    </div>
  );
}
