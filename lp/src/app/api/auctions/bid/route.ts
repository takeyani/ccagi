import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // レート制限: 1時間あたり30回まで
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`auction-bid:${ip}`, { maxRequests: 30, windowMs: 3_600_000 });
    if (!allowed) {
      return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
    }

    const body = await request.json();
    const { auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id } = body;

    if (!auction_id || !bidder_name || !bidder_email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    // Input validation
    if (!is_buy_now && (!amount || amount <= 0 || !Number.isInteger(amount))) {
      return NextResponse.json(
        { error: "入札金額を正しく入力してください" },
        { status: 400 }
      );
    }

    if (typeof bidder_name !== "string" || bidder_name.length > 100) {
      return NextResponse.json(
        { error: "入札者名は100文字以内で入力してください" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof bidder_email !== "string" || !emailRegex.test(bidder_email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabase().rpc("place_bid", {
      p_auction_id: auction_id,
      p_bidder_name: bidder_name,
      p_bidder_email: bidder_email,
      p_amount: is_buy_now ? 0 : amount,
      p_is_buy_now: is_buy_now ?? false,
      p_buyer_id: buyer_id ?? null,
      p_agent_result_id: agent_result_id ?? null,
    });

    if (error) {
      console.error("place_bid RPC error:", error);
      return NextResponse.json(
        { error: "入札処理中にエラーが発生しました" },
        { status: 500 }
      );
    }

    const result = data as { success: boolean; error?: string; amount?: number; status?: string };

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // 入札成功 & オークション継続中の場合、自動リビッドを非同期トリガー
    if (result.status === "出品中") {
      const admin = createAdminClient();
      (async () => {
        for (let round = 0; round < 10; round++) {
          const { data: rebidCount, error: rebidErr } = await admin.rpc(
            "auto_rebid_for_auction",
            { p_auction_id: auction_id }
          );
          if (rebidErr || !rebidCount || rebidCount === 0) break;
        }
      })().catch((err) => console.error("auto_rebid error:", err));
    }

    return NextResponse.json({
      success: result.success,
      amount: result.amount,
      status: result.status,
    });
  } catch (err) {
    console.error("Bid API error:", err);
    return NextResponse.json(
      { error: "入札処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
