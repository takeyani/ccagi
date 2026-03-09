import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import type { Lot, Product } from "@/lib/types";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ref = body.ref as string | undefined;
    const lotId = body.lot_id as string | undefined;

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

      if (lot.expiration_date && new Date(lot.expiration_date) < new Date()) {
        return NextResponse.json(
          { error: "このロットは販売期間が終了しています" },
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
    } else {
      // 従来のトップページ経由の購入
      priceId = process.env.STRIPE_PRICE_ID!;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
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
