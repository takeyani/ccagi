"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function cancelAuction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("auctions")
    .update({ status: "キャンセル" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/auctions");
}
