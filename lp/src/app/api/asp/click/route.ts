import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { program_id, affiliate_code } = body;

    if (!program_id || !affiliate_code) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // プログラム検証
    const { data: program } = await getSupabase()
      .from("asp_programs")
      .select("id, status")
      .eq("id", program_id)
      .single();

    if (!program || program.status !== "募集中") {
      return NextResponse.json({ error: "無効なプログラムです" }, { status: 400 });
    }

    // クリックID生成
    const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const ua = request.headers.get("user-agent") || "";
    const referrer = body.referrer_url || request.headers.get("referer") || "";

    await getSupabase().from("asp_clicks").insert({
      program_id,
      affiliate_code,
      click_id: clickId,
      referrer_url: referrer,
      landing_url: body.landing_url || null,
      ip_address: ip,
      user_agent: ua,
    });

    return NextResponse.json({ click_id: clickId });
  } catch (err) {
    console.error("ASP click error:", err);
    return NextResponse.json({ error: "クリック記録に失敗しました" }, { status: 500 });
  }
}
