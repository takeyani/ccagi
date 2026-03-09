import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyerId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ScoreBar } from "@/components/buyer/ScoreBar";
import { InquiryForm } from "@/components/buyer/InquiryForm";
import { updateResultStatus } from "../../../actions";

export default async function AgentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { buyerId } = await requireBuyerId();
  const supabase = await createSupabaseServerClient();

  // エージェント確認
  const { data: agent } = await supabase
    .from("buying_agents")
    .select("id, name")
    .eq("id", id)
    .eq("owner_id", buyerId)
    .single();

  if (!agent) notFound();

  // 結果取得
  const { data: results } = await supabase
    .from("agent_results")
    .select(
      `*,
       products(name, slug, base_price, partner_id,
         partners(company_name, certification_status, partner_type)),
       lots(lot_number, price, stock, status),
       agent_inquiries(partner_status, buyer_price, buyer_quantity, buyer_notes, rejection_reason)`
    )
    .eq("agent_id", id)
    .order("total_score", { ascending: false });

  // オークション情報を取得
  const lotIds = (results ?? []).map((r: { lot_id: string }) => r.lot_id);
  const auctionMap: Record<string, { id: string; current_price: number; ends_at: string; status: string; bid_count: number }> = {};

  if (lotIds.length > 0) {
    const { data: auctions } = await supabase
      .from("auctions")
      .select("id, lot_id, current_price, ends_at, status")
      .in("lot_id", lotIds)
      .in("status", ["出品中", "落札済み"]);

    if (auctions && auctions.length > 0) {
      const auctionIds = auctions.map((a: { id: string }) => a.id);
      const { data: bidCounts } = await supabase
        .from("bids")
        .select("auction_id")
        .in("auction_id", auctionIds);

      const bidCountMap: Record<string, number> = {};
      (bidCounts ?? []).forEach((b: { auction_id: string }) => {
        bidCountMap[b.auction_id] = (bidCountMap[b.auction_id] ?? 0) + 1;
      });

      for (const a of auctions) {
        auctionMap[a.lot_id] = {
          id: a.id,
          current_price: a.current_price,
          ends_at: a.ends_at,
          status: a.status,
          bid_count: bidCountMap[a.id] ?? 0,
        };
      }
    }
  }

  // 自動入札ログを取得
  const { data: autoBidLogs } = await supabase
    .from("auto_bid_logs")
    .select("agent_result_id, action, amount")
    .eq("agent_id", id);

  const autoBidMap: Record<string, { action: string; amount: number | null }> = {};
  for (const log of autoBidLogs ?? []) {
    if (log.agent_result_id) {
      // 最新のログを保持（後のものが上書き）
      autoBidMap[log.agent_result_id] = { action: log.action, amount: log.amount };
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">マッチング結果</h1>
          <p className="text-sm text-gray-500 mt-1">{agent.name}</p>
        </div>
        <Link
          href={`/buyer/agents/${id}`}
          className="text-teal-600 hover:text-teal-800 text-sm font-medium"
        >
          ← エージェント設定に戻る
        </Link>
      </div>

      {!results || results.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-gray-400">
          結果がありません。エージェントを実行してください。
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          {results.map((r: any) => {
            const price = r.lots?.price ?? r.products?.base_price;
            const partner = r.products?.partners;
            const rejectAction = updateResultStatus.bind(null, r.id, "却下");
            const inquiry = r.agent_inquiries?.[0];
            const auction = auctionMap[r.lot_id];
            const autoBid = autoBidMap[r.id];

            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  r.status === "却下" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {r.products?.name}
                      </h3>
                      {r.status !== "未確認" && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === "購入済み"
                              ? "bg-blue-100 text-blue-700"
                              : r.status === "却下"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      )}
                      {auction && auction.status === "出品中" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          オークション中
                        </span>
                      )}
                      {auction && auction.status === "落札済み" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          落札済み
                        </span>
                      )}
                      {autoBid && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            autoBid.action === "入札成功"
                              ? "bg-emerald-100 text-emerald-700"
                              : autoBid.action === "上限到達"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          自動入札: {autoBid.action}
                          {autoBid.amount != null && ` \u00a5${autoBid.amount.toLocaleString()}`}
                        </span>
                      )}
                      {inquiry && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inquiry.partner_status === "承諾"
                              ? "bg-blue-100 text-blue-700"
                              : inquiry.partner_status === "辞退"
                                ? "bg-red-100 text-red-600"
                                : inquiry.partner_status === "対応中"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          取引先: {inquiry.partner_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>
                        {partner?.company_name ?? "不明"}
                        {partner?.certification_status === "認証済み" && (
                          <span className="ml-1 text-green-600 font-medium">
                            [認証済]
                          </span>
                        )}
                      </span>
                      <span>({partner?.partner_type})</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>ロット: {r.lots?.lot_number}</span>
                      <span>在庫: {r.lots?.stock}</span>
                      <span className="font-medium">
                        &yen;{price?.toLocaleString()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          r.lots?.status === "販売中"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {r.lots?.status}
                      </span>
                    </div>
                    {auction && (
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-orange-700 bg-orange-50 rounded px-2 py-1">
                        <span>現在価格: &yen;{auction.current_price.toLocaleString()}</span>
                        <span>入札: {auction.bid_count}件</span>
                        <span>終了: {new Date(auction.ends_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</span>
                      </div>
                    )}
                  </div>

                  {/* スコア */}
                  <div className="w-56 space-y-1.5">
                    <ScoreBar
                      label="認証"
                      value={r.certification_score}
                    />
                    <ScoreBar
                      label="証明"
                      value={r.proof_chain_score}
                    />
                    <ScoreBar label="タグ" value={r.tag_match_score} />
                    <ScoreBar
                      label="成分"
                      value={r.spec_match_score}
                    />
                    <ScoreBar
                      label="価格"
                      value={r.price_match_score}
                    />
                  </div>

                  {/* 総合スコア */}
                  <div className="text-center w-20">
                    <p className="text-3xl font-bold text-teal-600">
                      {Number(r.total_score).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">総合</p>
                  </div>

                  {/* アクション */}
                  {r.status !== "却下" && r.status !== "購入済み" && (
                    <div className="flex flex-col gap-2 shrink-0 w-44">
                      {r.status === "未確認" && (
                        <InquiryForm
                          resultId={r.id}
                          lotPrice={price ?? 0}
                          lotStock={r.lots?.stock ?? 0}
                        />
                      )}
                      {inquiry && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {inquiry.buyer_price != null && (
                            <p>希望価格: &yen;{inquiry.buyer_price.toLocaleString()}</p>
                          )}
                          {inquiry.buyer_quantity != null && (
                            <p>数量: {inquiry.buyer_quantity}</p>
                          )}
                          {inquiry.buyer_notes && (
                            <p className="truncate">メモ: {inquiry.buyer_notes}</p>
                          )}
                          {inquiry.rejection_reason && (
                            <p className="text-red-600 font-medium">
                              辞退理由: {inquiry.rejection_reason}
                            </p>
                          )}
                        </div>
                      )}
                      <Link
                        href={`/products/${r.products?.slug}/${r.lot_id}`}
                        className="bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 text-sm font-medium text-center"
                      >
                        購入ページへ
                      </Link>
                      {auction && auction.status === "出品中" && (
                        <Link
                          href={`/products/${r.products?.slug}/${r.lot_id}/auction?agent_result_id=${r.id}`}
                          className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 text-sm font-medium text-center"
                        >
                          入札ページへ
                        </Link>
                      )}
                      <form action={rejectAction}>
                        <button
                          type="submit"
                          className="w-full text-gray-500 hover:text-red-600 text-sm border px-4 py-1.5 rounded-lg"
                        >
                          却下
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* eslint-enable @typescript-eslint/no-explicit-any */}
        </div>
      )}
    </div>
  );
}
