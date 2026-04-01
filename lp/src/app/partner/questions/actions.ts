"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export async function answerQuestion(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  // Verify question belongs to this partner
  const { data: q } = await supabase
    .from("product_questions")
    .select("id")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!q) throw new Error("権限がありません");

  const answer = formData.get("answer") as string;
  if (!answer) throw new Error("回答を入力してください");

  const { error } = await supabase
    .from("product_questions")
    .update({
      answer,
      status: "回答済み",
      answered_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/questions");
  redirect("/partner/questions");
}
