import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { thread_id, author_name, author_email, body: postBody } = body;

    if (!thread_id || !author_name || !postBody) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    if (typeof author_name !== "string" || author_name.length > 100) {
      return NextResponse.json(
        { error: "投稿者名は100文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (typeof postBody !== "string" || postBody.length > 5000) {
      return NextResponse.json(
        { error: "投稿内容は5000文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (author_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof author_email !== "string" || !emailRegex.test(author_email)) {
        return NextResponse.json(
          { error: "有効なメールアドレスを入力してください" },
          { status: 400 }
        );
      }
    }

    const { error } = await getSupabase()
      .from("board_posts")
      .insert({
        thread_id,
        author_name,
        author_email: author_email || null,
        body: postBody,
      });

    if (error) {
      console.error("board_posts insert error:", error);
      return NextResponse.json(
        { error: "投稿の作成中にエラーが発生しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Board posts API error:", err);
    return NextResponse.json(
      { error: "投稿の作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
