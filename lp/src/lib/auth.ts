import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getSessionProfile() {
  let user;
  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // セッション取得失敗
  }
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  return { user, profile, supabase: admin };
}

export async function requirePartnerId() {
  const { user, profile, supabase: admin } = await getSessionProfile();

  if (!profile.partner_id) {
    const displayName = profile.display_name || user.email?.split("@")[0] || "パートナー";
    const { data: newPartner } = await admin
      .from("partners")
      .insert({
        company_name: displayName,
        partner_type: "メーカー",
        certification_status: "未認証",
      })
      .select("id")
      .single();

    if (newPartner) {
      await admin
        .from("user_profiles")
        .update({ partner_id: newPartner.id })
        .eq("id", user.id);
      profile.partner_id = newPartner.id;
    }
  }

  if (!profile.partner_id) redirect("/login");
  return { partnerId: profile.partner_id as string, supabase: admin, profile };
}

export async function requireBuyerId() {
  const { user, profile, supabase: admin } = await getSessionProfile();
  if (profile.role !== "buyer") redirect("/login");
  return { buyerId: user.id, supabase: admin, profile };
}

export async function requireAdmin() {
  const { user, profile, supabase: admin } = await getSessionProfile();
  if (profile.role !== "admin") redirect("/partner");
  return { user, profile, supabase: admin };
}
