"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ImageProviderName } from "@/lib/types";

const PROVIDERS = [
  { value: "openai", label: "OpenAI", model: "gpt-image-1", color: "from-green-500 to-emerald-600" },
  { value: "stability", label: "Stability AI", model: "SDXL", color: "from-purple-500 to-violet-600" },
  { value: "gemini", label: "Google Gemini", model: "Imagen", color: "from-blue-500 to-cyan-600" },
];

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [defaultProvider, setDefaultProvider] = useState<ImageProviderName>("openai");
  const [apiKeys, setApiKeys] = useState({ openai: "", stability: "", gemini: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("user_profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setDisplayName(profile.display_name || "");
        setDefaultProvider((profile.default_provider as ImageProviderName) || "openai");
        const keys = (profile.api_keys as Record<string, string>) || {};
        setApiKeys({ openai: keys.openai || "", stability: keys.stability || "", gemini: keys.gemini || "" });
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_profiles").update({
      display_name: displayName, default_provider: defaultProvider, api_keys: apiKeys,
    }).eq("id", user.id);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">設定</h1>
          <p className="text-slate-500 mt-1">プロフィールとAPIキーの管理</p>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900">プロフィール</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Provider selection */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900">デフォルトプロバイダー</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDefaultProvider(p.value as ImageProviderName)}
                  className={`relative p-4 rounded-xl border-2 text-left ${
                    defaultProvider === p.value
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
                  {defaultProvider === p.value && (
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

        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900">APIキー</h2>
            <p className="text-xs text-slate-400 mt-1">サーバーサイドでのみ使用されます</p>
          </div>
          <div className="p-6 space-y-5">
            {[
              { key: "openai" as const, label: "OpenAI API Key", placeholder: "sk-..." },
              { key: "stability" as const, label: "Stability AI API Key", placeholder: "sk-..." },
              { key: "gemini" as const, label: "Gemini API Key", placeholder: "AIza..." },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{item.label}</label>
                <input
                  type="password"
                  value={apiKeys[item.key]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [item.key]: e.target.value })}
                  placeholder={item.placeholder}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 font-medium shadow-md shadow-indigo-500/20 disabled:opacity-50 hover:-translate-y-0.5"
          >
            {loading ? "保存中..." : "設定を保存"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              保存しました
            </span>
          )}
        </div>
      </div>
    </AppShell>
  );
}
