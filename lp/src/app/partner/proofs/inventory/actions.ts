"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";

export async function submitInventoryProof(formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const lotId = formData.get("lot_id") as string;

  // Verify lot belongs to partner
  const { data: lot } = await supabase
    .from("lots")
    .select("id, products!inner(partner_id)")
    .eq("id", lotId)
    .eq("products.partner_id", partnerId)
    .single();

  if (!lot) throw new Error("指定されたロットは自社ロットではありません");

  const verifiedStock = Number(formData.get("verified_stock"));
  const warehouseCode = (formData.get("warehouse_code") as string) || null;
  const warehouseName = (formData.get("warehouse_name") as string) || null;
  const locationDetail = (formData.get("location_detail") as string) || null;

  // Insert verification record
  const { error: proofError } = await supabase
    .from("inventory_proofs")
    .insert({
      lot_id: lotId,
      verified_stock: verifiedStock,
      warehouse_code: warehouseCode,
      location_detail: locationDetail,
      verification_method: formData.get("verification_method") as string,
      photo_url: (formData.get("photo_url") as string) || null,
      verified_by: profile.id,
      notes: (formData.get("notes") as string) || null,
    });

  if (proofError) throw new Error(proofError.message);

  // Update lot warehouse info and verification timestamp
  await supabase
    .from("lots")
    .update({
      warehouse_code: warehouseCode,
      warehouse_name: warehouseName,
      location_detail: locationDetail,
      last_verified_at: new Date().toISOString(),
      last_verified_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lotId);

  revalidatePath("/partner/proofs/inventory");
}
