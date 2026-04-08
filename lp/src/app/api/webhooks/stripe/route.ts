import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollInCampaign } from "@/lib/step-mail";
import { calculateMakerReferralCommission } from "@/lib/maker-referral";
import { transferToPartner, calculateFees } from "@/lib/stripe-connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const sessionId = session.id;
  const affiliateCode = session.metadata?.affiliate_code;
  const lotId = session.metadata?.lot_id;
  const auctionId = session.metadata?.auction_id;
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  try {
    // 1. アフィリエイト処理
    if (affiliateCode && session.amount_total) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("commission_rate")
        .eq("code", affiliateCode)
        .single();

      const commissionRate = affiliate?.commission_rate ?? 2;
      const commission = Math.round(
        (session.amount_total * commissionRate) / 100
      );

      await supabase.from("referrals").upsert(
        {
          affiliate_code: affiliateCode,
          stripe_session_id: sessionId,
          amount: session.amount_total,
          commission,
        },
        { onConflict: "stripe_session_id" }
      );
    }

    // 2. ロット購入記録
    let purchaseId: string | undefined;
    if (lotId) {
      const { data: purchase } = await supabase
        .from("lot_purchases")
        .upsert(
          { lot_id: lotId, stripe_session_id: sessionId },
          { onConflict: "stripe_session_id" }
        )
        .select("id")
        .single();
      purchaseId = purchase?.id;
    }

    // 2.5. LPアナリティクス - コンバージョンイベント記録
    if (lotId) {
      await supabase.from("marketing_events").insert({
        event_type: "conversion",
        content_id: lotId,
        content_type: "lot_lp",
        metadata: {
          product_id: session.metadata?.product_id || null,
          lot_id: lotId,
          partner_id: session.metadata?.partner_id || null,
          stripe_session_id: sessionId,
          amount: session.amount_total,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 3. オークション落札処理
    if (auctionId) {
      await supabase
        .from("auctions")
        .update({ status: "落札済み" })
        .eq("id", auctionId);

      const { data: winningBid } = await supabase
        .from("bids")
        .select("agent_result_id")
        .eq("auction_id", auctionId)
        .order("amount", { ascending: false })
        .limit(1)
        .single();

      if (winningBid?.agent_result_id) {
        await supabase
          .from("agent_results")
          .update({ status: "購入済み" })
          .eq("id", winningBid.agent_result_id);
      }
    }

    // 4. ステップメール登録
    if (customerEmail) {
      await enrollInCampaign({
        email: customerEmail,
        name: customerName ?? undefined,
        metadata: {
          stripe_session_id: sessionId,
          lot_id: lotId ?? "",
          auction_id: auctionId ?? "",
          amount: String(session.amount_total ?? 0),
          affiliate_code: affiliateCode ?? "",
        },
        triggerEvent: auctionId ? "auction_won" : "purchase",
      });
    }

    // 5. メーカー紹介者報酬
    if (purchaseId && session.amount_total) {
      await calculateMakerReferralCommission(purchaseId, session.amount_total);
    }

    // 5.5. クリエイター紹介フィー（2%）
    // アフィリエイト（クリエイター）が販売した場合、そのクリエイターを紹介した人に2%
    if (affiliateCode && session.amount_total) {
      try {
        const { data: sellerAffiliate } = await supabase
          .from("affiliates")
          .select("id, is_creator, referred_by_affiliate_id")
          .eq("code", affiliateCode)
          .single();

        if (sellerAffiliate?.is_creator && sellerAffiliate.referred_by_affiliate_id) {
          const groupFee = Math.round(session.amount_total * 0.02); // 2%
          if (groupFee > 0) {
            const { data: referrer } = await supabase
              .from("affiliates")
              .select("code")
              .eq("id", sellerAffiliate.referred_by_affiliate_id)
              .single();

            if (referrer) {
              await supabase.from("referrals").insert({
                affiliate_code: referrer.code,
                stripe_session_id: `${sessionId}_group`,
                amount: session.amount_total,
                commission: groupFee,
              });
            }
          }
        }
      } catch (groupErr) {
        console.error("Group referral fee error:", groupErr);
      }
    }

    // 6. メーカーへの自動送金（Stripe Connect）
    const partnerId = session.metadata?.partner_id;
    if (partnerId && session.amount_total && session.amount_total > 0) {
      try {
        // パートナーのStripe Connect情報を取得
        const { data: partner } = await supabase
          .from("partners")
          .select("id, company_name, stripe_account_id, stripe_connect_status")
          .eq("id", partnerId)
          .single();

        if (partner?.stripe_account_id && partner.stripe_connect_status === "connected") {
          // アフィリエイト報酬率を取得（デフォルト2%）
          const affiliateRate = affiliateCode ? 2 : 0;
          const fees = calculateFees(session.amount_total, affiliateRate);

          // 送金実行
          const { transferId } = await transferToPartner({
            stripeAccountId: partner.stripe_account_id,
            amount: fees.netAmount,
            stripeSessionId: sessionId,
            description: `売上送金: ${partner.company_name} (${lotId || auctionId || "direct"})`,
          });

          // 送金記録を保存
          await supabase.from("partner_payouts").insert({
            partner_id: partnerId,
            stripe_session_id: sessionId,
            stripe_transfer_id: transferId,
            lot_purchase_id: purchaseId || null,
            gross_amount: fees.grossAmount,
            platform_fee: fees.platformFee,
            affiliate_commission: fees.affiliateCommission,
            net_amount: fees.netAmount,
            status: "transferred",
            transferred_at: new Date().toISOString(),
          });

          // 機密情報を含まない最小ログ（partner名・金額は除外）
          console.info("partner_payout_success", { partnerId, transferId });
        } else {
          // Stripe Connect未設定の場合はpendingで記録
          if (session.amount_total > 0) {
            const fees = calculateFees(session.amount_total, affiliateCode ? 2 : 0);
            await supabase.from("partner_payouts").insert({
              partner_id: partnerId,
              stripe_session_id: sessionId,
              lot_purchase_id: purchaseId || null,
              gross_amount: fees.grossAmount,
              platform_fee: fees.platformFee,
              affiliate_commission: fees.affiliateCommission,
              net_amount: fees.netAmount,
              status: "pending",
            });
          }
        }
      } catch (payoutErr) {
        console.error("Partner payout error:", payoutErr);
        // 送金失敗しても決済自体は成功させる
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }
}
