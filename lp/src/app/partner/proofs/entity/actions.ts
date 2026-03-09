"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { createHash } from "crypto";

export async function submitEntityProof(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  // Generate a signature hash from the form data
  const rawSignature = `${partnerId}:${formData.get("proof_type")}:${formData.get("issuer")}:${Date.now()}`;
  const signatureHash = createHash("sha256").update(rawSignature).digest("hex");

  const { error } = await supabase.from("entity_proofs").insert({
    partner_id: partnerId,
    proof_type: formData.get("proof_type") as string,
    document_url: (formData.get("document_url") as string) || null,
    issuer: (formData.get("issuer") as string) || null,
    issued_at: (formData.get("issued_at") as string) || null,
    expires_at: (formData.get("expires_at") as string) || null,
    signature_hash: signatureHash,
    status: "未検証",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/partner/proofs/entity");
  redirect("/partner/proofs/entity");
}
