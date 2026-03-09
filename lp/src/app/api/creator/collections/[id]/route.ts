import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { design_config, theme } = await request.json();

    const { error } = await getSupabase()
      .from("creator_lp_collections")
      .update({
        design_config,
        theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Collection save error:", error);
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
