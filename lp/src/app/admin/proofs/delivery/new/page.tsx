import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createDelivery } from "../actions";

export default async function NewDeliveryPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: purchases }, { data: ownerships }] = await Promise.all([
    supabase
      .from("lot_purchases")
      .select("id, stripe_session_id, lots(lot_number, products(name))")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("ownership_records")
      .select("id, to_entity_name, transfer_type, lots(lot_number)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">配送証明 新規作成</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createDelivery} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                購入記録
              </label>
              <select
                name="lot_purchase_id"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 選択 --</option>
                {purchases?.map((p) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const lot = (p as any).lots;
                  return (
                    <option key={p.id} value={p.id}>
                      {lot?.products?.name ?? "?"} ({lot?.lot_number ?? "?"})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所有移転記録
              </label>
              <select
                name="ownership_record_id"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 選択 --</option>
                {ownerships?.map((o) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const lot = (o as any).lots;
                  return (
                    <option key={o.id} value={o.id}>
                      {o.transfer_type}: {o.to_entity_name ?? "?"} (
                      {lot?.lot_number ?? "?"})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                運送業者
              </label>
              <input
                name="carrier"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="ヤマト運輸、佐川急便、etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                追跡番号
              </label>
              <input
                name="tracking_number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                発送日時
              </label>
              <input
                name="shipped_at"
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配達予定日
              </label>
              <input
                name="estimated_delivery"
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  );
}
