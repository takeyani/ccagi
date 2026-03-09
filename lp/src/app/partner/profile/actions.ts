"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";

export async function updatePartnerProfile(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { error } = await supabase
    .from("partners")
    .update({
      company_name: formData.get("company_name") as string,
      contact_name: (formData.get("contact_name") as string) || null,
      phone: (formData.get("phone") as string) || null,
      postal_code: (formData.get("postal_code") as string) || null,
      address: (formData.get("address") as string) || null,
      invoice_registration_number: (formData.get("invoice_registration_number") as string) || null,
      invoice_registration_date: (formData.get("invoice_registration_date") as string) || null,
    })
    .eq("id", partnerId);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/profile");
}
