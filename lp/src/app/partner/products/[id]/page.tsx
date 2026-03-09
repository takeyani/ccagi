import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { updatePartnerProduct, deletePartnerProduct } from "../actions";
import { ProductAttributes } from "@/components/ProductAttributes";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default async function EditPartnerProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const [{ data: product }, { data: tags }, { data: productTags }, { data: productAttrs }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("partner_id", partnerId)
        .single(),
      getSupabase()
        .from("tags")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      supabase.from("product_tags").select("tag_id").eq("product_id", id),
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

  const updateWithId = updatePartnerProduct.bind(null, id);
  const deleteWithId = deletePartnerProduct.bind(null, id);

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

          {/* 注文受付条件 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              注文受付条件
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              入荷リクエストや引合いの際に適用される制限です
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最小注文数量
                </label>
                <input
                  name="min_order_quantity"
                  type="number"
                  min={1}
                  defaultValue={product.min_order_quantity ?? 1}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最小注文金額
                </label>
                <input
                  name="min_order_amount"
                  type="number"
                  min={0}
                  defaultValue={product.min_order_amount ?? ""}
                  placeholder="制限なし"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                注文に関する備考
              </label>
              <textarea
                name="order_notes"
                rows={2}
                defaultValue={product.order_notes ?? ""}
                placeholder="リードタイム、ロット単位の制約など"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

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
