"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("cad_projects").insert({
    user_id: user.id,
    name,
    description: description || "",
  });

  if (error) throw new Error(error.message);

  redirect("/dashboard/projects");
}

export async function deleteProject(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("cad_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  redirect("/dashboard/projects");
}

export async function archiveProject(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("cad_projects")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  redirect("/dashboard/projects");
}
