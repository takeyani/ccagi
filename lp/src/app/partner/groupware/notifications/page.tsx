import { requirePartnerId } from "@/lib/auth";
import type { Notification } from "@/lib/types";

export default async function PartnerNotificationsPage() {
  const { supabase, profile } = await requirePartnerId();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const items = (notifications ?? []) as Notification[];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">通知一覧</h1>
      <div className="bg-white rounded-xl border shadow-sm divide-y">
        {items.length === 0 && (
          <div className="p-6 text-gray-400 text-sm text-center">通知はありません</div>
        )}
        {items.map((n) => (
          <a
            key={n.id}
            href={n.link ?? "#"}
            className={`block px-6 py-4 hover:bg-gray-50 ${!n.is_read ? "bg-blue-50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm ${!n.is_read ? "font-semibold" : "text-gray-700"}`}>
                {n.title}
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {new Date(n.created_at).toLocaleString("ja-JP")}
              </span>
            </div>
            {n.body && <p className="text-sm text-gray-500 mt-1">{n.body}</p>}
          </a>
        ))}
      </div>
    </div>
  );
}
