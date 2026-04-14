import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Lot, Product } from "@/lib/types";

// 不正利用対策: 金額上限
const MAX_ORDER_AMOUNT = 500_000; // 1回の注文上限: ¥500,000
const HIGH_VALUE_THRESHOLD = 100_000; // ¥100,000以上は手動キャプチャ

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(request: Request) {
  try {
    // レート制限: 1時間あたり20回まで
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`checkout:${ip}`, { maxRequests: 20, windowMs: 3_600_000 });
    if (!allowed) {
      return NextResponse.json({ error: "リクエストが多すぎます。しばらく経ってから再度お試しください" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const ref = body.ref as string | undefined;
    const lotId = body.lot_id as string | undefined;
    const requestedQty = Math.max(1, parseInt(body.quantity, 10) || 1);

    const metadata: Record<string, string> = {};

    // アフィリエイト検証
    if (ref) {
      const { data: affiliate } = await getSupabase()
        .from("affiliates")
        .select("code")
        .eq("code", ref)
        .single();

      if (affiliate) {
        metadata.affiliate_code = ref;
      }
    }

    let priceId: string;

    if (lotId) {
      // ロット経由の購入
      const { data: lot } = await getSupabase()
        .from("lots")
        .select("*")
        .eq("id", lotId)
        .single<Lot>();

      if (!lot) {
        return NextResponse.json(
          { error: "ロットが見つかりません" },
          { status: 404 }
        );
      }

      if (lot.status !== "販売中" || lot.stock <= 0) {
        return NextResponse.json(
          { error: "このロットは現在購入できません" },
          { status: 400 }
        );
      }

      if (lot.stock < requestedQty) {
        return NextResponse.json(
          { error: `在庫が不足しています（残り${lot.stock}${lot.selling_unit ?? "個"}）` },
          { status: 400 }
        );
      }

      if (lot.min_order_units && requestedQty < lot.min_order_units) {
        return NextResponse.json(
          { error: `最小注文数は${lot.min_order_units}${lot.selling_unit ?? "個"}です` },
          { status: 400 }
        );
      }

      if (lot.expiration_date && new Date(lot.expiration_date) < new Date()) {
        return NextResponse.json(
          { error: "このロットは販売期間が終了しています" },
          { status: 400 }
        );
      }

      // Atomically reserve stock
      const { data: reserved, error: reserveError } = await getSupabase().rpc(
        "reserve_lot_stock",
        { p_lot_id: lotId, p_session_id: "", p_quantity: requestedQty }
      );

      if (reserveError || !reserved) {
        return NextResponse.json(
          { error: "在庫が確保できませんでした" },
          { status: 400 }
        );
      }

      const { data: product } = await getSupabase()
        .from("products")
        .select("*")
        .eq("id", lot.product_id)
        .single<Product>();

      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: "商品が見つかりません" },
          { status: 404 }
        );
      }

      // Price ID解決: lot > product > env
      priceId =
        lot.stripe_price_id ??
        product.stripe_price_id ??
        process.env.STRIPE_PRICE_ID!;

      metadata.lot_id = lot.id;
      metadata.product_id = product.id;
      metadata.shipping_method = lot.shipping_method;
      metadata.shipping_fee = String(lot.shipping_fee);
      metadata.selling_unit = lot.selling_unit ?? "個";
      if (lot.units_per_case) {
        metadata.units_per_case = String(lot.units_per_case);
      }
      if (product.partner_id) {
        metadata.partner_id = product.partner_id;
      }
      metadata.quantity = String(requestedQty);
    } else {
      // 従来のトップページ経由の購入
      priceId = process.env.STRIPE_PRICE_ID!;
    }

    // 金額上限チェック（ロット経由の場合）
    if (lotId) {
      const lotPrice = Number(metadata.shipping_fee ?? 0);
      const { data: lotData } = await getSupabase()
        .from("lots")
        .select("price")
        .eq("id", lotId)
        .single();
      const totalAmount = ((lotData?.price ?? 0) * requestedQty) + lotPrice;

      if (totalAmount > MAX_ORDER_AMOUNT) {
        return NextResponse.json(
          { error: `1回の注文上限は¥${MAX_ORDER_AMOUNT.toLocaleString()}です。数量を減らすか、複数回に分けてご注文ください。` },
          { status: 400 }
        );
      }
    }

    const stripe = getStripe();

    // 高額注文（¥100,000以上）は手動キャプチャ（管理者確認後に決済確定）
    const lotPrice = metadata.lot_id
      ? await getSupabase().from("lots").select("price").eq("id", metadata.lot_id).single().then(r => (r.data?.price ?? 0) * requestedQty)
      : 0;
    const isHighValue = lotPrice >= HIGH_VALUE_THRESHOLD;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: requestedQty,
        },
      ],
      metadata: {
        ...metadata,
        ...(isHighValue ? { high_value: "true", requires_review: "true" } : {}),
      },
      ...(isHighValue ? {
        payment_intent_data: {
          capture_method: "manual" as const,
          description: `高額注文（¥${lotPrice.toLocaleString()}）- 管理者確認後にキャプチャ`,
        },
      } : {}),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
