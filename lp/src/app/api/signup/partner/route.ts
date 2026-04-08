import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { display_name, partner_type, ref_code } = body as {
    display_name: string;
    partner_type: "メーカー" | "代理店";
    ref_code?: string;
  };

  if (!partner_type || (partner_type !== "メーカー" && partner_type !== "代理店")) {
    return NextResponse.json({ error: "Invalid partner_type" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 紹介コードがあれば affiliate を取得
  let referredByAffiliateId: string | null = null;
  if (ref_code) {
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id")
      .eq("code", ref_code)
      .single();
    referredByAffiliateId = affiliate?.id ?? null;
  }

  const { error } = await admin.from("partners").upsert(
    {
      auth_user_id: user.id,
      company_name: display_name,
      partner_type,
      certification_status: "未認証",
      ...(referredByAffiliateId ? { referred_by_affiliate_id: referredByAffiliateId } : {}),
    },
    { onConflict: "auth_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
