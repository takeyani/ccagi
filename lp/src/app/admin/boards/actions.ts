"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteThread(threadId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("board_threads")
    .delete()
    .eq("id", threadId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/boards");
  redirect("/admin/boards");
}

export async function deletePost(postId: string, threadId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("board_posts")
    .delete()
    .eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/boards/${threadId}`);
}
