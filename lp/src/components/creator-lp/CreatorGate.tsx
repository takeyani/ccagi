"use client";

import { useState, useEffect, useCallback } from "react";
import type { Affiliate } from "@/lib/types";

type Props = {
  children: (affiliate: Affiliate) => React.ReactNode;
};

export function CreatorGate({ children }: Props) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verify = useCallback(async (c: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creator/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();
      if (res.ok && data.affiliate) {
        setAffiliate(data.affiliate);
        localStorage.setItem("creator_code", c);
      } else {
        setError(data.error || "認証に失敗しました");
        localStorage.removeItem("creator_code");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("creator_code");
    if (saved) {
      verify(saved);
    } else {
      setLoading(false);
    }
  }, [verify]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (affiliate) {
    return <>{children(affiliate)}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          クリエイターポータル
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          クリエイターコードを入力してログインしてください
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) verify(code.trim());
          }}
          className="rounded-2xl bg-white p-6 shadow-lg"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              クリエイターコード
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="your-code-xxxx"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
