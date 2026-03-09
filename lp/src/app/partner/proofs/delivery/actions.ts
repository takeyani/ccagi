"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";

export async function updatePartnerDeliveryStatus(
  id: string,
  formData: FormData
) {
  const { supabase } = await requirePartnerId();
  const status = formData.get("status") as string;

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "発送済み") {
    update.shipped_at = new Date().toISOString();
    update.carrier = (formData.get("carrier") as string) || undefined;
    update.tracking_number =
      (formData.get("tracking_number") as string) || undefined;
  }

  const { error } = await supabase
    .from("delivery_proofs")
    .update(update)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/proofs/delivery");
}
