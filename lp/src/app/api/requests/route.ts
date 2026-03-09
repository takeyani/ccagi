import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { name, email, description, budget, deadline } =
      await request.json();

    if (!name || !email || !description || !budget) {
      return NextResponse.json(
        { error: "名前、メール、依頼内容、予算は必須です" },
        { status: 400 }
      );
    }

    const { error } = await getSupabase()
      .from("requests")
      .insert({ name, email, description, budget, deadline: deadline || null });

    if (error) {
      console.error("Request submission error:", error);
      return NextResponse.json(
        { error: "送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
