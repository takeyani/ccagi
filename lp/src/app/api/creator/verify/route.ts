import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "コードは必須です" },
        { status: 400 }
      );
    }

    const { data: affiliate } = await getSupabase()
      .from("affiliates")
      .select("*")
      .eq("code", code)
      .eq("is_creator", true)
      .single();

    if (!affiliate) {
      return NextResponse.json(
        { error: "クリエイターコードが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ affiliate });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
