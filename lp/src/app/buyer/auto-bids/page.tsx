import { requireBuyerId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AutoBidsPage() {
  const { buyerId } = await requireBuyerId();
  const supabase = await createSupabaseServerClient();

  // バイヤーの全エージェントID取得
  const { data: agents } = await supabase
    .from("buying_agents")
    .select("id, name")
    .eq("owner_id", buyerId);

  const agentIds = (agents ?? []).map((a: { id: string }) => a.id);
  const agentNameMap: Record<string, string> = {};
  for (const a of agents ?? []) {
    agentNameMap[a.id] = a.name;
  }

  // 自動入札ログを取得
  let logs: {
    id: string;
    agent_id: string;
    auction_id: string;
    action: string;
    amount: number | null;
    max_price: number;
    message: string | null;
    created_at: string;
  }[] = [];

  if (agentIds.length > 0) {
    const { data } = await supabase
      .from("auto_bid_logs")
      .select("id, agent_id, auction_id, action, amount, max_price, message, created_at")
      .in("agent_id", agentIds)
      .order("created_at", { ascending: false })
      .limit(100);
    logs = data ?? [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">自動入札履歴</h1>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center text-gray-400">
          自動入札履歴はまだありません。
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  日時
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  エージェント
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  アクション
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  入札額
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  上限価格
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  メッセージ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {agentNameMap[log.agent_id] ?? "不明"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.action === "入札成功"
                          ? "bg-green-100 text-green-700"
                          : log.action === "上限到達"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {log.amount != null
                      ? `\u00a5${log.amount.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    &yen;{log.max_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
