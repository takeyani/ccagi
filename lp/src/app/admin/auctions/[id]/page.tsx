import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cancelAuction } from "../actions";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: auction }, { data: bids }] = await Promise.all([
    supabase
      .from("auctions")
      .select("*, lots(lot_number, products(name))")
      .eq("id", id)
      .single(),
    supabase
      .from("bids")
      .select("*")
      .eq("auction_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!auction) notFound();

  const lot = auction.lots as {
    lot_number: string;
    products: { name: string } | null;
  } | null;

  const cancelWithId = cancelAuction.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">オークション詳細</h1>
      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">基本情報</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">商品</dt>
              <dd>{lot?.products?.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ロット</dt>
              <dd>{lot?.lot_number ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">開始価格</dt>
              <dd>¥{auction.start_price.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">即決価格</dt>
              <dd>
                {auction.buy_now_price
                  ? `¥${auction.buy_now_price.toLocaleString()}`
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">現在価格</dt>
              <dd className="font-bold">
                ¥{auction.current_price.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ステータス</dt>
              <dd>{auction.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">終了日時</dt>
              <dd>{new Date(auction.ends_at).toLocaleString("ja-JP")}</dd>
            </div>
          </dl>
          {auction.status === "出品中" && (
            <form action={cancelWithId} className="mt-4">
              <button
                type="submit"
                className="text-red-600 hover:text-red-800 text-sm"
              >
                オークションをキャンセル
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">
            入札履歴（{bids?.length ?? 0}件）
          </h2>
          <div className="space-y-2">
            {bids?.map((bid) => (
              <div
                key={bid.id}
                className="flex justify-between items-center text-sm border-b pb-2"
              >
                <div>
                  <span className="font-medium">{bid.bidder_name}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    {bid.bidder_email}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold">
                    ¥{bid.amount.toLocaleString()}
                  </span>
                  {bid.is_buy_now && (
                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                      即決
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!bids?.length && (
              <p className="text-gray-400 text-sm">入札なし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
