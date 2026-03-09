"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPDesign } from "@/lib/types";
import { togglePublish, deleteDesign } from "./actions";

export default function CreatorDesignsPage() {
  const [designs, setDesigns] = useState<CreatorLPDesign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDesigns = async () => {
    const code = localStorage.getItem("creator_code");
    if (!code) return;

    const supabase = getSupabase();
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("code", code)
      .single();

    if (!affiliate) return;

    const { data } = await supabase
      .from("creator_lp_designs")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    setDesigns((data as CreatorLPDesign[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleTogglePublish = async (id: string, current: boolean) => {
    await togglePublish(id, !current);
    loadDesigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このデザインを削除しますか？")) return;
    await deleteDesign(id);
    loadDesigns();
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const code = typeof window !== "undefined" ? localStorage.getItem("creator_code") : "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">デザイン一覧</h1>
        <Link
          href="/creator/designs/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + 新規作成
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : designs.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-gray-400">
          <p>デザインがまだありません</p>
          <Link
            href="/creator/designs/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm text-white hover:bg-indigo-700"
          >
            最初のデザインを作成
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">PV</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
                <th className="px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{d.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {d.is_published ? "公開中" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{d.views_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(d.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/creator/designs/${d.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-xs"
                      >
                        編集
                      </Link>
                      {d.is_published && d.lot_id && (
                        <a
                          href={`${baseUrl}/c/${code}/${d.slug}/${d.lot_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          表示
                        </a>
                      )}
                      <button
                        onClick={() => handleTogglePublish(d.id, d.is_published)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        {d.is_published ? "非公開" : "公開"}
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
