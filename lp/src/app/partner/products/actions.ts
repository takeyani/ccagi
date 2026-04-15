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

  // 本番DBに存在するカラムのみ（拡張フィールドはcustom_fieldsに格納）
  return {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    base_price: Number(formData.get("base_price")),
    min_order_quantity: num("min_order_quantity") ?? 1,
    min_order_amount: num("min_order_amount"),
    description: str("description"),
    order_notes: str("order_notes"),
    image_url: str("image_url"),
    is_active: formData.get("is_active") === "on",
    category_template_id: str("category_template_id"),
    custom_fields: extractCustomFields(formData),
  };
}

function extractCustomFields(formData: FormData): Record<string, string | number | boolean | null> | null {
  const fields: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cf_")) {
      fields[key.slice(3)] = (value as string) || null;
    }
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

export async function createPartnerProduct(formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  // 仮登録チェック: 本登録パートナーのみ商品登録可能
  const { data: partnerData } = await supabase.from("partners").select("certification_status").eq("id", partnerId).maybeSingle();
  if (partnerData?.certification_status === "仮登録") {
    throw new Error("商品登録には本登録が必要です。管理者にお問い合わせください。");
  }

  const fields = extractProductFields(formData);

  // 不正チェック: 異常価格の検出
  if (fields.base_price <= 0) {
    throw new Error("価格は1円以上で設定してください。");
  }
  if (fields.base_price > 500_000) {
    throw new Error("価格が上限（¥500,000）を超えています。");
  }
  if (!fields.name || fields.name.trim().length < 2) {
    throw new Error("商品名は2文字以上で入力してください。");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...fields,
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
  const { error: tagDeleteError } = await supabase.from("product_tags").delete().eq("product_id", id);
  if (tagDeleteError) throw new Error(tagDeleteError.message);
  const tagIds = formData.getAll("tag_ids") as string[];
  if (tagIds.length > 0) {
    const { error: tagError } = await supabase.from("product_tags").insert(
      tagIds.map((tagId) => ({ product_id: id, tag_id: tagId }))
    );
    if (tagError) throw new Error(tagError.message);
  }

  // 商品属性同期: 既存削除 → 再INSERT
  const { error: attrDeleteError } = await supabase.from("product_attributes").delete().eq("product_id", id);
  if (attrDeleteError) throw new Error(attrDeleteError.message);
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
