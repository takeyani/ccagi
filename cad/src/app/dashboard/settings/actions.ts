"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName = formData.get("display_name") as string;

  await supabase
    .from("cad_user_profiles")
    .upsert({
      id: user.id,
      display_name: displayName,
      email: user.email ?? "",
      updated_at: new Date().toISOString(),
    });

  redirect("/dashboard/settings");
}
