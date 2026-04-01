"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function createAdvertiser(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const apiKey = `asp_${randomBytes(16).toString("hex")}`;
  const apiSecret = `secret_${randomBytes(24).toString("hex")}`;

  const { error } = await supabase.from("asp_advertisers").insert({
    name: formData.get("name") as string,
    domain: formData.get("domain") as string,
    contact_email: formData.get("contact_email") as string,
    commission_rate: Number(formData.get("commission_rate")) || 5,
    cookie_days: Number(formData.get("cookie_days")) || 30,
    webhook_url: (formData.get("webhook_url") as string) || null,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/asp");
  redirect("/admin/asp");
}
