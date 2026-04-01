import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, lot_id, partner_id, questioner_name, questioner_email, question } = body;

    if (!product_id || !partner_id || !questioner_name || !question) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    if (typeof questioner_name !== "string" || questioner_name.length > 100) {
      return NextResponse.json(
        { error: "お名前は100文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (typeof question !== "string" || question.length > 2000) {
      return NextResponse.json(
        { error: "質問は2000文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (questioner_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof questioner_email !== "string" || !emailRegex.test(questioner_email)) {
        return NextResponse.json(
          { error: "有効なメールアドレスを入力してください" },
          { status: 400 }
        );
      }
    }

    const { error } = await getSupabase()
      .from("product_questions")
      .insert({
        product_id,
        lot_id: lot_id || null,
        partner_id,
        questioner_name,
        questioner_email: questioner_email || null,
        question,
      });

    if (error) {
      console.error("product_questions insert error:", error);
      return NextResponse.json(
        { error: "質問の送信中にエラーが発生しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Questions API error:", err);
    return NextResponse.json(
      { error: "質問の送信中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
