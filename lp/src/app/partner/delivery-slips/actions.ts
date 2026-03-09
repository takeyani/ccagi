"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { calculateItemAmounts, calculateDocumentTotals } from "@/lib/tax";
import { logActivity } from "@/lib/activity";

type RawItem = {
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  product_id?: string;
  lot_id?: string;
};

function parseItems(formData: FormData) {
  const raw: RawItem[] = JSON.parse(formData.get("items_json") as string);
  return raw.map((r, i) => {
    const { amount, taxAmount } = calculateItemAmounts(r.quantity, r.unit_price, r.tax_rate);
    return {
      sort_order: i,
      product_id: r.product_id || null,
      lot_id: r.lot_id || null,
      item_name: r.item_name,
      description: r.description || null,
      quantity: r.quantity,
      unit: r.unit,
      unit_price: r.unit_price,
      tax_rate: r.tax_rate,
      amount,
      tax_amount: taxAmount,
    };
  });
}

export async function createDeliverySlip(formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: docNum } = await supabase.rpc("next_document_number", {
    p_partner_id: partnerId,
    p_doc_type: "delivery_slip",
  });

  const items = parseItems(formData);
  const totals = calculateDocumentTotals(
    items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unit_price,
      taxRate: i.tax_rate,
      amount: i.amount,
      taxAmount: i.tax_amount,
    }))
  );

  const { data: slip, error } = await supabase
    .from("delivery_slips")
    .insert({
      partner_id: partnerId,
      document_number: docNum,
      invoice_id: (formData.get("invoice_id") as string) || null,
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      delivery_date: (formData.get("delivery_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      total: totals.total,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase
    .from("delivery_slip_items")
    .insert(items.map((it) => ({ ...it, delivery_slip_id: slip.id })));

  if (itemsError) throw new Error(itemsError.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "create",
    entityType: "delivery_slip",
    entityId: slip.id,
    description: `納品書 ${docNum} を作成しました`,
  });

  revalidatePath("/partner/delivery-slips");
  redirect(`/partner/delivery-slips/${slip.id}`);
}

export async function updateDeliverySlip(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: existing } = await supabase
    .from("delivery_slips")
    .select("status")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!existing || existing.status !== "下書き") {
    throw new Error("下書き状態の納品書のみ編集できます");
  }

  const items = parseItems(formData);
  const totals = calculateDocumentTotals(
    items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unit_price,
      taxRate: i.tax_rate,
      amount: i.amount,
      taxAmount: i.tax_amount,
    }))
  );

  const { error } = await supabase
    .from("delivery_slips")
    .update({
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      delivery_date: (formData.get("delivery_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      total: totals.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await supabase.from("delivery_slip_items").delete().eq("delivery_slip_id", id);
  const { error: itemsError } = await supabase
    .from("delivery_slip_items")
    .insert(items.map((it) => ({ ...it, delivery_slip_id: id })));

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/partner/delivery-slips");
  revalidatePath(`/partner/delivery-slips/${id}`);
  redirect(`/partner/delivery-slips/${id}`);
}

export async function issueDeliverySlip(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { error } = await supabase
    .from("delivery_slips")
    .update({ status: "発行済み", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "issue",
    entityType: "delivery_slip",
    entityId: id,
    description: `納品書を発行しました`,
  });

  revalidatePath("/partner/delivery-slips");
  revalidatePath(`/partner/delivery-slips/${id}`);
}
