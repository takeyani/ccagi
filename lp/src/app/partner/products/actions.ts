"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

function extractProductFields(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string) || null;
  const num = (key: string) => {
    const v = formData.get(key) as string;
    return v ? Number(v) : null;
  };

  return {
    name: formData.get("name") as string,
    master_name: str("master_name"),
    slug: formData.get("slug") as string,
    product_code: str("product_code"),
    jan_code: str("jan_code"),
    country_of_origin: str("country_of_origin"),
    category1: str("category1"),
    category2: str("category2"),
    category3: str("category3"),
    base_price: Number(formData.get("base_price")),
    carton_quantity: num("carton_quantity"),
    min_order_quantity: num("min_order_quantity") ?? 1,
    min_order_amount: num("min_order_amount"),
    width_mm: num("width_mm"),
    depth_mm: num("depth_mm"),
    height_mm: num("height_mm"),
    net_weight_kg: num("net_weight_kg"),
    gross_weight_kg: num("gross_weight_kg"),
    description: str("description"),
    material: str("material"),
    notes: str("notes"),
    order_notes: str("order_notes"),
    image_url: str("image_url"),
    image_url2: str("image_url2"),
    image_url3: str("image_url3"),
    image_url4: str("image_url4"),
    image_url5: str("image_url5"),
    product_page_url: str("product_page_url"),
    is_active: formData.get("is_active") === "on",
    is_new_or_renewal: formData.get("is_new_or_renewal") === "on",
  };
}

export async function createPartnerProduct(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...extractProductFields(formData),
      partner_id: partnerId,
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
      ...extractProductFields(formData),
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
