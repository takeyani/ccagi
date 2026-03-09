"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";
import { logActivity, createNotification } from "@/lib/activity";

export async function requestApproval(entityType: "quote" | "invoice", entityId: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  // 帳票の存在と所有権チェック
  const table = entityType === "quote" ? "quotes" : "invoices";
  const { data: doc } = await supabase
    .from(table)
    .select("document_number, status")
    .eq("id", entityId)
    .eq("partner_id", partnerId)
    .single();

  if (!doc) throw new Error("帳票が見つかりません");
  if (doc.status !== "下書き") throw new Error("下書き状態の帳票のみ承認申請できます");

  // 重複チェック
  const { data: existing } = await supabase
    .from("approvals")
    .select("id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("status", "承認待ち")
    .maybeSingle();

  if (existing) throw new Error("既に承認申請中です");

  const { error } = await supabase.from("approvals").insert({
    partner_id: partnerId,
    entity_type: entityType,
    entity_id: entityId,
    document_number: doc.document_number,
    requested_by: profile.id,
  });

  if (error) throw new Error(error.message);

  const entityLabel = entityType === "quote" ? "見積書" : "請求書";

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "create",
    entityType: "approval",
    entityId,
    description: `${entityLabel} ${doc.document_number} の承認を申請しました`,
  });

  // 同パートナーの他ユーザーへ通知
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("partner_id", partnerId)
    .neq("id", profile.id);

  for (const m of members ?? []) {
    await createNotification({
      userId: m.id,
      partnerId,
      title: `${entityLabel} ${doc.document_number} の承認申請`,
      body: "承認または差戻しをしてください",
      link: "/partner/approvals",
      notificationType: "approval_requested",
      entityType,
      entityId,
    });
  }

  revalidatePath("/partner/approvals");
  revalidatePath(`/partner/${table}/${entityId}`);
}

export async function approveDocument(approvalId: string) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const { data: approval } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .eq("partner_id", partnerId)
    .eq("status", "承認待ち")
    .single();

  if (!approval) throw new Error("承認待ちの申請が見つかりません");
  if (approval.requested_by === profile.id) {
    throw new Error("申請者本人は承認できません。別のユーザーで承認してください。");
  }

  const { error } = await supabase
    .from("approvals")
    .update({
      status: "承認済み",
      approver_id: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", approvalId);

  if (error) throw new Error(error.message);

  const entityLabel = approval.entity_type === "quote" ? "見積書" : "請求書";

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "approve",
    entityType: "approval",
    entityId: approval.entity_id,
    description: `${entityLabel} ${approval.document_number} を承認しました`,
  });

  // 申請者へ通知
  await createNotification({
    userId: approval.requested_by,
    partnerId,
    title: `${entityLabel} ${approval.document_number} が承認されました`,
    link: `/partner/${approval.entity_type === "quote" ? "quotes" : "invoices"}/${approval.entity_id}`,
    notificationType: "approval_approved",
    entityType: approval.entity_type,
    entityId: approval.entity_id,
  });

  revalidatePath("/partner/approvals");
  revalidatePath(`/partner/${approval.entity_type === "quote" ? "quotes" : "invoices"}/${approval.entity_id}`);
}

export async function rejectDocument(approvalId: string, formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const comment = (formData.get("comment") as string) || null;

  const { data: approval } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .eq("partner_id", partnerId)
    .eq("status", "承認待ち")
    .single();

  if (!approval) throw new Error("承認待ちの申請が見つかりません");
  if (approval.requested_by === profile.id) {
    throw new Error("申請者本人は差戻しできません");
  }

  const { error } = await supabase
    .from("approvals")
    .update({
      status: "差戻し",
      approver_id: profile.id,
      comment,
      approved_at: new Date().toISOString(),
    })
    .eq("id", approvalId);

  if (error) throw new Error(error.message);

  const entityLabel = approval.entity_type === "quote" ? "見積書" : "請求書";

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "reject",
    entityType: "approval",
    entityId: approval.entity_id,
    description: `${entityLabel} ${approval.document_number} を差戻しました${comment ? `: ${comment}` : ""}`,
  });

  // 申請者へ通知（コメント付き）
  await createNotification({
    userId: approval.requested_by,
    partnerId,
    title: `${entityLabel} ${approval.document_number} が差戻されました`,
    body: comment ?? undefined,
    link: `/partner/${approval.entity_type === "quote" ? "quotes" : "invoices"}/${approval.entity_id}`,
    notificationType: "approval_rejected",
    entityType: approval.entity_type,
    entityId: approval.entity_id,
  });

  revalidatePath("/partner/approvals");
  revalidatePath(`/partner/${approval.entity_type === "quote" ? "quotes" : "invoices"}/${approval.entity_id}`);
}
