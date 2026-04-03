import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "login"
  | "status_change";

export async function logAudit({
  userId,
  partnerId,
  action,
  entityType,
  entityId,
  details,
}: {
  userId?: string;
  partnerId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("activity_logs").insert({
    user_id: userId || null,
    partner_id: partnerId || null,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || `${action} ${entityType}`,
  });
}
