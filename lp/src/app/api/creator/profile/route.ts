import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const body = await request.json();
  const { code, name, bio, avatar_url } = body as {
    code: string;
    name: string;
    bio: string;
    avatar_url: string;
  };

  if (!code || !name) {
    return NextResponse.json({ error: "code と name は必須です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // クリエイターのみ更新可能
  const { data: existing } = await admin
    .from("affiliates")
    .select("id, is_creator")
    .eq("code", code)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
  }

  if (!existing.is_creator) {
    return NextResponse.json({ error: "クリエイター権限が必要です" }, { status: 403 });
  }

  const { error } = await admin
    .from("affiliates")
    .update({ name, bio, avatar_url })
    .eq("id", existing.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
