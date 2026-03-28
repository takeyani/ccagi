/**
 * Stripe Connect ユーティリティ
 * メーカー（パートナー）への自動送金を管理
 */
import Stripe from "stripe";

const PLATFORM_FEE_RATE = 0.12; // 12% プラットフォーム手数料

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

/**
 * Stripe Connect アカウント作成（Standard）
 */
export async function createConnectAccount(
  partnerId: string,
  email: string,
  companyName: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "standard",
    email,
    business_profile: {
      name: companyName,
    },
    metadata: {
      partner_id: partnerId,
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/stripe/refresh?partner_id=${partnerId}`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/stripe/complete?partner_id=${partnerId}`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Stripe Connect アカウントのステータス確認
 */
export async function getConnectAccountStatus(
  stripeAccountId: string
): Promise<{
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeAccountId);

  return {
    charges_enabled: account.charges_enabled ?? false,
    payouts_enabled: account.payouts_enabled ?? false,
    details_submitted: account.details_submitted ?? false,
  };
}

/**
 * オンボーディングURL再生成
 */
export async function createOnboardingLink(
  stripeAccountId: string,
  partnerId: string
): Promise<string> {
  const stripe = getStripe();

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/stripe/refresh?partner_id=${partnerId}`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/stripe/complete?partner_id=${partnerId}`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

/**
 * 手数料計算
 */
export function calculateFees(grossAmount: number, affiliateCommissionRate: number = 0) {
  const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE);
  const affiliateCommission = Math.round(grossAmount * affiliateCommissionRate / 100);
  const netAmount = grossAmount - platformFee - affiliateCommission;

  return {
    grossAmount,
    platformFee,
    affiliateCommission,
    netAmount: Math.max(0, netAmount),
  };
}

/**
 * メーカーへの送金実行
 * checkout.session.completed の後に呼ばれる
 */
export async function transferToPartner(params: {
  stripeAccountId: string;
  amount: number; // メーカー受取額（円）
  stripeSessionId: string;
  description: string;
}): Promise<{ transferId: string }> {
  const stripe = getStripe();

  // セッションからPaymentIntentを取得
  const session = await stripe.checkout.sessions.retrieve(params.stripeSessionId);
  const chargeId = await getChargeId(stripe, session.payment_intent as string);

  const transfer = await stripe.transfers.create({
    amount: params.amount,
    currency: "jpy",
    destination: params.stripeAccountId,
    source_transaction: chargeId,
    description: params.description,
    metadata: {
      stripe_session_id: params.stripeSessionId,
    },
  });

  return { transferId: transfer.id };
}

/**
 * PaymentIntentからCharge IDを取得
 */
async function getChargeId(stripe: Stripe, paymentIntentId: string): Promise<string> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });

  const charge = pi.latest_charge;
  if (typeof charge === "string") return charge;
  if (charge?.id) return charge.id;

  throw new Error("Charge not found for payment intent");
}

/**
 * ダッシュボードリンク生成
 */
export async function createDashboardLink(stripeAccountId: string): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accounts.createLoginLink(stripeAccountId);
  return link.url;
}
