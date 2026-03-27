import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollInCampaign } from "@/lib/step-mail";
import { calculateMakerReferralCommission } from "@/lib/maker-referral";

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

      const commissionRate = affiliate?.commission_rate ?? 10;
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
  } catch (err) {
    console.error("Webhook processing error:", err);
  }
}
