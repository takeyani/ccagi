import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Link from "next/link";

const AVATAR_COLORS = [
  "from-indigo-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
  "from-violet-400 to-fuchsia-500",
];

export default async function CharactersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="p-8 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">キャラクター</h1>
            <p className="text-slate-500 mt-1">漫画に登場するキャラクターの管理</p>
          </div>
          <Link
            href="/characters/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 text-sm font-medium shadow-md shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新規作成
          </Link>
        </div>

        {!characters || characters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">まだキャラクターがいません</h3>
            <p className="text-slate-500 mb-6">キャラクターを登録すると、生成時に外見が一貫します</p>
            <Link
              href="/characters/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-medium shadow-md shadow-purple-500/20"
            >
              キャラクターを作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((c: { id: string; name: string; reference_images?: string[]; appearance_description?: string }, i: number) => (
              <Link
                key={c.id}
                href={`/characters/${c.id}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/60 hover:border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  {c.reference_images?.[0] ? (
                    <img
                      src={c.reference_images[0]}
                      alt={c.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                      {c.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-purple-600">{c.name}</h3>
                    <p className="text-sm text-slate-400 truncate mt-1">
                      {c.appearance_description || "説明なし"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
