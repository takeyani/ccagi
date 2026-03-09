"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";
import { calculateItemAmounts, calculateDocumentTotals } from "@/lib/tax";
import { logActivity, createNotification } from "@/lib/activity";

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

export async function createInvoice(formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: docNum } = await supabase.rpc("next_document_number", {
    p_partner_id: partnerId,
    p_doc_type: "invoice",
  });

  // パートナーの登録番号をスナップショット
  const { data: partner } = await supabase
    .from("partners")
    .select("invoice_registration_number")
    .eq("id", partnerId)
    .single();

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

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      partner_id: partnerId,
      document_number: docNum,
      quote_id: (formData.get("quote_id") as string) || null,
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      due_date: (formData.get("due_date") as string) || null,
      payment_terms: (formData.get("payment_terms") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      tax_10_total: totals.tax10Total,
      tax_8_total: totals.tax8Total,
      total: totals.total,
      invoice_registration_number: partner?.invoice_registration_number ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(items.map((it) => ({ ...it, invoice_id: invoice.id })));

  if (itemsError) throw new Error(itemsError.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "create",
    entityType: "invoice",
    entityId: invoice.id,
    description: `請求書 ${docNum} を作成しました`,
  });

  revalidatePath("/partner/invoices");
  redirect(`/partner/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: existing } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!existing || existing.status !== "下書き") {
    throw new Error("下書き状態の請求書のみ編集できます");
  }

  // 承認待ちレコードがあれば削除（再申請を促す）
  await supabase
    .from("approvals")
    .delete()
    .eq("entity_type", "invoice")
    .eq("entity_id", id)
    .eq("status", "承認待ち");

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
    .from("invoices")
    .update({
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      due_date: (formData.get("due_date") as string) || null,
      payment_terms: (formData.get("payment_terms") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      tax_10_total: totals.tax10Total,
      tax_8_total: totals.tax8Total,
      total: totals.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await supabase.from("invoice_items").delete().eq("invoice_id", id);
  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(items.map((it) => ({ ...it, invoice_id: id })));

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/partner/invoices");
  revalidatePath(`/partner/invoices/${id}`);
  redirect(`/partner/invoices/${id}`);
}

export async function sendInvoice(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  // 承認済みチェック
  const { data: approval } = await supabase
    .from("approvals")
    .select("id")
    .eq("entity_type", "invoice")
    .eq("entity_id", id)
    .eq("status", "承認済み")
    .limit(1)
    .maybeSingle();

  if (!approval) {
    throw new Error("承認済みの請求書のみ送付できます。先に承認申請を行ってください。");
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "送付済み", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "send",
    entityType: "invoice",
    entityId: id,
    description: `請求書を送付しました`,
  });

  // パートナーメンバーへ通知
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("partner_id", partnerId)
    .neq("id", profile.id);
  for (const m of members ?? []) {
    await createNotification({
      userId: m.id,
      partnerId,
      title: "請求書が送付されました",
      link: `/partner/invoices/${id}`,
      notificationType: "invoice_sent",
      entityType: "invoice",
      entityId: id,
    });
  }

  revalidatePath("/partner/invoices");
  revalidatePath(`/partner/invoices/${id}`);
}

export async function markInvoicePaid(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "入金済み", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "paid",
    entityType: "invoice",
    entityId: id,
    description: `請求書の入金を確認しました`,
  });

  // パートナーメンバーへ通知
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("partner_id", partnerId)
    .neq("id", profile.id);
  for (const m of members ?? []) {
    await createNotification({
      userId: m.id,
      partnerId,
      title: "請求書の入金が確認されました",
      link: `/partner/invoices/${id}`,
      notificationType: "invoice_paid",
      entityType: "invoice",
      entityId: id,
    });
  }

  revalidatePath("/partner/invoices");
  revalidatePath(`/partner/invoices/${id}`);
}

export async function cancelInvoice(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "取消", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "cancel",
    entityType: "invoice",
    entityId: id,
    description: `請求書を取消しました`,
  });

  revalidatePath("/partner/invoices");
  revalidatePath(`/partner/invoices/${id}`);
}

export async function createDeliverySlipFromInvoice(invoiceId: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", invoiceId)
    .eq("partner_id", partnerId)
    .single();

  if (!invoice) throw new Error("請求書が見つかりません");

  const { data: docNum } = await supabase.rpc("next_document_number", {
    p_partner_id: partnerId,
    p_doc_type: "delivery_slip",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any;
  const invItems = inv.invoice_items as any[];

  const { data: slip, error } = await supabase
    .from("delivery_slips")
    .insert({
      partner_id: partnerId,
      document_number: docNum,
      invoice_id: invoiceId,
      buyer_company_name: inv.buyer_company_name,
      buyer_contact_name: inv.buyer_contact_name,
      buyer_postal_code: inv.buyer_postal_code,
      buyer_address: inv.buyer_address,
      subject: inv.subject,
      subtotal: inv.subtotal,
      tax_total: inv.tax_total,
      total: inv.total,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase
    .from("delivery_slip_items")
    .insert(
      invItems.map((it: { sort_order: number; product_id: string | null; lot_id: string | null; item_name: string; description: string | null; quantity: number; unit: string; unit_price: number; tax_rate: number; amount: number; tax_amount: number }, i: number) => ({
        delivery_slip_id: slip.id,
        sort_order: i,
        product_id: it.product_id || null,
        lot_id: it.lot_id || null,
        item_name: it.item_name,
        description: it.description || null,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        tax_rate: it.tax_rate,
        amount: it.amount,
        tax_amount: it.tax_amount,
      }))
    );

  if (itemsError) throw new Error(itemsError.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "create",
    entityType: "delivery_slip",
    entityId: slip.id,
    description: `請求書から納品書 ${docNum} を作成しました`,
  });

  revalidatePath("/partner/delivery-slips");
  redirect(`/partner/delivery-slips/${slip.id}`);
}
