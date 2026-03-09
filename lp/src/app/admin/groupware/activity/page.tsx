import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActivityLogList } from "@/components/shared/ActivityLogList";
import type { ActivityLog } from "@/lib/types";

export default async function AdminActivityPage() {
  const supabase = await createSupabaseServerClient();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">活動ログ</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <ActivityLogList logs={(logs ?? []) as ActivityLog[]} />
      </div>
    </div>
  );
}
