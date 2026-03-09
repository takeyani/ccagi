"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: formData.get("name") as string,
      partner_id: (formData.get("partner_id") as string) || null,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      base_price: Number(formData.get("base_price")),
      slug: formData.get("slug") as string,
      is_active: formData.get("is_active") === "on",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const tagIds = formData.getAll("tag_ids") as string[];
  if (tagIds.length > 0) {
    const { error: tagError } = await supabase.from("product_tags").insert(
      tagIds.map((tagId) => ({ product_id: data.id, tag_id: tagId }))
    );
    if (tagError) throw new Error(tagError.message);
  }

  // 商品属性
  let attrs: { label: string; value: string }[] = [];
  try {
    attrs = JSON.parse((formData.get("product_attributes") as string) || "[]");
  } catch { /* ignore */ }
  if (attrs.length > 0) {
    const { error: attrError } = await supabase.from("product_attributes").insert(
      attrs.map((a) => ({ product_id: data.id, attribute_name: a.label, attribute_value: a.value }))
    );
    if (attrError) throw new Error(attrError.message);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      partner_id: (formData.get("partner_id") as string) || null,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      base_price: Number(formData.get("base_price")),
      slug: formData.get("slug") as string,
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // タグ同期: 既存削除 → 再INSERT
  await supabase.from("product_tags").delete().eq("product_id", id);
  const tagIds = formData.getAll("tag_ids") as string[];
  if (tagIds.length > 0) {
    const { error: tagError } = await supabase.from("product_tags").insert(
      tagIds.map((tagId) => ({ product_id: id, tag_id: tagId }))
    );
    if (tagError) throw new Error(tagError.message);
  }

  // 商品属性同期: 既存削除 → 再INSERT
  await supabase.from("product_attributes").delete().eq("product_id", id);
  let attrs: { label: string; value: string }[] = [];
  try {
    attrs = JSON.parse((formData.get("product_attributes") as string) || "[]");
  } catch { /* ignore */ }
  if (attrs.length > 0) {
    const { error: attrError } = await supabase.from("product_attributes").insert(
      attrs.map((a) => ({ product_id: id, attribute_name: a.label, attribute_value: a.value }))
    );
    if (attrError) throw new Error(attrError.message);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
