import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const { profile, supabase } = await getSessionProfile();
  if (!profile.partner_id) throw new Error("No partner association");
  return { partnerId: profile.partner_id as string, supabase, profile };
}

export async function requireBuyerId() {
  const { user, profile, supabase } = await getSessionProfile();
  if (profile.role !== "buyer") throw new Error("Buyer role required");
  return { buyerId: user.id, supabase, profile };
}
