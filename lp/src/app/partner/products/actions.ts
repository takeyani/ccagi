"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export async function createPartnerProduct(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: formData.get("name") as string,
      partner_id: partnerId,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      base_price: Number(formData.get("base_price")),
      slug: formData.get("slug") as string,
      is_active: formData.get("is_active") === "on",
      min_order_quantity: formData.get("min_order_quantity")
        ? Number(formData.get("min_order_quantity"))
        : 1,
      min_order_amount: formData.get("min_order_amount")
        ? Number(formData.get("min_order_amount"))
        : null,
      order_notes: (formData.get("order_notes") as string) || null,
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

  revalidatePath("/partner/products");
  redirect("/partner/products");
}

export async function updatePartnerProduct(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      base_price: Number(formData.get("base_price")),
      slug: formData.get("slug") as string,
      is_active: formData.get("is_active") === "on",
      min_order_quantity: formData.get("min_order_quantity")
        ? Number(formData.get("min_order_quantity"))
        : 1,
      min_order_amount: formData.get("min_order_amount")
        ? Number(formData.get("min_order_amount"))
        : null,
      order_notes: (formData.get("order_notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

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

  revalidatePath("/partner/products");
  redirect("/partner/products");
}

export async function deletePartnerProduct(id: string) {
  const { partnerId, supabase } = await requirePartnerId();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("partner_id", partnerId);
  if (error) throw new Error(error.message);
  revalidatePath("/partner/products");
  redirect("/partner/products");
}
