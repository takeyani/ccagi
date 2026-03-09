import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Tag } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "商品をタグで探す",
};

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function TagsIndexPage() {
  const { data: tags } = await getSupabase()
    .from("tags")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  // 各タグの商品数を取得
  const { data: counts } = await getSupabase()
    .from("product_tags")
    .select("tag_id");

  const countMap = (counts ?? []).reduce(
    (acc: Record<string, number>, row: { tag_id: string }) => {
      acc[row.tag_id] = (acc[row.tag_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const tagsByType = TAG_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = (tags ?? []).filter((t: Tag) => t.tag_type === type);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; トップページに戻る
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          タグで探す
        </h1>

        <div className="space-y-10">
          {TAG_TYPE_ORDER.map(
            (type) =>
              tagsByType[type].length > 0 && (
                <section key={type}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                      {type}
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tagsByType[type].map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/t/${tag.slug}`}
                        className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition"
                      >
                        <span className="font-medium text-gray-800">
                          {tag.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {countMap[tag.id] || 0}件
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      </div>
    </div>
  );
}
