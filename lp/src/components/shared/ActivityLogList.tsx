import type { ActivityLog } from "@/lib/types";

const actionIcons: Record<string, string> = {
  create: "📝",
  send: "📤",
  delete: "🗑️",
  update: "✏️",
  approve: "✅",
  reject: "↩️",
  paid: "💰",
  cancel: "❌",
  issue: "📄",
  default: "📋",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

export function ActivityLogList({
  logs,
  emptyMessage = "活動ログがありません",
}: {
  logs: ActivityLog[];
  emptyMessage?: string;
}) {
  if (logs.length === 0) {
    return <p className="text-gray-400 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <span className="text-lg leading-none mt-0.5">
            {actionIcons[log.action_type] ?? actionIcons.default}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800">{log.description}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {relativeTime(log.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
