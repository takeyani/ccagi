"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requirePartnerId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAuthorizations() {
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  // メーカーとして: 自社商品への承認リクエスト
  const { data: incoming } = await supabase
    .from("product_authorizations")
    .select("*, products(name, slug), partners!product_authorizations_partner_id_fkey(company_name)")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  // 代理店として: 自分が申請した承認
  const { data: outgoing } = await supabase
    .from("product_authorizations")
    .select("*, products(name, slug), partners!product_authorizations_partner_id_fkey(company_name)")
    .eq("authorized_party_type", "代理店")
    .eq("authorized_party_id", partnerId)
    .order("created_at", { ascending: false });

  return { incoming: incoming ?? [], outgoing: outgoing ?? [] };
}

export async function approveAuthorization(id: string, message?: string) {
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  const { error } = await supabase
    .from("product_authorizations")
    .update({
      status: "承認済み",
      response_message: message || null,
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/authorizations");
}

export async function rejectAuthorization(id: string, message?: string) {
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  const { error } = await supabase
    .from("product_authorizations")
    .update({
      status: "却下",
      response_message: message || null,
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);
  revalidatePath("/partner/authorizations");
}

export async function requestAuthorization(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  const productId = formData.get("product_id") as string;
  const message = formData.get("message") as string;

  // 商品のメーカーを取得
  const { data: product } = await supabase
    .from("products")
    .select("partner_id")
    .eq("id", productId)
    .single();

  if (!product) throw new Error("商品が見つかりません");

  const { error } = await supabase
    .from("product_authorizations")
    .insert({
      product_id: productId,
      partner_id: product.partner_id,
      authorized_party_type: "代理店",
      authorized_party_id: partnerId,
      status: "申請中",
      requested_by: "代理店",
      request_message: message || null,
      authorized_actions: ["販売", "LP作成"],
    });

  if (error) {
    if (error.code === "23505") throw new Error("この商品への申請は既に存在します");
    throw new Error(error.message);
  }
  revalidatePath("/partner/authorizations");
}

export async function grantAuthorization(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const partnerId = await requirePartnerId();

  const productId = formData.get("product_id") as string;
  const partyType = formData.get("party_type") as string;
  const partyId = formData.get("party_id") as string;
  const actions = formData.getAll("actions") as string[];

  const { error } = await supabase
    .from("product_authorizations")
    .insert({
      product_id: productId,
      partner_id: partnerId,
      authorized_party_type: partyType,
      authorized_party_id: partyId,
      status: "承認済み",
      requested_by: "メーカー",
      authorized_actions: actions.length > 0 ? actions : ["販売", "LP作成"],
    });

  if (error) {
    if (error.code === "23505") throw new Error("この承認は既に存在します");
    throw new Error(error.message);
  }
  revalidatePath("/partner/authorizations");
}
