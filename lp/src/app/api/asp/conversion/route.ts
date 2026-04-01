import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが必要です" }, { status: 401 });
    }

    // 広告主認証
    const { data: advertiser } = await getSupabase()
      .from("asp_advertisers")
      .select("id, status")
      .eq("api_key", apiKey)
      .single();

    if (!advertiser || advertiser.status !== "有効") {
      return NextResponse.json({ error: "無効なAPIキーです" }, { status: 401 });
    }

    const body = await request.json();
    const { click_id, order_id, amount } = body;

    if (!click_id || !amount) {
      return NextResponse.json({ error: "click_idとamountは必須です" }, { status: 400 });
    }

    // クリック情報取得
    const { data: click } = await getSupabase()
      .from("asp_clicks")
      .select("program_id, affiliate_code")
      .eq("click_id", click_id)
      .single();

    if (!click) {
      return NextResponse.json({ error: "無効なclick_idです" }, { status: 400 });
    }

    // プログラム情報取得
    const { data: program } = await getSupabase()
      .from("asp_programs")
      .select("commission_type, commission_amount, commission_rate, advertiser_id")
      .eq("id", click.program_id)
      .single();

    if (!program || program.advertiser_id !== advertiser.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // コミッション計算
    let commission = 0;
    if (program.commission_type === "成果報酬") {
      commission = program.commission_rate
        ? Math.floor((amount * Number(program.commission_rate)) / 100)
        : program.commission_amount;
    } else if (program.commission_type === "クリック報酬") {
      commission = program.commission_amount;
    } else if (program.commission_type === "リード報酬") {
      commission = program.commission_amount;
    }

    // コンバージョン記録
    const { data: conversion, error } = await getSupabase()
      .from("asp_conversions")
      .insert({
        program_id: click.program_id,
        affiliate_code: click.affiliate_code,
        click_id,
        order_id: order_id || null,
        amount,
        commission,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "このclick_idは既に処理済みです" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ conversion_id: conversion.id, commission });
  } catch (err) {
    console.error("ASP conversion error:", err);
    return NextResponse.json({ error: "コンバージョン記録に失敗しました" }, { status: 500 });
  }
}
