"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export async function submitProductProof(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  // Verify product belongs to partner
  const productId = formData.get("product_id") as string;
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("partner_id", partnerId)
    .single();

  if (!product) throw new Error("指定された商品は自社商品ではありません");

  // Parse spec_data JSON if provided
  const specDataRaw = formData.get("spec_data") as string;
  let specData = null;
  if (specDataRaw) {
    try {
      specData = JSON.parse(specDataRaw);
    } catch {
      // Not valid JSON, store as key-value
      specData = { raw: specDataRaw };
    }
  }

  const { error } = await supabase.from("product_proofs").insert({
    product_id: productId,
    proof_type: formData.get("proof_type") as string,
    document_url: (formData.get("document_url") as string) || null,
    spec_data: specData,
    lab_name: (formData.get("lab_name") as string) || null,
    tested_at: (formData.get("tested_at") as string) || null,
    valid_until: (formData.get("valid_until") as string) || null,
    status: "未検証",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/partner/proofs/product");
  redirect("/partner/proofs/product");
}
