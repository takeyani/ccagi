"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export async function updatePartnerRecurringStatus(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("recurring_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/recurring");
  redirect(`/partner/recurring/${id}`);
}
