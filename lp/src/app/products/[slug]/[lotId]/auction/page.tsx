import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuctionBidForm from "@/components/AuctionBidForm";
import AuctionCheckout from "@/components/AuctionCheckout";
import type { Product, Lot, Partner, Auction, Bid } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string; lotId: string }>;
  searchParams: Promise<{ agent_result_id?: string }>;
};

export default async function AuctionPage({ params, searchParams }: Props) {
  const { slug, lotId } = await params;
  const { agent_result_id } = await searchParams;

  // 商品取得
  const { data: product } = await getSupabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Product>();

  if (!product) notFound();

  // 取引先情報
  let partner: Partner | null = null;
  let parentPartner: Partner | null = null;

  if (product.partner_id) {
    const { data } = await getSupabase()
      .from("partners")
      .select("*")
      .eq("id", product.partner_id)
      .single<Partner>();
    partner = data;

    if (partner?.partner_type === "代理店" && partner.parent_partner_id) {
      const { data: parent } = await getSupabase()
        .from("partners")
        .select("*")
        .eq("id", partner.parent_partner_id)
        .single<Partner>();
      parentPartner = parent;
    }
  }

  const showBadge = partner?.certification_status === "認証済み";

  // ロット取得
  const { data: lot } = await getSupabase()
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .eq("product_id", product.id)
    .single<Lot>();

  if (!lot) notFound();

  // オークション取得
  const { data: auction } = await getSupabase()
    .from("auctions")
    .select("*")
    .eq("lot_id", lotId)
    .single<Auction>();

  if (!auction) notFound();

  // 入札履歴取得
  const { data: bids } = await getSupabase()
    .from("bids")
    .select("*")
    .eq("auction_id", auction.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Bid[]>();

  const bidCount = bids?.length ?? 0;

  // 終了判定（ページ表示時にチェック）
  const now = new Date();
  const endsAt = new Date(auction.ends_at);
  const isExpired = endsAt <= now;

  // 期限切れで出品中のままならステータス更新
  if (isExpired && auction.status === "出品中") {
    if (bidCount > 0) {
      await getSupabase()
        .from("auctions")
        .update({ status: "落札済み" })
        .eq("id", auction.id);
      auction.status = "落札済み";
    }
  }

  const isActive = auction.status === "出品中" && !isExpired;
  const isSold = auction.status === "落札済み" || (isExpired && bidCount > 0);
  const isNoBids = isExpired && bidCount === 0 && auction.status !== "落札済み";

  // 最高入札者
  const winningBid = bids && bids.length > 0 ? bids[0] : null;

  // バイヤー認証チェック
  let buyerAuth: { buyerId: string; displayName: string; email: string; agentResultId?: string } | undefined;
  try {
    const authSupabase = await createSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (user) {
      const { data: profile } = await authSupabase
        .from("user_profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();
      if (profile?.role === "buyer") {
        buyerAuth = {
          buyerId: user.id,
          displayName: profile.display_name ?? user.email?.split("@")[0] ?? "",
          email: user.email ?? "",
          agentResultId: agent_result_id,
        };
      }
    }
  } catch {
    // 非ログインの場合は匿名入札
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <nav className="mb-8 flex gap-4">
          <Link
            href={`/products/${slug}/${lotId}`}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; ロットページに戻る
          </Link>
        </nav>

        {/* Product image */}
        {product.image_url && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Product info */}
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {product.name}
        </h1>

        {/* 認証バッジ */}
        {showBadge && partner && (
          <div className="mt-3">
            {partner.partner_type === "メーカー" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                認証済みメーカー｜{partner.company_name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                正規代理店｜{partner.company_name}
                {parentPartner && `（${parentPartner.company_name}）`}
              </span>
            )}
          </div>
        )}

        {/* オークション情報カード */}
        <div className="mt-8 rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl">
          {/* ステータスバナー */}
          {isActive && (
            <div className="mb-6 rounded-lg bg-indigo-50 p-3 text-center">
              <span className="text-sm font-semibold text-indigo-700">オークション開催中</span>
            </div>
          )}
          {isSold && (
            <div className="mb-6 rounded-lg bg-green-50 p-3 text-center">
              <span className="text-sm font-semibold text-green-700">オークション終了 — 落札済み</span>
            </div>
          )}
          {isNoBids && (
            <div className="mb-6 rounded-lg bg-gray-100 p-3 text-center">
              <span className="text-sm font-semibold text-gray-600">オークション終了（入札なし）</span>
            </div>
          )}

          {/* 価格情報 */}
          <div className="space-y-3 text-center">
            <div>
              <span className="text-sm text-gray-500">現在の最高入札額</span>
              <p className="text-4xl font-extrabold text-gray-900">
                &yen;{auction.current_price.toLocaleString("ja-JP")}
              </p>
            </div>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <span>開始価格: &yen;{auction.start_price.toLocaleString("ja-JP")}</span>
              {auction.buy_now_price && (
                <span>即決価格: &yen;{auction.buy_now_price.toLocaleString("ja-JP")}</span>
              )}
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>終了時刻</span>
              <span className="font-medium text-gray-900">
                {endsAt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>入札件数</span>
              <span className="font-medium text-gray-900">{bidCount} 件</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>ロット番号</span>
              <span className="font-medium text-gray-900">{lot.lot_number}</span>
            </div>
            {lot.expiration_date && (
              <div className="flex justify-between border-b pb-2">
                <span>賞味期限</span>
                <span className="font-medium text-gray-900">{lot.expiration_date}</span>
              </div>
            )}
            <div className="flex justify-between pb-2">
              <span>在庫数</span>
              <span className="font-medium text-gray-900">
                {lot.stock > 0 ? `${lot.stock} 個` : "在庫なし"}
              </span>
            </div>
          </div>

          {/* 入札フォーム or 落札者決済 */}
          <div className="mt-8">
            {isActive && (
              <AuctionBidForm
                auctionId={auction.id}
                currentPrice={auction.current_price}
                minBidIncrement={auction.min_bid_increment}
                buyNowPrice={auction.buy_now_price}
                buyerAuth={buyerAuth}
              />
            )}

            {isSold && winningBid && (
              <AuctionCheckout
                auctionId={auction.id}
                winningAmount={auction.current_price}
                buyerEmail={buyerAuth?.email}
              />
            )}

            {isNoBids && (
              <p className="text-center text-gray-500">
                このオークションは入札がないまま終了しました。
              </p>
            )}
          </div>
        </div>

        {/* 入札履歴 */}
        {bids && bids.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">入札履歴</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">入札者</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">金額</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">時刻</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-4 py-3 text-gray-900">
                        {bid.bidder_name}
                        {bid.is_buy_now && (
                          <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                            即決
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        &yen;{bid.amount.toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {new Date(bid.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* リロード案内 */}
        {isActive && (
          <p className="mt-6 text-center text-sm text-gray-400">
            ページをリロードすると最新の入札状況を確認できます
          </p>
        )}
      </div>
    </div>
  );
}
