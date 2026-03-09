import Link from "next/link";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const affiliateCode = session.metadata?.affiliate_code;

      // アフィリエイト処理（既存ロジック）
      if (affiliateCode && session.amount_total) {
        const { data: affiliate } = await getSupabase()
          .from("affiliates")
          .select("commission_rate")
          .eq("code", affiliateCode)
          .single();

        const commissionRate = affiliate?.commission_rate ?? 10;
        const commission = Math.round(
          (session.amount_total * commissionRate) / 100
        );

        await getSupabase().from("referrals").upsert(
          {
            affiliate_code: affiliateCode,
            stripe_session_id: session_id,
            amount: session.amount_total,
            commission,
          },
          { onConflict: "stripe_session_id" }
        );
      }

      // ロット在庫デクリメント（冪等性保証）
      const lotId = session.metadata?.lot_id;
      if (lotId) {
        const { error: insertError } = await getSupabase()
          .from("lot_purchases")
          .insert({
            lot_id: lotId,
            stripe_session_id: session_id,
          });

        // insertが成功 = 初回処理 → 在庫デクリメント
        // insertが失敗 = 重複 → スキップ（冪等性）
        if (!insertError) {
          await getSupabase().rpc("decrement_lot_stock", {
            p_lot_id: lotId,
          });
        }
      }

      // オークション落札決済の場合
      const auctionId = session.metadata?.auction_id;
      if (auctionId && lotId) {
        // lot_purchasesへの挿入は上で既に行われている
        // オークションステータスが落札済みであることを確認
        await getSupabase()
          .from("auctions")
          .update({ status: "落札済み" })
          .eq("id", auctionId);

        // 落札入札の agent_result_id を取得し、購入済みに更新
        const { data: winningBid } = await getSupabase()
          .from("bids")
          .select("agent_result_id")
          .eq("auction_id", auctionId)
          .order("amount", { ascending: false })
          .limit(1)
          .single();

        if (winningBid?.agent_result_id) {
          await getSupabase()
            .from("agent_results")
            .update({ status: "購入済み" })
            .eq("id", winningBid.agent_result_id);
        }
      }
    } catch (err) {
      console.error("Post-purchase processing error:", err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          ご購入ありがとうございます！
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          決済が正常に完了しました。
          <br />
          ご登録のメールアドレスにダウンロードリンクをお送りしました。
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
