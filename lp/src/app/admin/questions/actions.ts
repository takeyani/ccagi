"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteQuestion(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_questions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
