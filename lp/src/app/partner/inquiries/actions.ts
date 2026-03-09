"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function updateInquiryStatus(
  inquiryId: string,
  newStatus: string,
  formData: FormData
) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  // partner_id 一致チェック
  const { data: inquiry } = await supabase
    .from("agent_inquiries")
    .select("id, partner_id")
    .eq("id", inquiryId)
    .single();

  if (!inquiry || inquiry.partner_id !== partnerId) {
    throw new Error("権限がありません");
  }

  const responseNotes = (formData.get("response_notes") as string) || null;
  const rejectionReason = (formData.get("rejection_reason") as string) || null;

  const { error } = await supabase
    .from("agent_inquiries")
    .update({
      partner_status: newStatus,
      response_notes: responseNotes,
      rejection_reason: newStatus === "辞退" ? rejectionReason : null,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .eq("partner_id", partnerId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: profile.id,
    partnerId,
    actionType: "update",
    entityType: "inquiry",
    entityId: inquiryId,
    description: `引合いステータスを「${newStatus}」に変更しました`,
  });

  revalidatePath("/partner/inquiries");
  revalidatePath(`/partner/inquiries/${inquiryId}`);
}
