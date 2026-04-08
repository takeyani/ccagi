import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // レート制限: 1時間あたり 10回まで（IP単位）
  const ip = getClientIp(request);
  const { allowed } = rateLimit(`signup:${ip}`, { maxRequests: 10, windowMs: 3_600_000 });
  if (!allowed) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらく経ってから再度お試しください" }, { status: 429 });
  }

  const body = await request.json();
  const { user_id, display_name, role, partner_type, ref_code } = body as {
    user_id: string;
    display_name: string;
    role: "partner" | "buyer";
    partner_type: "メーカー" | "代理店" | null;
    ref_code?: string | null;
  };

  if (!user_id || !display_name || !role) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }
  // セキュリティ: roleは partner/buyer のみ許可（adminは手動付与のみ）
  if (role !== "partner" && role !== "buyer") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. auth user の存在を検証
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(user_id);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "認証ユーザーが見つかりません" }, { status: 404 });
  }

  // 2. なりすまし防止: 既に user_profiles が存在する場合、本人セッションでなければ拒否
  const { data: existingProfile } = await admin
    .from("user_profiles")
    .select("id, role")
    .eq("id", user_id)
    .maybeSingle();

  if (existingProfile) {
    // 既存プロフィールの上書きはセッション本人のみ許可
    const sessionClient = await createSupabaseServerClient();
    const {
      data: { user: sessionUser },
    } = await sessionClient.auth.getUser();
    if (!sessionUser || sessionUser.id !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // 既存プロフィールがadminの場合、role降格を防止
    if (existingProfile.role === "admin") {
      return NextResponse.json({ error: "管理者ロールは変更できません" }, { status: 403 });
    }
  }

  // 2. user_profiles を upsert
  const { error: profileError } = await admin.from("user_profiles").upsert({
    id: user_id,
    display_name,
    role,
  });
  if (profileError) {
    return NextResponse.json({ error: "プロフィール作成失敗: " + profileError.message }, { status: 500 });
  }

  // 3. role=partner の場合は partners も作成
  if (role === "partner" && partner_type) {
    // 既存の partner を auth_user_id で確認
    const { data: existingPartner } = await admin
      .from("partners")
      .select("id")
      .eq("auth_user_id", user_id)
      .maybeSingle();

    let partnerId = existingPartner?.id;

    if (!partnerId) {
      // 紹介コードがあれば affiliate を取得
      let referredByAffiliateId: string | null = null;
      if (ref_code) {
        const { data: affiliate } = await admin
          .from("affiliates")
          .select("id")
          .eq("code", ref_code)
          .maybeSingle();
        referredByAffiliateId = affiliate?.id ?? null;
      }

      const { data: newPartner, error: partnerError } = await admin
        .from("partners")
        .insert({
          auth_user_id: user_id,
          company_name: display_name,
          partner_type,
          certification_status: "未認証",
          ...(referredByAffiliateId ? { referred_by_affiliate_id: referredByAffiliateId } : {}),
        })
        .select("id")
        .single();

      if (partnerError || !newPartner) {
        return NextResponse.json({ error: "パートナー作成失敗: " + (partnerError?.message ?? "unknown") }, { status: 500 });
      }
      partnerId = newPartner.id;
    }

    // 4. user_profiles.partner_id を更新
    const { error: linkError } = await admin
      .from("user_profiles")
      .update({ partner_id: partnerId })
      .eq("id", user_id);
    if (linkError) {
      return NextResponse.json({ error: "パートナー紐付け失敗: " + linkError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
