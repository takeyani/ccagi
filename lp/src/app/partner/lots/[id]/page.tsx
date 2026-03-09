import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { updatePartnerLot, deletePartnerLot } from "../actions";

export default async function EditPartnerLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: lot } = await supabase
    .from("lots")
    .select("*, products!inner(name, partner_id)")
    .eq("id", id)
    .eq("products.partner_id", partnerId)
    .single();

  if (!lot) notFound();

  const updateWithId = updatePartnerLot.bind(null, id);
  const deleteWithId = deletePartnerLot.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ロット 編集</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <p className="text-sm text-gray-500 mb-4">
          商品: {(lot.products as { name: string })?.name}
        </p>
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロット番号 *
              </label>
              <input
                name="lot_number"
                required
                defaultValue={lot.lot_number}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                name="status"
                defaultValue={lot.status}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
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
            このロットを削除
          </button>
        </form>
      </div>
    </div>
  );
}
