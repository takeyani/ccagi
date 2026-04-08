"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Program = {
  id: string;
  name: string;
  description: string | null;
  landing_url: string;
  commission_type: string;
  commission_amount: number;
  commission_rate: number | null;
  asp_advertisers: { name: string; domain: string } | null;
};

export default function AspProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    fetch("/api/asp/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs ?? []))
      .finally(() => setLoading(false));

    const code = localStorage.getItem("affiliate_code") || "";
    setAffiliateCode(code);
  }, []);

  const getLink = (program: Program) => {
    if (!affiliateCode) return program.landing_url;
    const sep = program.landing_url.includes("?") ? "&" : "?";
    return `${program.landing_url}${sep}ref=${affiliateCode}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <nav className="mb-8">
          <Link href="/affiliate" className="text-sm text-orange-600 hover:text-orange-800">
            &larr; アフィリエイトトップに戻る
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900">ASPプログラム一覧</h1>
        <p className="mt-2 text-gray-600">
          参加可能なアフィリエイトプログラムを選んで、紹介リンクを取得しましょう。
        </p>

        {!affiliateCode && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              アフィリエイトコードが未設定です。
              <Link href="/affiliate" className="font-bold underline">
                先にアフィリエイト登録
              </Link>
              を行ってください。
            </p>
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-center text-gray-400">読み込み中...</p>
        ) : programs.length === 0 ? (
          <p className="mt-8 text-center text-gray-400">
            現在募集中のプログラムはありません
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {programs.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {p.asp_advertisers?.name} ({p.asp_advertisers?.domain})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-800">
                      {p.commission_type}
                    </span>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {p.commission_rate
                        ? `${p.commission_rate}%`
                        : `¥${p.commission_amount.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-3 text-sm text-gray-600">{p.description}</p>
                )}

                {affiliateCode && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">紹介リンク</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getLink(p)}
                        className="w-full rounded border bg-white px-3 py-2 text-xs font-mono text-gray-700"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(getLink(p))}
                        className="shrink-0 rounded bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-700"
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
