import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { design_config, theme, code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: "認証情報が不足しています" }, { status: 401 });
    }

    const admin = createAdminClient();

    // クリエイターを code + email で本人確認
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id, email, is_creator")
      .eq("code", code)
      .maybeSingle();

    if (!affiliate || affiliate.email !== email || !affiliate.is_creator) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 403 });
    }

    // コレクションの所有権をDB側で検証
    const { data: existing } = await admin
      .from("creator_lp_collections")
      .select("affiliate_id")
      .eq("id", id)
      .maybeSingle();

    if (!existing || existing.affiliate_id !== affiliate.id) {
      return NextResponse.json({ error: "このコレクションを編集する権限がありません" }, { status: 403 });
    }

    const { error } = await admin
      .from("creator_lp_collections")
      .update({
        design_config,
        theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "リクエストの処理に失敗しました" }, { status: 500 });
  }
}
