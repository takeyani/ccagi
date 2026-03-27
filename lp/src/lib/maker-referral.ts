import { createAdminClient } from "@/lib/supabase/admin";

export async function calculateMakerReferralCommission(
  lotPurchaseId: string,
  purchaseAmount: number
) {
  const supabase = createAdminClient();

  // Get lot -> product -> partner chain
  const { data: purchase } = await supabase
    .from("lot_purchases")
    .select(`
      id,
      lot_id,
      lots!inner (
        product_id,
        products!inner (
          partner_id,
          partners!inner (
            id,
            referred_by_affiliate_id
          )
        )
      )
    `)
    .eq("id", lotPurchaseId)
    .single();

  if (!purchase) return null;

  const lots = purchase.lots as unknown as {
    product_id: string;
    products: {
      partner_id: string;
      partners: {
        id: string;
        referred_by_affiliate_id: string | null;
      };
    };
  };

  const partnerId = lots.products.partners.id;
  const referrerAffiliateId = lots.products.partners.referred_by_affiliate_id;

  if (!referrerAffiliateId) return null;

  // Check if commission setting exists and is active
  const { data: commission } = await supabase
    .from("maker_referral_commissions")
    .select("id, commission_rate")
    .eq("referrer_affiliate_id", referrerAffiliateId)
    .eq("partner_id", partnerId)
    .eq("is_active", true)
    .single();

  if (!commission) {
    // Auto-create commission record with default 1%
    const { data: newCommission } = await supabase
      .from("maker_referral_commissions")
      .upsert(
        {
          referrer_affiliate_id: referrerAffiliateId,
          partner_id: partnerId,
          commission_rate: 0.01,
          is_active: true,
        },
        { onConflict: "referrer_affiliate_id,partner_id" }
      )
      .select("id, commission_rate")
      .single();

    if (!newCommission) return null;

    return await insertPayout(
      supabase,
      newCommission.id,
      lotPurchaseId,
      purchaseAmount,
      newCommission.commission_rate
    );
  }

  return await insertPayout(
    supabase,
    commission.id,
    lotPurchaseId,
    purchaseAmount,
    commission.commission_rate
  );
}

async function insertPayout(
  supabase: ReturnType<typeof createAdminClient>,
  commissionId: string,
  lotPurchaseId: string,
  purchaseAmount: number,
  commissionRate: number
) {
  const commissionAmount = Math.round(purchaseAmount * commissionRate);

  const { data, error } = await supabase
    .from("maker_referral_payouts")
    .insert({
      commission_id: commissionId,
      lot_purchase_id: lotPurchaseId,
      purchase_amount: purchaseAmount,
      commission_amount: commissionAmount,
      status: "pending",
    })
    .select("id, commission_amount")
    .single();

  if (error) {
    console.error("Maker referral payout error:", error);
    return null;
  }

  return data;
}

export async function getMakerReferralStats(affiliateId: string) {
  const supabase = createAdminClient();

  const { data: commissions } = await supabase
    .from("maker_referral_commissions")
    .select(`
      id, partner_id, commission_rate, is_active,
      partners!inner (company_name),
      maker_referral_payouts (
        id, purchase_amount, commission_amount, status, calculated_at
      )
    `)
    .eq("referrer_affiliate_id", affiliateId);

  if (!commissions) return [];

  return commissions.map((c) => {
    const payouts = (c.maker_referral_payouts || []) as {
      id: string;
      purchase_amount: number;
      commission_amount: number;
      status: string;
      calculated_at: string;
    }[];

    const totalCommission = payouts.reduce(
      (sum, p) => sum + p.commission_amount,
      0
    );
    const totalSales = payouts.reduce(
      (sum, p) => sum + p.purchase_amount,
      0
    );
    const pendingAmount = payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.commission_amount, 0);

    return {
      partnerId: c.partner_id,
      partnerName: (c.partners as unknown as { company_name: string })
        .company_name,
      commissionRate: c.commission_rate,
      isActive: c.is_active,
      totalSales,
      totalCommission,
      pendingAmount,
      payoutCount: payouts.length,
    };
  });
}
