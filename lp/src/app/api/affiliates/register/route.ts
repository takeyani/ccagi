import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function generateCode(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || "ref"}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const { name, email, is_creator } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const { data: existing } = await getSupabase()
      .from("affiliates")
      .select("code")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ code: existing.code, existing: true });
    }

    const code = generateCode(name);

    const { data, error } = await getSupabase()
      .from("affiliates")
      .insert({ name, email, code, is_creator: !!is_creator })
      .select("code")
      .single();

    if (error) {
      console.error("Affiliate registration error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ code: data.code, existing: false });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
