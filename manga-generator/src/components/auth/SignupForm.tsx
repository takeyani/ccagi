"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { display_name: displayName } },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("user_profiles").upsert({
        id: data.user.id, display_name: displayName, default_provider: "openai",
      });
    }
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">表示名</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">メールアドレス</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">パスワード</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 font-medium shadow-md shadow-indigo-500/20 disabled:opacity-50">
        {loading ? "登録中..." : "新規登録"}
      </button>
    </form>
  );
}
