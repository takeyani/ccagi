import { requirePartnerId } from "@/lib/auth";

export default async function PartnerLPAnalyticsPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  // 自社商品IDを取得
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("partner_id", partnerId);

  const productIds = (products ?? []).map((p) => p.id);
  const productNames = Object.fromEntries((products ?? []).map((p) => [p.id, p.name]));

  if (productIds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">LPアクセス分析</h1>
        <p className="text-gray-400">商品が登録されていません</p>
      </div>
    );
  }

  // 自社商品のLPイベントを取得
  const { data: events } = await supabase
    .from("marketing_events")
    .select("event_type, content_id, metadata, created_at")
    .eq("content_type", "lot_lp")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(10000);

  // 自社商品でフィルタ
  const myEvents = (events ?? []).filter((e) => {
    const meta = e.metadata as Record<string, string> | null;
    const pid = meta?.product_id || e.content_id;
    return pid && productIds.includes(pid);
  });

  const totalPV = myEvents.filter((e) => e.event_type === "page_view").length;
  const totalCV = myEvents.filter((e) => e.event_type === "conversion").length;

  // 流入元集計
  const referrerMap: Record<string, number> = {};
  const productPV: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};

  myEvents.forEach((e) => {
    if (e.event_type !== "page_view") return;
    const meta = e.metadata as Record<string, string> | null;

    const ref = meta?.referrer || meta?.referer || "(direct)";
    let domain = "direct";
    try {
      if (ref !== "(direct)" && ref !== "direct" && ref.startsWith("http")) {
        domain = new URL(ref).hostname;
      }
    } catch { /* */ }
    referrerMap[domain] = (referrerMap[domain] || 0) + 1;

    const pid = meta?.product_id || e.content_id || "unknown";
    productPV[pid] = (productPV[pid] || 0) + 1;

    const date = e.created_at.slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + 1;
  });

  const topReferrers = Object.entries(referrerMap).sort(([, a], [, b]) => b - a).slice(0, 10);
  const topProducts = Object.entries(productPV).sort(([, a], [, b]) => b - a);
  const dailyData = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">LPアクセス分析</h1>
      <p className="text-sm text-gray-500">過去30日間の自社商品LPアクセス状況</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">総PV</p>
          <p className="text-2xl font-bold text-gray-900">{totalPV.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">CV数</p>
          <p className="text-2xl font-bold text-orange-600">{totalCV}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">CVR</p>
          <p className="text-2xl font-bold text-orange-600">
            {totalPV > 0 ? ((totalCV / totalPV) * 100).toFixed(1) : "0.0"}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 流入元 */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">流入元 TOP10</h2>
          <div className="space-y-2">
            {topReferrers.map(([domain, count], i) => (
              <div key={domain} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{i + 1}. {domain}</span>
                <span className="text-gray-700 font-medium">{count}</span>
              </div>
            ))}
            {topReferrers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">データなし</p>
            )}
          </div>
        </div>

        {/* 商品別PV */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">商品別PV</h2>
          <div className="space-y-2">
            {topProducts.map(([id, count]) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900 truncate max-w-48">{productNames[id] || id.slice(0, 8)}</span>
                <span className="text-gray-700 font-medium">{count} PV</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">データなし</p>
            )}
          </div>
        </div>
      </div>

      {/* 日別PV */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">日別PV推移</h2>
        {dailyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-600">日付</th>
                  <th className="text-right px-3 py-2 text-gray-600">PV</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyData.slice(-14).map(([date, count]) => {
                  const max = Math.max(...dailyData.map(([, c]) => c));
                  return (
                    <tr key={date}>
                      <td className="px-3 py-2 text-gray-700">{date}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{count}</td>
                      <td className="px-3 py-2 w-48">
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-orange-50/400 rounded-full h-2"
                            style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">データなし</p>
        )}
      </div>
    </div>
  );
}
