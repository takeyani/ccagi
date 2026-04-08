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

        const commissionRate = affiliate?.commission_rate ?? 2;
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

      // ロット購入記録（冪等性保証） ※在庫はチェックアウト時に予約済み
      const lotId = session.metadata?.lot_id;
      if (lotId) {
        await getSupabase()
          .from("lot_purchases")
          .insert({
            lot_id: lotId,
            stripe_session_id: session_id,
          });
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
      // ステップメール登録（フォールバック - webhook が主）
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        try {
          const { enrollInCampaign } = await import("@/lib/step-mail");
          await enrollInCampaign({
            email: customerEmail,
            name: session.customer_details?.name ?? undefined,
            metadata: {
              stripe_session_id: session_id,
              lot_id: lotId ?? "",
              auction_id: auctionId ?? "",
              amount: String(session.amount_total ?? 0),
            },
            triggerEvent: auctionId ? "auction_won" : "purchase",
          });
        } catch (mailErr) {
          console.error("Step mail enrollment error:", mailErr);
        }
      }

      // メーカー紹介者報酬（フォールバック）
      if (lotId && session.amount_total) {
        try {
          const { calculateMakerReferralCommission } = await import(
            "@/lib/maker-referral"
          );
          const { data: purchase } = await getSupabase()
            .from("lot_purchases")
            .select("id")
            .eq("stripe_session_id", session_id)
            .single();
          if (purchase) {
            await calculateMakerReferralCommission(
              purchase.id,
              session.amount_total
            );
          }
        } catch (refErr) {
          console.error("Maker referral error:", refErr);
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
          注文確認メールをお送りしました。注文状況はマイページからご確認いただけます。
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
