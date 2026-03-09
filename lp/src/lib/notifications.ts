"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationsRead(ids: string[]) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
}
