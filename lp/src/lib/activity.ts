import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logActivity(params: {
  userId: string;
  partnerId?: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("activity_logs").insert({
      user_id: params.userId,
      partner_id: params.partnerId ?? null,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      description: params.description,
      metadata: params.metadata ?? {},
    });
  } catch {
    // fire-and-forget: ログ失敗しても業務処理は止めない
  }
}

export async function createNotification(params: {
  userId: string;
  partnerId?: string | null;
  title: string;
  body?: string | null;
  link?: string | null;
  notificationType: string;
  entityType?: string | null;
  entityId?: string | null;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("notifications").insert({
      user_id: params.userId,
      partner_id: params.partnerId ?? null,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      notification_type: params.notificationType,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
    });
  } catch {
    // fire-and-forget
  }
}
