import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  // レート制限: 1分あたり 20回まで
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`creator-profile:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }

  const body = await request.json();
  const { code, email, name, bio, avatar_url } = body as {
    code: string;
    email: string;
    name: string;
    bio: string;
    avatar_url: string;
  };

  if (!code || !email || !name) {
    return NextResponse.json({ error: "code, email, name は必須です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // クリエイターのみ更新可能 + email検証で本人確認
  const { data: existing } = await admin
    .from("affiliates")
    .select("id, is_creator, email")
    .eq("code", code)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
  }

  if (!existing.is_creator) {
    return NextResponse.json({ error: "クリエイター権限が必要です" }, { status: 403 });
  }

  // email一致による本人確認
  if (existing.email !== email) {
    return NextResponse.json({ error: "認証情報が一致しません" }, { status: 403 });
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
