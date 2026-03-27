import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShell>
      <div className="p-8 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">プロジェクト</h1>
            <p className="text-slate-500 mt-1">漫画プロジェクトの管理</p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 text-sm font-medium shadow-md shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新規作成
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">まだプロジェクトがありません</h3>
            <p className="text-slate-500 mb-6">最初のプロジェクトを作成して漫画を生成しましょう</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/20"
            >
              プロジェクトを作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p: { id: string; title: string; status: string; created_at: string; updated_at: string }) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/60 hover:border-indigo-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      p.status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : p.status === "generating"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.status === "completed" ? "完了" : p.status === "generating" ? "生成中" : "下書き"}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600">{p.title}</h3>
                <p className="text-xs text-slate-400">
                  {new Date(p.updated_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
