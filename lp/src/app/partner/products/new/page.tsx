import Link from "next/link";
import { createPartnerProduct } from "../actions";
import { getSupabase } from "@/lib/supabase";
import { ProductAttributes } from "@/components/ProductAttributes";
import { CategoryFields } from "@/components/CategoryFields";
import { ImageUpload } from "@/components/partner/ImageUpload";
import type { Tag } from "@/lib/types";

const TAG_TYPE_ORDER = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

const inputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionTitle = "text-sm font-semibold text-gray-800 mb-3";

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
      <Link href="/partner/products" className="text-sm text-orange-600 hover:text-orange-800 mb-4 inline-block">← 商品一覧に戻る</Link>
      <h1 className="text-2xl font-bold mb-6">商品 新規登録</h1>
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <p className="font-bold">取扱禁止商品にご注意ください</p>
        <p className="mt-1 text-xs">古物・酒類・たばこ・医薬品・銃砲刀剣類など、免許・許可が必要な商品は当プラットフォームでは取扱禁止です。詳細は<a href="/legal" className="underline font-medium">利用規約</a>をご確認ください。</p>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-3xl">
        <form action={createPartnerProduct} className="space-y-6">

          {/* 基本情報 */}
          <div>
            <h3 className={sectionTitle}>基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>商品名 *</label>
                <input name="name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>商品名マスタ</label>
                <input name="master_name" className={inputClass} placeholder="管理用の正式名称" />
              </div>
              <div>
                <label className={labelClass}>スラッグ *</label>
                <input name="slug" required className={inputClass} placeholder="URL用の英字識別子" />
              </div>
              <div>
                <label className={labelClass}>バーコード（JAN/EAN）</label>
                <input name="barcode" className={inputClass} placeholder="4901234567890" maxLength={14} />
              </div>
              <div>
                <label className={labelClass}>品番</label>
                <input name="product_code" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>JAN CODE</label>
                <input name="jan_code" className={inputClass} placeholder="13桁バーコード" />
              </div>
              <div>
                <label className={labelClass}>原産国</label>
                <input name="country_of_origin" className={inputClass} placeholder="例: 日本" />
              </div>
            </div>
          </div>

          {/* カテゴリ */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>カテゴリ</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>カテゴリ①</label>
                <input name="category1" className={inputClass} placeholder="大分類" />
              </div>
              <div>
                <label className={labelClass}>カテゴリ②</label>
                <input name="category2" className={inputClass} placeholder="中分類" />
              </div>
              <div>
                <label className={labelClass}>カテゴリ③</label>
                <input name="category3" className={inputClass} placeholder="小分類" />
              </div>
            </div>
          </div>

          {/* カテゴリ別固有フィールド */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>商品タイプ別情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <CategoryFields fieldType="product_fields" />
            </div>
          </div>

          {/* 価格・数量 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>価格・数量</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>卸売価格（税抜）*</label>
                <input name="base_price" type="number" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>カートン入数</label>
                <input name="carton_quantity" type="number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>最小注文数量</label>
                <input name="min_order_quantity" type="number" min={1} defaultValue={1} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>最小注文金額</label>
                <input name="min_order_amount" type="number" min={0} className={inputClass} placeholder="制限なし" />
              </div>
            </div>
          </div>

          {/* サイズ・重量 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>サイズ・重量</h3>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>W (mm)</label>
                <input name="width_mm" type="number" step="0.1" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>D (mm)</label>
                <input name="depth_mm" type="number" step="0.1" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>H (mm)</label>
                <input name="height_mm" type="number" step="0.1" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>N.W (kg)</label>
                <input name="net_weight_kg" type="number" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>G.W (kg)</label>
                <input name="gross_weight_kg" type="number" step="0.01" className={inputClass} />
              </div>
            </div>
          </div>

          {/* 説明・素材 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>詳細情報</h3>
            <div>
              <label className={labelClass}>説明</label>
              <textarea name="description" rows={3} className={inputClass} />
            </div>
            <div className="mt-3">
              <label className={labelClass}>素材・成分</label>
              <textarea name="material" rows={3} className={inputClass} placeholder="例: 表面材：ポリオレフィン不織布&#10;吸収材：綿状パルプ" />
            </div>
            <div className="mt-3">
              <label className={labelClass}>備考</label>
              <textarea name="notes" rows={2} className={inputClass} />
            </div>
            <div className="mt-3">
              <label className={labelClass}>注文に関する備考</label>
              <textarea name="order_notes" rows={2} className={inputClass} placeholder="リードタイム、最小注文数の制約など" />
            </div>
          </div>

          {/* 画像 */}
          <div className="border-t pt-4">
            <h3 className={sectionTitle}>商品画像</h3>
            <div>
              <label className={labelClass}>メイン画像</label>
              <ImageUpload name="image_url" />
              <p className="text-xs text-gray-400 mt-1">画像ファイル（5MB以下）をアップロード、またはURLを入力</p>
            </div>
          </div>

          {/* フラグ */}
          <div className="border-t pt-4 flex gap-6">
            <label className="flex items-center gap-2">
              <input name="is_active" type="checkbox" defaultChecked />
              <span className="text-sm">有効</span>
            </label>
            <label className="flex items-center gap-2">
              <input name="is_new_or_renewal" type="checkbox" />
              <span className="text-sm">新商品・リニューアル商品</span>
            </label>
          </div>

          {/* 成分・特徴 */}
          <div className="border-t pt-4">
            <ProductAttributes />
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
                            <input type="checkbox" name="tag_ids" value={tag.id} />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium">
            登録
          </button>
        </form>
      </div>
    </div>
  );
}
