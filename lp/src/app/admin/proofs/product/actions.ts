"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";

export async function verifyProductProof(id: string) {
  const { user, supabase } = await getSessionProfile();
  const { error } = await supabase
    .from("product_proofs")
    .update({
      status: "検証済み",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/proofs/product");
}

export async function revokeProductProof(id: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase
    .from("product_proofs")
    .update({ status: "失効" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/proofs/product");
}
