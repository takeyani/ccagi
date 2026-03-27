"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import TonmanaEditor from "@/components/projects/TonmanaEditor";
import { DEFAULT_TONMANA } from "@/lib/tonmana/presets";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TonmanaConfig, ImageProviderName, Character } from "@/lib/types";

const PROVIDERS = [
  { value: "openai", label: "OpenAI", model: "gpt-image-1", desc: "高品質・指示追従性が高い", color: "from-green-500 to-emerald-600" },
  { value: "stability", label: "Stability AI", model: "SDXL", desc: "アニメ・イラスト系が得意", color: "from-purple-500 to-violet-600" },
  { value: "gemini", label: "Google Gemini", model: "Imagen", desc: "写実表現に強い", color: "from-blue-500 to-cyan-600" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tonmana, setTonmana] = useState<TonmanaConfig>(DEFAULT_TONMANA);
  const [provider, setProvider] = useState<ImageProviderName>("openai");
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("characters").select("*").then(({ data }: { data: Character[] | null }) => {
      if (data) setCharacters(data as Character[]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "無題のプロジェクト",
        tonmana_config: tonmana,
        default_provider: provider,
        character_ids: selectedCharIds,
      }),
    });
    if (res.ok) {
      const project = await res.json();
      // Persist project data for mock mode
      sessionStorage.setItem(`manga-project-${project.id}`, JSON.stringify(project));
      router.push(`/projects/${project.id}`);
    }
    setLoading(false);
  };

  const toggleCharacter = (id: string) => {
    setSelectedCharIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <AppShell>
      <div className="p-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">新規プロジェクト</h1>
          <p className="text-slate-500 mt-1">漫画のスタイルと設定を決めましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">基本情報</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 放課後の冒険"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Provider */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">画像生成プロバイダー</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setProvider(p.value as ImageProviderName)}
                    className={`relative p-4 rounded-xl border-2 text-left ${
                      provider === p.value
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-sm`}>
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                      </svg>
                    </div>
                    <div className="font-medium text-sm text-slate-900">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.model}</div>
                    <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
                    {provider === p.value && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Characters */}
          {characters.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-semibold text-slate-900">キャラクター</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {characters.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCharacter(c.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 ${
                        selectedCharIds.includes(c.id)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedCharIds.includes(c.id)
                          ? "bg-purple-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {c.name[0]}
                      </div>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tonmana */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">トンマナ設定（テイスト）</h2>
              <p className="text-xs text-slate-400 mt-1">漫画全体の画風・雰囲気を設定します</p>
            </div>
            <div className="p-6">
              <TonmanaEditor value={tonmana} onChange={setTonmana} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:-translate-y-0.5"
          >
            {loading ? "作成中..." : "プロジェクトを作成"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
