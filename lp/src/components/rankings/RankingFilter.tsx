"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
  categories: { id: string; name: string }[];
  basePath: string;
};

const periods = [
  { value: "daily", label: "日次" },
  { value: "weekly", label: "週次" },
  { value: "monthly", label: "月次" },
  { value: "yearly", label: "年間" },
  { value: "all", label: "全期間" },
];

export function RankingFilter({ categories, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "monthly";
  const currentCategory = searchParams.get("category") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex gap-1 rounded-lg border bg-white p-1">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => updateParams("period", p.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              currentPeriod === p.value
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <select
        value={currentCategory}
        onChange={(e) => updateParams("category", e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm bg-white"
      >
        <option value="">全カテゴリ</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
