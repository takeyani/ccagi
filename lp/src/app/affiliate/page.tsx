"use client";

import { useState } from "react";
import Link from "next/link";

export default function AffiliatePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    existing: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, is_creator: isCreator }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      setResult(data);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = result ? `${baseUrl}/?ref=${result.code}` : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            アフィリエイトプログラム
          </h1>
          <p className="mt-3 text-gray-600">
            紹介リンクを共有して、売上の
            <span className="font-bold text-indigo-600">10%</span>
            のコミッションを獲得しましょう。
          </p>
        </div>

        {!result ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-white p-8 shadow-lg"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  お名前
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="山田太郎"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCreator}
                    onChange={(e) => setIsCreator(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    クリエイターとして登録する（LP作成機能を利用）
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登録中..." : "アフィリエイト登録する"}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {result.existing
                  ? "既に登録済みです"
                  : "登録が完了しました！"}
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  アフィリエイトコード
                </p>
                <p className="mt-1 rounded-lg bg-gray-100 px-4 py-3 font-mono text-lg font-bold text-indigo-600">
                  {result.code}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  紹介リンク
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(referralLink)
                    }
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    コピー
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                このリンクを経由して購入が発生すると、売上の10%がコミッションとして記録されます。
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 transition hover:text-indigo-800"
          >
            &larr; トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
