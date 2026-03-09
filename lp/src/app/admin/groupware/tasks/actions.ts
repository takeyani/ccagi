"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createNotification } from "@/lib/activity";

export async function createTask(formData: FormData) {
  const { user, supabase } = await getSessionProfile();

  const assignedTo = (formData.get("assigned_to") as string) || null;
  const title = formData.get("title") as string;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) || "未着手",
      priority: (formData.get("priority") as string) || "中",
      assigned_to: assignedTo,
      assigned_partner_id:
        (formData.get("assigned_partner_id") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // 割り当て先へ通知
  if (assignedTo && assignedTo !== user.id) {
    await createNotification({
      userId: assignedTo,
      title: `タスク「${title}」が割り当てられました`,
      link: `/partner/groupware/tasks`,
      notificationType: "task_assigned",
      entityType: "task",
      entityId: task.id,
    });
  }

  revalidatePath("/admin/groupware/tasks");
  redirect("/admin/groupware/tasks");
}

export async function updateTask(id: string, formData: FormData) {
  const { user, supabase } = await getSessionProfile();

  const assignedTo = (formData.get("assigned_to") as string) || null;
  const title = formData.get("title") as string;

  // 既存の割り当て先を確認
  const { data: existing } = await supabase
    .from("tasks")
    .select("assigned_to")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) || "未着手",
      priority: (formData.get("priority") as string) || "中",
      assigned_to: assignedTo,
      assigned_partner_id:
        (formData.get("assigned_partner_id") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // 割り当て先が変更された場合に通知
  if (assignedTo && assignedTo !== user.id && assignedTo !== existing?.assigned_to) {
    await createNotification({
      userId: assignedTo,
      title: `タスク「${title}」が割り当てられました`,
      link: `/partner/groupware/tasks`,
      notificationType: "task_assigned",
      entityType: "task",
      entityId: id,
    });
  }

  revalidatePath("/admin/groupware/tasks");
  redirect("/admin/groupware/tasks");
}

export async function deleteTask(id: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groupware/tasks");
  redirect("/admin/groupware/tasks");
}
