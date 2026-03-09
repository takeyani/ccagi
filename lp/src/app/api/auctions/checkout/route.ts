import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import type { Auction, Bid } from "@/lib/types";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auction_id, email } = body;

    if (!auction_id || !email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    // オークション取得
    const { data: auction } = await getSupabase()
      .from("auctions")
      .select("*")
      .eq("id", auction_id)
      .single<Auction>();

    if (!auction) {
      return NextResponse.json(
        { error: "オークションが見つかりません" },
        { status: 404 }
      );
    }

    if (auction.status !== "落札済み") {
      return NextResponse.json(
        { error: "このオークションはまだ終了していません" },
        { status: 400 }
      );
    }

    // 最高入札者を取得
    const { data: winningBid } = await getSupabase()
      .from("bids")
      .select("*")
      .eq("auction_id", auction_id)
      .order("amount", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single<Bid>();

    if (!winningBid) {
      return NextResponse.json(
        { error: "落札者が見つかりません" },
        { status: 404 }
      );
    }

    // メール照合
    if (winningBid.bidder_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "このメールアドレスでの落札はありません" },
        { status: 403 }
      );
    }

    // ロットの商品情報を取得
    const { data: lot } = await getSupabase()
      .from("lots")
      .select("product_id")
      .eq("id", auction.lot_id)
      .single();

    if (!lot) {
      return NextResponse.json(
        { error: "ロット情報が見つかりません" },
        { status: 404 }
      );
    }

    const { data: product } = await getSupabase()
      .from("products")
      .select("name")
      .eq("id", lot.product_id)
      .single();

    // Stripe checkout session 作成（price_dataで落札金額を動的指定）
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `【落札】${product?.name ?? "商品"}`,
            },
            unit_amount: auction.current_price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        auction_id: auction.id,
        lot_id: auction.lot_id,
        product_id: lot.product_id,
      },
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Auction checkout error:", err);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
