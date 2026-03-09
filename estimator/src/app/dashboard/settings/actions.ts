"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveSettings(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = {
    user_id: user.id,
    company_name: formData.get("company_name") as string,
    company_address: formData.get("company_address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    default_unit_price: Number(formData.get("default_unit_price")) || 700000,
    default_discount_rate:
      Number(formData.get("default_discount_rate")) || 30.0,
    updated_at: new Date().toISOString(),
  };

  // Check if settings exist
  const { data: existing } = await supabase
    .from("estimator_company_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase
      .from("estimator_company_settings")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await supabase.from("estimator_company_settings").insert(payload);
  }

  redirect("/dashboard/settings");
}
