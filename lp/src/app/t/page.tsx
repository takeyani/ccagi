import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Tag } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグで探す | Cross Infinity",
  description: "商品をタグで探す",
};

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

const SAMPLE_TAGS: Record<string, { name: string; slug: string; count: number }[]> = {
  "生産者": [
    { name: "XXX農園", slug: "xxx-farm", count: 8 },
    { name: "YYY牧場", slug: "yyy-ranch", count: 5 },
    { name: "ZZZ水産", slug: "zzz-fishery", count: 3 },
  ],
  "メーカー": [
    { name: "株式会社ABCフーズ", slug: "abc-foods", count: 12 },
    { name: "DEF食品工業", slug: "def-foods", count: 9 },
    { name: "GHIヘルスケア", slug: "ghi-healthcare", count: 6 },
    { name: "JKLコスメティクス", slug: "jkl-cosmetics", count: 4 },
  ],
  "カテゴリ": [
    { name: "食品・飲料", slug: "food-beverage", count: 24 },
    { name: "健康食品・サプリ", slug: "health-supplement", count: 18 },
    { name: "化粧品・スキンケア", slug: "cosmetics", count: 11 },
    { name: "日用品", slug: "daily-goods", count: 7 },
    { name: "ペット用品", slug: "pet-supplies", count: 5 },
    { name: "農産物", slug: "agriculture", count: 14 },
  ],
  "キーワード": [
    { name: "オーガニック", slug: "organic", count: 16 },
    { name: "無添加", slug: "additive-free", count: 13 },
    { name: "国産", slug: "domestic", count: 21 },
    { name: "グルテンフリー", slug: "gluten-free", count: 6 },
    { name: "ヴィーガン", slug: "vegan", count: 4 },
    { name: "期間限定", slug: "limited-time", count: 8 },
    { name: "新商品", slug: "new-arrival", count: 10 },
    { name: "訳あり", slug: "outlet", count: 7 },
  ],
};

export default async function TagsIndexPage() {
  const { data: tags } = await getSupabase()
    .from("tags")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

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

  const hasRealTags = TAG_TYPE_ORDER.some((type) => tagsByType[type].length > 0);

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          タグで探す
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          タグから商品を絞り込んで検索できます
        </p>

        {hasRealTags ? (
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
        ) : (
          <div>
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
              現在サンプルデータを表示しています。商品が登録されると実際のタグが表示されます。
            </div>
            <div className="space-y-10">
              {TAG_TYPE_ORDER.map((type) => (
                <section key={type}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                      {type}
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {SAMPLE_TAGS[type].map((tag) => (
                      <div
                        key={tag.slug}
                        className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-gray-400 cursor-default"
                      >
                        <span className="font-medium">{tag.name}</span>
                        <span className="text-xs ml-2">{tag.count}件</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
