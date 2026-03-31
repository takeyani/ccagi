import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getSessionProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  return { user, profile, supabase };
}

export async function requirePartnerId() {
  const { user, profile, supabase } = await getSessionProfile();

  if (!profile.partner_id) {
    // パートナー未登録の場合、admin権限で自動作成
    const admin = createAdminClient();
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

  if (!profile.partner_id) throw new Error("No partner association");
  return { partnerId: profile.partner_id as string, supabase, profile };
}

export async function requireBuyerId() {
  const { user, profile, supabase } = await getSessionProfile();
  if (profile.role !== "buyer") throw new Error("Buyer role required");
  return { buyerId: user.id, supabase, profile };
}
