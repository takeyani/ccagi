import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateLot, deleteLot } from "../actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function EditLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: lot }, { data: products }] = await Promise.all([
    supabase.from("lots").select("*").eq("id", id).single(),
    supabase.from("products").select("id, name").order("name"),
  ]);

  if (!lot) notFound();

  const updateWithId = updateLot.bind(null, id);
  const deleteWithId = deleteLot.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ロット 編集</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品 *
              </label>
              <select
                name="product_id"
                required
                defaultValue={lot.product_id}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロット番号 *
              </label>
              <input
                name="lot_number"
                required
                defaultValue={lot.lot_number}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                在庫数 *
              </label>
              <input
                name="stock"
                type="number"
                required
                defaultValue={lot.stock}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                name="status"
                defaultValue={lot.status}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="販売中">販売中</option>
                <option value="売切れ">売切れ</option>
                <option value="期限切れ">期限切れ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロット価格
              </label>
              <input
                name="price"
                type="number"
                defaultValue={lot.price ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                卸価格（代理店向け）
              </label>
              <input
                name="wholesale_price"
                type="number"
                defaultValue={lot.wholesale_price ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                賞味期限
              </label>
              <input
                name="expiration_date"
                type="date"
                defaultValue={lot.expiration_date ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕入日
              </label>
              <input
                name="purchase_date"
                type="date"
                defaultValue={lot.purchase_date ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕入価格
              </label>
              <input
                name="purchase_price"
                type="number"
                defaultValue={lot.purchase_price ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送方法
              </label>
              <select
                name="shipping_method"
                defaultValue={lot.shipping_method ?? "メーカー無料"}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="メーカー無料">メーカー無料</option>
                <option value="配送会社手配">配送会社手配</option>
                <option value="ユーザー指定">ユーザー指定</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                送料（円）
              </label>
              <input
                name="shipping_fee"
                type="number"
                defaultValue={lot.shipping_fee ?? 0}
                min={0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                販売単位
              </label>
              <select
                name="selling_unit"
                defaultValue={lot.selling_unit ?? "個"}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="個">個</option>
                <option value="箱">箱</option>
                <option value="ケース">ケース</option>
                <option value="パレット">パレット</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1箱あたりの個数
              </label>
              <input
                name="units_per_case"
                type="number"
                min={1}
                defaultValue={lot.units_per_case ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="例: 24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1パレットあたりの箱数
              </label>
              <input
                name="cases_per_pallet"
                type="number"
                min={1}
                defaultValue={lot.cases_per_pallet ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="例: 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最小注文単位数
              </label>
              <input
                name="min_order_units"
                type="number"
                defaultValue={lot.min_order_units ?? 1}
                min={1}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              name="memo"
              rows={3}
              defaultValue={lot.memo ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            更新
          </button>
        </form>
        <form action={deleteWithId} className="mt-4">
          <DeleteButton label="このロットを削除" confirmMessage="このロットを削除します。本当によろしいですか？" />
        </form>
      </div>
    </div>
  );
}
