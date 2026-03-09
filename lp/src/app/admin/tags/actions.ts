"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createTag(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tags").insert({
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    tag_type: formData.get("tag_type") as string,
    description: (formData.get("description") as string) || null,
    image_url: (formData.get("image_url") as string) || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function updateTag(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("tags")
    .update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      tag_type: formData.get("tag_type") as string,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      sort_order: Number(formData.get("sort_order") || 0),
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function deleteTag(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}
