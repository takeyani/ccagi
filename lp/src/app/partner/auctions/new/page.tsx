import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";
import { createPartnerAuction } from "../actions";

export default async function NewPartnerAuctionPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // Only show lots from partner's products that aren't already in an auction
  const { data: lots } = await supabase
    .from("lots")
    .select("id, lot_number, products!inner(name, partner_id)")
    .eq("products.partner_id", partnerId)
    .eq("status", "販売中");

  // Filter out lots that already have auctions
  const { data: existingAuctions } = await supabase
    .from("auctions")
    .select("lot_id")
    .in("status", ["出品中"]);

  const auctionedLotIds = new Set(
    existingAuctions?.map((a) => a.lot_id) ?? []
  );
  const availableLots = lots?.filter((l) => !auctionedLotIds.has(l.id)) ?? [];

  return (
    <div>
      <Link href="/partner/auctions" className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← オークション一覧に戻る</Link>
      <h1 className="text-2xl font-bold mb-6">オークション出品</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createPartnerAuction} className="space-y-4">
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
                {availableLots.map((l) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const productName = (l.products as any)?.name ?? "";
                  return (
                    <option key={l.id} value={l.id}>
                      {productName} ({l.lot_number})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始価格 *
              </label>
              <input
                name="start_price"
                type="number"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                即決価格
              </label>
              <input
                name="buy_now_price"
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低入札単位
              </label>
              <input
                name="min_bid_increment"
                type="number"
                defaultValue={100}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日時 *
              </label>
              <input
                name="ends_at"
                type="datetime-local"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            出品
          </button>
        </form>
      </div>
    </div>
  );
}
