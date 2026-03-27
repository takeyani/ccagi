import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.3) 0%, transparent 50%)' }} />

        {/* Content */}
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8 px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-sm backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
              AI-Powered Manga Creation
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              <span className="text-gradient">漫画</span>ジェネレーター
            </h1>
            <p className="text-xl text-slate-400 max-w-md mx-auto leading-relaxed">
              テキストを入力するだけで、AIが自動で<br />漫画を生成します
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 font-medium backdrop-blur-sm border border-white/10"
              >
                新規登録
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center pt-8">
              {["14種のアートスタイル", "3つの画像AI", "D&Dエディタ", "PNG/PDF出力"].map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs border border-white/5">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch stats
  const [projectsRes, charsRes, gensRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("characters").select("id").eq("user_id", user.id),
    supabase
      .from("generations")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentProjects = projectsRes.data || [];
  const charCount = charsRes.data?.length || 0;
  const recentGenerations = gensRes.data || [];

  const stats = [
    { label: "プロジェクト", value: recentProjects.length, color: "from-indigo-500 to-blue-500", icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
    { label: "キャラクター", value: charCount, color: "from-purple-500 to-pink-500", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { label: "生成履歴", value: recentGenerations.length, color: "from-emerald-500 to-teal-500", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  ];

  return (
    <AppShell>
      <div className="p-8 space-y-8 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="text-slate-500 mt-1">漫画制作の管理画面</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
              </div>
              <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${s.color} opacity-5`} />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 text-sm font-medium shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新規プロジェクト
          </Link>
          <Link
            href="/characters/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            キャラクター追加
          </Link>
        </div>

        {/* Recent projects */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">最近のプロジェクト</h2>
          {recentProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-4">まだプロジェクトがありません</p>
              <Link
                href="/projects/new"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                最初のプロジェクトを作成 &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map(
                (p: { id: string; title: string; status: string; updated_at: string }) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">{p.title}</span>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(p.updated_at).toLocaleDateString("ja-JP")}
                        </div>
                      </div>
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
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* Recent generations */}
        {recentGenerations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">生成履歴</h2>
            <div className="space-y-2">
              {recentGenerations.map(
                (g: { id: string; status: string; created_at: string }) => (
                  <div
                    key={g.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        g.status === "completed" ? "bg-emerald-500" : g.status === "failed" ? "bg-red-500" : "bg-amber-500 animate-pulse"
                      }`} />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        g.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : g.status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {g.status === "completed" ? "完了" : g.status === "failed" ? "失敗" : "処理中"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(g.created_at).toLocaleString("ja-JP")}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
