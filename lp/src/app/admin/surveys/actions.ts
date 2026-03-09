"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createSurvey(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("surveys")
    .insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      target_type: (formData.get("target_type") as string) || "general",
      target_id: (formData.get("target_id") as string) || null,
      is_active: formData.get("is_active") === "on",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // 質問を保存
  let questions: {
    question_text: string;
    question_type: string;
    options: string[];
    is_required: boolean;
    sort_order: number;
  }[] = [];
  try {
    questions = JSON.parse(
      (formData.get("questions_json") as string) || "[]"
    );
  } catch {
    /* ignore */
  }

  if (questions.length > 0) {
    const { error: qError } = await supabase
      .from("survey_questions")
      .insert(
        questions.map((q, i) => ({
          survey_id: data.id,
          sort_order: q.sort_order ?? i,
          question_text: q.question_text,
          question_type: q.question_type || "text",
          options: q.options || [],
          is_required: q.is_required ?? false,
        }))
      );
    if (qError) throw new Error(qError.message);
  }

  revalidatePath("/admin/surveys");
  redirect("/admin/surveys");
}

export async function updateSurvey(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("surveys")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      target_type: (formData.get("target_type") as string) || "general",
      target_id: (formData.get("target_id") as string) || null,
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // 既存質問を削除して再挿入
  await supabase.from("survey_questions").delete().eq("survey_id", id);

  let questions: {
    question_text: string;
    question_type: string;
    options: string[];
    is_required: boolean;
    sort_order: number;
  }[] = [];
  try {
    questions = JSON.parse(
      (formData.get("questions_json") as string) || "[]"
    );
  } catch {
    /* ignore */
  }

  if (questions.length > 0) {
    const { error: qError } = await supabase
      .from("survey_questions")
      .insert(
        questions.map((q, i) => ({
          survey_id: id,
          sort_order: q.sort_order ?? i,
          question_text: q.question_text,
          question_type: q.question_type || "text",
          options: q.options || [],
          is_required: q.is_required ?? false,
        }))
      );
    if (qError) throw new Error(qError.message);
  }

  revalidatePath("/admin/surveys");
  redirect("/admin/surveys");
}

export async function deleteSurvey(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("surveys").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/surveys");
  redirect("/admin/surveys");
}
