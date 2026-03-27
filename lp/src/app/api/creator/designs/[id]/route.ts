import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { design_config, theme, affiliate_id } = await request.json();

    if (!affiliate_id) {
      return NextResponse.json(
        { error: "認証情報が不足しています" },
        { status: 400 }
      );
    }

    // Ownership validation: verify the design belongs to this affiliate
    const { data: existing } = await getSupabase()
      .from("creator_lp_designs")
      .select("affiliate_id")
      .eq("id", id)
      .single();

    if (!existing || existing.affiliate_id !== affiliate_id) {
      return NextResponse.json(
        { error: "このデザインを編集する権限がありません" },
        { status: 403 }
      );
    }

    const { error } = await getSupabase()
      .from("creator_lp_designs")
      .update({
        design_config,
        theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("affiliate_id", affiliate_id);

    if (error) {
      console.error("Design save error:", error);
      return NextResponse.json(
        { error: "保存に失敗しました" },
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
