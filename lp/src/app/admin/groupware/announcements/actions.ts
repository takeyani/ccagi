"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function createAnnouncement(formData: FormData) {
  const { user, supabase } = await getSessionProfile();
  const isPublished = formData.get("is_published") === "on";
  const title = formData.get("title") as string;

  const { data: ann, error } = await supabase
    .from("announcements")
    .insert({
      title,
      body: formData.get("body") as string,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    userId: user.id,
    actionType: "create",
    entityType: "announcement",
    entityId: ann.id,
    description: `お知らせ「${title}」を作成しました`,
  });

  revalidatePath("/admin/groupware/announcements");
  redirect("/admin/groupware/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const { user, supabase } = await getSessionProfile();
  const isPublished = formData.get("is_published") === "on";
  const title = formData.get("title") as string;

  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      body: formData.get("body") as string,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: user.id,
    actionType: "update",
    entityType: "announcement",
    entityId: id,
    description: `お知らせ「${title}」を更新しました`,
  });

  revalidatePath("/admin/groupware/announcements");
  redirect("/admin/groupware/announcements");
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groupware/announcements");
  redirect("/admin/groupware/announcements");
}
