"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function updatePartnerTaskStatus(
  taskId: string,
  formData: FormData
) {
  const { user, profile, supabase } = await getSessionProfile();
  const newStatus = formData.get("status") as string;

  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: user.id,
    partnerId: profile.partner_id,
    actionType: "update",
    entityType: "task",
    entityId: taskId,
    description: `タスクステータスを「${newStatus}」に変更しました`,
  });

  revalidatePath("/partner/groupware/tasks");
}
