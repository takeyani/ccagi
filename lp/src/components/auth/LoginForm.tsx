"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    // ロール判定してリダイレクト
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      let { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // profileが無い場合は自動作成（メール認証後の初回ログイン等）
      if (!profile) {
        const completeRes = await fetch("/api/signup/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "ユーザー",
            role: "partner",
            partner_type: "メーカー",
          }),
        });
        if (completeRes.ok) {
          profile = { role: "partner" };
        }
      }

      if (redirect !== "/" && redirect !== "/login") {
        router.push(redirect);
      } else if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "buyer") {
        router.push("/buyer");
      } else {
        router.push("/partner");
      }
    } else {
      setError("ログインに失敗しました。再度お試しください。");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          パスワード
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          autoComplete="current-password"
        />
        <div className="text-right mt-1">
          <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">
            パスワードを忘れた方
          </Link>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
