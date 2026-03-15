import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { updatePartnerProduct, deletePartnerProduct } from "../actions";
import { ProductAttributes } from "@/components/ProductAttributes";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

const inputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionTitle = "text-sm font-semibold text-gray-800 mb-3";

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
      <Link href="/partner/products" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← 商品一覧に戻る</Link>
      <h1 className="text-2xl font-bold mb-6">商品 編集</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-3xl">
        <form action={updateWithId} className="space-y-6">

          {/* 基本情報 */}
          <div>
            <h3 className={sectionTitle}>基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>商品名 *</label>
                <input name="name" required defaultValue={product.name} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>商品名マスタ</label>
                <input name="master_name" defaultValue={product.master_name ?? ""} className={inputClass} placeholder="管理用の正式名称" />
              </div>
              <div>
                <label className={labelClass}>スラッグ *</label>
                <input name="slug" required defaultValue={product.slug} className={inputClass} placeholder="URL用の英字識別子" />
              </div>
              <div>
                <label className={labelClass}>品番</label>
                <input name="product_code" defaultValue={product.product_code ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>JAN CODE</label>
                <input name="jan_code" defaultValue={product.jan_code ?? ""} className={inputClass} placeholder="13桁バーコード" />
              </div>
              <div>
                <label className={labelClass}>原産国</label>
                <input name="country_of_origin" defaultValue={product.country_of_origin ?? ""} className={inputClass} placeholder="例: 日本" />
              </div>
            </div>
          </div>

          {/* カテゴリ */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>カテゴリ</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>カテゴリ①</label>
                <input name="category1" defaultValue={product.category1 ?? ""} className={inputClass} placeholder="大分類" />
              </div>
              <div>
                <label className={labelClass}>カテゴリ②</label>
                <input name="category2" defaultValue={product.category2 ?? ""} className={inputClass} placeholder="中分類" />
              </div>
              <div>
                <label className={labelClass}>カテゴリ③</label>
                <input name="category3" defaultValue={product.category3 ?? ""} className={inputClass} placeholder="小分類" />
              </div>
            </div>
          </div>

          {/* 価格・数量 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>価格・数量</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>卸売価格（税抜）*</label>
                <input name="base_price" type="number" required defaultValue={product.base_price} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>カートン入数</label>
                <input name="carton_quantity" type="number" defaultValue={product.carton_quantity ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>最小注文数量</label>
                <input name="min_order_quantity" type="number" min={1} defaultValue={product.min_order_quantity ?? 1} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>最小注文金額</label>
                <input name="min_order_amount" type="number" min={0} defaultValue={product.min_order_amount ?? ""} className={inputClass} placeholder="制限なし" />
              </div>
            </div>
          </div>

          {/* サイズ・重量 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>サイズ・重量</h3>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>W (mm)</label>
                <input name="width_mm" type="number" step="0.1" defaultValue={product.width_mm ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>D (mm)</label>
                <input name="depth_mm" type="number" step="0.1" defaultValue={product.depth_mm ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>H (mm)</label>
                <input name="height_mm" type="number" step="0.1" defaultValue={product.height_mm ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>N.W (kg)</label>
                <input name="net_weight_kg" type="number" step="0.01" defaultValue={product.net_weight_kg ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>G.W (kg)</label>
                <input name="gross_weight_kg" type="number" step="0.01" defaultValue={product.gross_weight_kg ?? ""} className={inputClass} />
              </div>
            </div>
          </div>

          {/* 説明・素材 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>詳細情報</h3>
            <div>
              <label className={labelClass}>説明</label>
              <textarea name="description" rows={3} defaultValue={product.description ?? ""} className={inputClass} />
            </div>
            <div className="mt-3">
              <label className={labelClass}>素材・成分</label>
              <textarea name="material" rows={3} defaultValue={product.material ?? ""} className={inputClass} placeholder="例: 表面材：ポリオレフィン不織布&#10;吸収材：綿状パルプ" />
            </div>
            <div className="mt-3">
              <label className={labelClass}>備考</label>
              <textarea name="notes" rows={2} defaultValue={product.notes ?? ""} className={inputClass} />
            </div>
            <div className="mt-3">
              <label className={labelClass}>注文に関する備考</label>
              <textarea name="order_notes" rows={2} defaultValue={product.order_notes ?? ""} className={inputClass} placeholder="リードタイム、ロット単位の制約など" />
            </div>
          </div>

          {/* 画像 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>画像</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>画像1 URL</label>
                <input name="image_url" defaultValue={product.image_url ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>画像2 URL</label>
                <input name="image_url2" defaultValue={product.image_url2 ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>画像3 URL</label>
                <input name="image_url3" defaultValue={product.image_url3 ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>画像4 URL</label>
                <input name="image_url4" defaultValue={product.image_url4 ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>画像5 URL</label>
                <input name="image_url5" defaultValue={product.image_url5 ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>商品ページURL</label>
                <input name="product_page_url" defaultValue={product.product_page_url ?? ""} className={inputClass} placeholder="https://" />
              </div>
            </div>
          </div>

          {/* フラグ */}
          <div className="border-t pt-4 flex gap-6">
            <label className="flex items-center gap-2">
              <input name="is_active" type="checkbox" defaultChecked={product.is_active} />
              <span className="text-sm">有効</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="is_new_or_renewal" type="checkbox" defaultChecked={product.is_new_or_renewal} />
              <span className="text-sm">新商品・リニューアル商品</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
            <div className="space-y-3">
              {TAG_TYPE_ORDER.map(
                (type) =>
                  tagsByType[type].length > 0 && (
                    <div key={type}>
                      <p className="text-xs font-medium text-gray-500 mb-1">{type}</p>
                      <div className="flex flex-wrap gap-2">
                        {tagsByType[type].map((tag) => (
                          <label key={tag.id} className="flex items-center gap-1.5 px-2 py-1 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" name="tag_ids" value={tag.id} defaultChecked={assignedTagIds.has(tag.id)} />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
            更新
          </button>
        </form>
        <form action={deleteWithId} className="mt-4">
          <button type="submit" className="text-red-600 hover:text-red-800 text-sm">
            この商品を削除
          </button>
        </form>
      </div>
    </div>
  );
}
