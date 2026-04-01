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
    const body = await request.json();
    const {
      lot_id,
      frequency,
      quantity,
      customer_name,
      customer_email,
      ref,
    } = body;

    if (!lot_id || !frequency || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    const validFrequencies = ["毎週", "隔週", "毎月", "隔月"];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "無効な配送頻度です" },
        { status: 400 }
      );
    }

    // ロット検証
    const { data: lot } = await getSupabase()
      .from("lots")
      .select("*")
      .eq("id", lot_id)
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

    // 在庫確保（初回分）
    const { data: reserved, error: reserveError } = await getSupabase().rpc(
      "reserve_lot_stock",
      { p_lot_id: lot_id, p_session_id: "" }
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

    // Price ID解決
    const priceId =
      lot.stripe_price_id ??
      product.stripe_price_id ??
      process.env.STRIPE_PRICE_ID!;

    // アフィリエイト検証
    let affiliateCode: string | null = null;
    if (ref) {
      const { data: affiliate } = await getSupabase()
        .from("affiliates")
        .select("code")
        .eq("code", ref)
        .single();
      if (affiliate) affiliateCode = ref;
    }

    // 次回配送日を計算
    const nextDate = calcNextDeliveryDate(frequency);

    // Stripe決済（初回）
    const metadata: Record<string, string> = {
      lot_id: lot.id,
      product_id: product.id,
      recurring: "true",
      frequency,
      customer_name,
      customer_email,
    };
    if (affiliateCode) metadata.affiliate_code = affiliateCode;
    if (product.partner_id) metadata.partner_id = product.partner_id;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email,
      line_items: [{ price: priceId, quantity: quantity || 1 }],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&recurring=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    // 定期購入レコード作成
    await getSupabase().from("recurring_orders").insert({
      lot_id: lot.id,
      product_id: product.id,
      partner_id: product.partner_id || null,
      customer_name,
      customer_email,
      frequency,
      quantity: quantity || 1,
      next_delivery_date: nextDate,
      stripe_session_id: session.id,
      affiliate_code: affiliateCode,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Recurring order error:", err);
    return NextResponse.json(
      { error: "定期購入の登録に失敗しました" },
      { status: 500 }
    );
  }
}

function calcNextDeliveryDate(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "毎週":
      now.setDate(now.getDate() + 7);
      break;
    case "隔週":
      now.setDate(now.getDate() + 14);
      break;
    case "毎月":
      now.setMonth(now.getMonth() + 1);
      break;
    case "隔月":
      now.setMonth(now.getMonth() + 2);
      break;
  }
  return now.toISOString().split("T")[0];
}
