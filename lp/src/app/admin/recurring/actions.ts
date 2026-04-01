"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateRecurringStatus(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("recurring_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/recurring");
  redirect(`/admin/recurring/${id}`);
}
