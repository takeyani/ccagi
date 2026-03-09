"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerId } from "@/lib/auth";
import { createNotification } from "@/lib/activity";

export async function invitePartnerMember(formData: FormData) {
  const { partnerId, supabase, profile } = await requirePartnerId();

  const email = formData.get("email") as string;
  if (!email) throw new Error("メールアドレスは必須です");

  // 既に招待中か確認
  const { data: existing } = await supabase
    .from("partner_invitations")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("email", email)
    .eq("status", "招待中")
    .maybeSingle();

  if (existing) throw new Error("このメールアドレスは既に招待中です");

  const { data: invitation, error } = await supabase
    .from("partner_invitations")
    .insert({
      partner_id: partnerId,
      email,
      invited_by: profile.id,
    })
    .select("id, token")
    .single();

  if (error) throw new Error(error.message);

  // 同パートナーメンバーへ通知
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("partner_id", partnerId)
    .neq("id", profile.id);

  for (const m of members ?? []) {
    await createNotification({
      userId: m.id,
      partnerId,
      title: `${email} をメンバーに招待しました`,
      link: "/partner/members",
      notificationType: "member_invited",
      entityType: "partner_invitation",
      entityId: invitation.id,
    });
  }

  revalidatePath("/partner/members");
}

export async function cancelInvitation(invitationId: string) {
  const { partnerId, supabase } = await requirePartnerId();

  const { error } = await supabase
    .from("partner_invitations")
    .update({ status: "期限切れ" })
    .eq("id", invitationId)
    .eq("partner_id", partnerId)
    .eq("status", "招待中");

  if (error) throw new Error(error.message);

  revalidatePath("/partner/members");
}
