import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  createConnectAccount,
  getConnectAccountStatus,
  createOnboardingLink,
  createDashboardLink,
} from "@/lib/stripe-connect";

export const runtime = "nodejs";

/**
 * GET /api/stripe-connect?partner_id=xxx
 * Stripe Connectアカウントのステータス取得
 */
export async function GET(request: Request) {
  // 認証チェック
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const ssc = await createSupabaseServerClient();
  const { data: { user } } = await ssc.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partner_id");

  if (!partnerId) {
    return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: partner } = await supabase
    .from("partners")
    .select("id, company_name, stripe_account_id, stripe_connect_status, stripe_onboarding_completed_at")
    .eq("id", partnerId)
    .single();

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  let stripeStatus = null;
  let dashboardUrl = null;

  if (partner.stripe_account_id) {
    try {
      stripeStatus = await getConnectAccountStatus(partner.stripe_account_id);

      // ステータス更新
      if (stripeStatus.charges_enabled && stripeStatus.payouts_enabled) {
        if (partner.stripe_connect_status !== "connected") {
          await supabase
            .from("partners")
            .update({
              stripe_connect_status: "connected",
              stripe_onboarding_completed_at: new Date().toISOString(),
            })
            .eq("id", partnerId);
        }
        dashboardUrl = await createDashboardLink(partner.stripe_account_id);
      }
    } catch (err) {
      console.error("Stripe status check error:", err);
    }
  }

  // 売上サマリー
  const { data: payouts } = await supabase
    .from("partner_payouts")
    .select("gross_amount, platform_fee, affiliate_commission, net_amount, status")
    .eq("partner_id", partnerId);

  const payoutSummary = {
    total_gross: payouts?.reduce((s, p) => s + (p.gross_amount || 0), 0) || 0,
    total_platform_fee: payouts?.reduce((s, p) => s + (p.platform_fee || 0), 0) || 0,
    total_affiliate: payouts?.reduce((s, p) => s + (p.affiliate_commission || 0), 0) || 0,
    total_net: payouts?.reduce((s, p) => s + (p.net_amount || 0), 0) || 0,
    total_transferred: payouts?.filter((p) => p.status === "transferred").reduce((s, p) => s + (p.net_amount || 0), 0) || 0,
    total_pending: payouts?.filter((p) => p.status === "pending").reduce((s, p) => s + (p.net_amount || 0), 0) || 0,
    transaction_count: payouts?.length || 0,
  };

  return NextResponse.json({
    partner_id: partnerId,
    stripe_account_id: partner.stripe_account_id,
    stripe_connect_status: partner.stripe_connect_status,
    stripe_status: stripeStatus,
    dashboard_url: dashboardUrl,
    payout_summary: payoutSummary,
  });
}

/**
 * POST /api/stripe-connect
 * Stripe Connectオンボーディング開始
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { partner_id } = body;

  if (!partner_id) {
    return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: partner } = await supabase
    .from("partners")
    .select("id, company_name, email, stripe_account_id, stripe_connect_status")
    .eq("id", partner_id)
    .single();

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // 既にアカウントがある場合はオンボーディングURLを再生成
  if (partner.stripe_account_id) {
    try {
      const url = await createOnboardingLink(partner.stripe_account_id, partner_id);
      return NextResponse.json({ onboarding_url: url });
    } catch {
      // アカウントが無効な場合は新規作成にフォールバック
    }
  }

  // 新規Stripe Connectアカウント作成
  const result = await createConnectAccount(
    partner_id,
    partner.email,
    partner.company_name
  );

  // DB更新
  await supabase
    .from("partners")
    .update({
      stripe_account_id: result.accountId,
      stripe_connect_status: "pending",
    })
    .eq("id", partner_id);

  return NextResponse.json({
    stripe_account_id: result.accountId,
    onboarding_url: result.onboardingUrl,
  });
}
