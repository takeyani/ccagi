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

export async function createQuote(formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: docNum } = await supabase.rpc("next_document_number", {
    p_partner_id: partnerId,
    p_doc_type: "quote",
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

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      partner_id: partnerId,
      document_number: docNum,
      inquiry_id: (formData.get("inquiry_id") as string) || null,
      stock_request_id: (formData.get("stock_request_id") as string) || null,
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      valid_until: (formData.get("valid_until") as string) || null,
      payment_terms: (formData.get("payment_terms") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      total: totals.total,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items.map((it) => ({ ...it, quote_id: quote.id })));

  if (itemsError) throw new Error(itemsError.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "create",
    entityType: "quote",
    entityId: quote.id,
    description: `見積書 ${docNum} を作成しました`,
  });

  revalidatePath("/partner/quotes");
  redirect(`/partner/quotes/${quote.id}`);
}

export async function updateQuote(id: string, formData: FormData) {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: existing } = await supabase
    .from("quotes")
    .select("status")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!existing || existing.status !== "下書き") {
    throw new Error("下書き状態の見積書のみ編集できます");
  }

  // 承認待ちレコードがあれば削除（再申請を促す）
  await supabase
    .from("approvals")
    .delete()
    .eq("entity_type", "quote")
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
    .from("quotes")
    .update({
      buyer_company_name: formData.get("buyer_company_name") as string,
      buyer_contact_name: (formData.get("buyer_contact_name") as string) || null,
      buyer_postal_code: (formData.get("buyer_postal_code") as string) || null,
      buyer_address: (formData.get("buyer_address") as string) || null,
      subject: formData.get("subject") as string,
      issue_date: formData.get("issue_date") as string,
      valid_until: (formData.get("valid_until") as string) || null,
      payment_terms: (formData.get("payment_terms") as string) || null,
      notes: (formData.get("notes") as string) || null,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      total: totals.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  // 明細を削除→再挿入
  await supabase.from("quote_items").delete().eq("quote_id", id);
  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items.map((it) => ({ ...it, quote_id: id })));

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/partner/quotes");
  revalidatePath(`/partner/quotes/${id}`);
  redirect(`/partner/quotes/${id}`);
}

export async function deleteQuote(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: existing } = await supabase
    .from("quotes")
    .select("status")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!existing || existing.status !== "下書き") {
    throw new Error("下書き状態の見積書のみ削除できます");
  }

  const { error } = await supabase.from("quotes").delete().eq("id", id).eq("partner_id", partnerId);
  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "delete",
    entityType: "quote",
    entityId: id,
    description: `見積書を削除しました`,
  });

  revalidatePath("/partner/quotes");
  redirect("/partner/quotes");
}

export async function sendQuote(id: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  // 承認済みチェック
  const { data: approval } = await supabase
    .from("approvals")
    .select("id")
    .eq("entity_type", "quote")
    .eq("entity_id", id)
    .eq("status", "承認済み")
    .limit(1)
    .maybeSingle();

  if (!approval) {
    throw new Error("承認済みの見積書のみ送付できます。先に承認申請を行ってください。");
  }

  const { error } = await supabase
    .from("quotes")
    .update({ status: "送付済み", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "send",
    entityType: "quote",
    entityId: id,
    description: `見積書を送付しました`,
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
      title: "見積書が送付されました",
      link: `/partner/quotes/${id}`,
      notificationType: "quote_sent",
      entityType: "quote",
      entityId: id,
    });
  }

  revalidatePath("/partner/quotes");
  revalidatePath(`/partner/quotes/${id}`);
}

export async function createInvoiceFromQuote(quoteId: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", quoteId)
    .eq("partner_id", partnerId)
    .single();

  if (!quote) throw new Error("見積書が見つかりません");

  // パートナーの登録番号を取得
  const { data: partner } = await supabase
    .from("partners")
    .select("invoice_registration_number")
    .eq("id", partnerId)
    .single();

  const { data: docNum } = await supabase.rpc("next_document_number", {
    p_partner_id: partnerId,
    p_doc_type: "invoice",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qItems = (quote as any).quote_items as any[];
  const totals = calculateDocumentTotals(
    qItems.map((i: { quantity: number; unit_price: number; tax_rate: number; amount: number; tax_amount: number }) => ({
      quantity: i.quantity,
      unitPrice: i.unit_price,
      taxRate: Number(i.tax_rate),
      amount: i.amount,
      taxAmount: i.tax_amount,
    }))
  );

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      partner_id: partnerId,
      document_number: docNum,
      quote_id: quoteId,
      buyer_company_name: quote.buyer_company_name,
      buyer_contact_name: quote.buyer_contact_name,
      buyer_postal_code: quote.buyer_postal_code,
      buyer_address: quote.buyer_address,
      subject: quote.subject,
      payment_terms: quote.payment_terms,
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
    .insert(
      qItems.map((it: { sort_order: number; product_id: string | null; lot_id: string | null; item_name: string; description: string | null; quantity: number; unit: string; unit_price: number; tax_rate: number; amount: number; tax_amount: number }, i: number) => ({
        invoice_id: invoice.id,
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
    entityType: "invoice",
    entityId: invoice.id,
    description: `見積書 ${quote.document_number} から請求書 ${docNum} を作成しました`,
  });

  revalidatePath("/partner/invoices");
  redirect(`/partner/invoices/${invoice.id}`);
}
