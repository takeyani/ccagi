"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export async function createDelivery(formData: FormData) {
  const { supabase } = await getSessionProfile();

  const { error } = await supabase.from("delivery_proofs").insert({
    lot_purchase_id: (formData.get("lot_purchase_id") as string) || null,
    ownership_record_id:
      (formData.get("ownership_record_id") as string) || null,
    carrier: (formData.get("carrier") as string) || null,
    tracking_number: (formData.get("tracking_number") as string) || null,
    shipped_at: (formData.get("shipped_at") as string) || null,
    estimated_delivery:
      (formData.get("estimated_delivery") as string) || null,
    status: "準備中",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/proofs/delivery");
  redirect("/admin/proofs/delivery");
}

export async function updateDeliveryStatus(id: string, formData: FormData) {
  const { supabase } = await getSessionProfile();
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
  if (status === "配達完了") {
    update.delivered_at = new Date().toISOString();
  }
  if (status === "受領確認済み") {
    update.delivered_at = update.delivered_at ?? new Date().toISOString();
    update.received_by = (formData.get("received_by") as string) || null;
  }

  const { error } = await supabase
    .from("delivery_proofs")
    .update(update)
    .eq("id", id);

  if (error) throw new Error(error.message);

  // If received, also confirm the ownership record
  if (status === "受領確認済み") {
    const { data: delivery } = await supabase
      .from("delivery_proofs")
      .select("ownership_record_id")
      .eq("id", id)
      .single();

    if (delivery?.ownership_record_id) {
      await supabase
        .from("ownership_records")
        .update({ status: "確定" })
        .eq("id", delivery.ownership_record_id)
        .eq("status", "仮確定");
    }
  }

  revalidatePath("/admin/proofs/delivery");
}
