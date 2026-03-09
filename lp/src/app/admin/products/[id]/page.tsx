import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateProduct, deleteProduct } from "../actions";
import { ProductAttributes } from "@/components/ProductAttributes";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: product }, { data: partners }, { data: tags }, { data: productTags }, { data: productAttrs }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("partners").select("id, company_name").order("company_name"),
      supabase
        .from("tags")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      supabase
        .from("product_tags")
        .select("tag_id")
        .eq("product_id", id),
      supabase
        .from("product_attributes")
        .select("attribute_name, attribute_value")
        .eq("product_id", id),
    ]);

  if (!product) notFound();

  const assignedTagIds = new Set(
    (productTags ?? []).map((pt: { tag_id: string }) => pt.tag_id)
  );

  const tagsByType = TAG_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = (tags ?? []).filter((t: Tag) => t.tag_type === type);
      return acc;
    },
    {} as Record<string, Tag[]>
  );

  const updateWithId = updateProduct.bind(null, id);
  const deleteWithId = deleteProduct.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">商品 編集</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名 *
              </label>
              <input
                name="name"
                required
                defaultValue={product.name}
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
                defaultValue={product.slug}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引先
              </label>
              <select
                name="partner_id"
                defaultValue={product.partner_id ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 選択 --</option>
                {partners?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                基本価格 *
              </label>
              <input
                name="base_price"
                type="number"
                required
                defaultValue={product.base_price}
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
              defaultValue={product.description ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <input
              name="image_url"
              defaultValue={product.image_url ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={product.is_active}
            />
            <span className="text-sm">有効</span>
          </label>

          {/* 成分・特徴 */}
          <div className="border-t pt-4">
            <ProductAttributes
              defaultValue={
                (productAttrs ?? []).map((a: { attribute_name: string; attribute_value: string }) => ({
                  label: a.attribute_name,
                  value: a.attribute_value,
                }))
              }
            />
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
                              defaultChecked={assignedTagIds.has(tag.id)}
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
            更新
          </button>
        </form>
        <form action={deleteWithId} className="mt-4">
          <button
            type="submit"
            className="text-red-600 hover:text-red-800 text-sm"
          >
            この商品を削除
          </button>
        </form>
      </div>
    </div>
  );
}
