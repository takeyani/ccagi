"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPCollection } from "@/lib/types";
import { deleteCollection, toggleCollectionPublish } from "./actions";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CreatorLPCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    const load = async () => {
      const code = localStorage.getItem("creator_code");
      if (!code) return;
      setAffiliateCode(code);

      const supabase = getSupabase();
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("code", code)
        .single();

      if (!affiliate) return;

      const { data } = await supabase
        .from("creator_lp_collections")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });

      setCollections((data as CreatorLPCollection[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await toggleCollectionPublish(id, !current);
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_published: !current } : c))
      );
    } catch {
      alert("操作に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このコレクションを削除しますか？")) return;
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("削除に失敗しました");
    }
  };

  if (loading) return <p className="text-gray-500">読み込み中...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">コレクション一覧</h1>
        <Link
          href="/creator/collections/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          新規コレクション
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">PV数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  コレクションがありません
                </td>
              </tr>
            ) : (
              collections.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.is_published ? "公開中" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.views_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creator/collections/${c.id}/edit`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        編集
                      </Link>
                      <Link
                        href={`/creator/collections/${c.id}/settings`}
                        className="text-xs text-gray-600 hover:underline"
                      >
                        設定
                      </Link>
                      {c.is_published && (
                        <Link
                          href={`/c/${affiliateCode}/${c.slug}`}
                          target="_blank"
                          className="text-xs text-green-600 hover:underline"
                        >
                          表示
                        </Link>
                      )}
                      <button
                        onClick={() => handleTogglePublish(c.id, c.is_published)}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        {c.is_published ? "非公開" : "公開"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
