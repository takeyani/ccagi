import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id } = body;

    if (!auction_id || !bidder_name || !bidder_email) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    if (!is_buy_now && (!amount || amount <= 0)) {
      return NextResponse.json(
        { error: "入札金額を正しく入力してください" },
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

    return NextResponse.json(result);
  } catch (err) {
    console.error("Bid API error:", err);
    return NextResponse.json(
      { error: "入札処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
