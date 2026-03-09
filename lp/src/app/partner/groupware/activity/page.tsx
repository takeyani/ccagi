import { requirePartnerId } from "@/lib/auth";
import { ActivityLogList } from "@/components/shared/ActivityLogList";
import type { ActivityLog } from "@/lib/types";

export default async function PartnerActivityPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">活動ログ</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <ActivityLogList logs={(logs ?? []) as ActivityLog[]} />
      </div>
    </div>
  );
}
