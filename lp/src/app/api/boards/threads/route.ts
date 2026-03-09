import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target_type, target_id, title, author_name, author_email } = body;

    if (!target_type || !target_id || !title || !author_name) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabase()
      .from("board_threads")
      .insert({
        target_type,
        target_id,
        title,
        author_name,
        author_email: author_email || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("board_threads insert error:", error);
      return NextResponse.json(
        { error: "スレッドの作成中にエラーが発生しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, thread_id: data.id });
  } catch (err) {
    console.error("Board threads API error:", err);
    return NextResponse.json(
      { error: "スレッドの作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
