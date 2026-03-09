import { requirePartnerId } from "@/lib/auth";
import { submitInventoryProof } from "./actions";

export default async function PartnerInventoryProofsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // Get lots with their latest verification
  const { data: lots } = await supabase
    .from("lots")
    .select(
      "*, products!inner(name, partner_id)"
    )
    .eq("products.partner_id", partnerId)
    .order("created_at", { ascending: false });

  // Get recent verifications
  const { data: verifications } = await supabase
    .from("inventory_proofs")
    .select("*, lots!inner(lot_number, products!inner(name, partner_id))")
    .eq("lots.products.partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">在庫証明</h1>
      <p className="text-sm text-gray-500 mb-6">
        倉庫情報の登録・在庫の実地検証を行ってください
      </p>

      {/* Recent verifications */}
      {(verifications?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">検証履歴</h2>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    ロット
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    検証在庫
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    方法
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    倉庫
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    日時
                  </th>
                </tr>
              </thead>
              <tbody>
                {verifications?.map((v) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const lot = v.lots as any;
                  return (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        {lot?.products?.name} ({lot?.lot_number})
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {v.verified_stock}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100">
                          {v.verification_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {v.warehouse_code ?? "-"}
                        {v.location_detail && ` (${v.location_detail})`}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(v.created_at).toLocaleString("ja-JP")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit new verification */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <h2 className="font-semibold mb-4">在庫検証を実施</h2>
        <form action={submitInventoryProof} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロット *
              </label>
              <select
                name="lot_id"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 選択 --</option>
                {lots?.map((l) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const product = (l.products as any)?.name;
                  return (
                    <option key={l.id} value={l.id}>
                      {product} ({l.lot_number}) - 在庫: {l.stock}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検証在庫数 *
              </label>
              <input
                name="verified_stock"
                type="number"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検証方法 *
              </label>
              <select
                name="verification_method"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="目視">目視</option>
                <option value="バーコード">バーコード</option>
                <option value="WMS連動">WMS連動</option>
                <option value="IoTセンサー">IoTセンサー</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                倉庫コード
              </label>
              <input
                name="warehouse_code"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="WH-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                倉庫名
              </label>
              <input
                name="warehouse_name"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="東京第一倉庫"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                棚番・ロケーション
              </label>
              <input
                name="location_detail"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="A-3-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              写真URL
            </label>
            <input
              name="photo_url"
              type="url"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            検証を記録
          </button>
        </form>
      </div>
    </div>
  );
}
