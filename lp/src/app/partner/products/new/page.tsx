import Link from "next/link";
import { createPartnerProduct } from "../actions";
import { getSupabase } from "@/lib/supabase";
import { ProductAttributes } from "@/components/ProductAttributes";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function NewPartnerProductPage() {
  const { data: tags } = await getSupabase()
    .from("tags")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  const tagsByType = TAG_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = (tags ?? []).filter((t: Tag) => t.tag_type === type);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  return (
    <div>
      <Link href="/partner/products" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← 商品一覧に戻る</Link>
      <h1 className="text-2xl font-bold mb-6">商品 新規登録</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createPartnerProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名 *
              </label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スラッグ *
              </label>
              <input
                name="slug"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                基本価格 *
              </label>
              <input
                name="base_price"
                type="number"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <input
              name="image_url"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input name="is_active" type="checkbox" defaultChecked />
            <span className="text-sm">有効</span>
          </label>

          {/* 成分・特徴 */}
          <div className="border-t pt-4">
            <ProductAttributes />
          </div>

          {/* タグ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="space-y-3">
              {TAG_TYPE_ORDER.map(
                (type) =>
                  tagsByType[type].length > 0 && (
                    <div key={type}>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {type}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tagsByType[type].map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-1.5 px-2 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              name="tag_ids"
                              value={tag.id}
                            />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            登録
          </button>
        </form>
      </div>
    </div>
  );
}
