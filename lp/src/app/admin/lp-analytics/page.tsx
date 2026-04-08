import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLPAnalyticsPage() {
  const supabase = await createSupabaseServerClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  // ロットLPのイベントを取得
  const { data: events } = await supabase
    .from("marketing_events")
    .select("event_type, content_id, metadata, created_at")
    .eq("content_type", "lot_lp")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(10000);

  const allEvents = events ?? [];

  // KPI集計
  const totalPV = allEvents.filter((e) => e.event_type === "page_view").length;
  const totalCV = allEvents.filter((e) => e.event_type === "conversion").length;
  const cvr = totalPV > 0 ? ((totalCV / totalPV) * 100).toFixed(1) : "0.0";

  // 流入元集計
  const referrerMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};
  const channelMap: Record<string, number> = { 直接: 0, 検索: 0, SNS: 0, アフィリエイト: 0, その他: 0 };

  const searchDomains = ["google", "yahoo", "bing", "duckduckgo", "baidu"];
  const snsDomains = ["twitter", "x.com", "instagram", "facebook", "tiktok", "youtube", "line", "threads"];

  allEvents.forEach((e) => {
    if (e.event_type !== "page_view") return;
    const meta = e.metadata as Record<string, string> | null;

    // 流入元
    const ref = meta?.referrer || meta?.referer || "(direct)";
    let domain = "direct";
    try {
      if (ref !== "(direct)" && ref !== "direct" && ref.startsWith("http")) {
        domain = new URL(ref).hostname;
      }
    } catch { /* */ }
    referrerMap[domain] = (referrerMap[domain] || 0) + 1;

    // チャネル分類
    if (domain === "direct") {
      channelMap["直接"]++;
    } else if (searchDomains.some((s) => domain.includes(s))) {
      channelMap["検索"]++;
    } else if (snsDomains.some((s) => domain.includes(s))) {
      channelMap["SNS"]++;
    } else if (ref.includes("ref=")) {
      channelMap["アフィリエイト"]++;
    } else {
      channelMap["その他"]++;
    }

    // 商品別
    const productId = meta?.product_id || e.content_id || "unknown";
    productMap[productId] = (productMap[productId] || 0) + 1;

    // 日別
    const date = e.created_at.slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + 1;
  });

  const topReferrers = Object.entries(referrerMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topProducts = Object.entries(productMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const dailyData = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));

  // 商品名を取得
  const productIds = topProducts.map(([id]) => id).filter((id) => id !== "unknown");
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  const productNames = Object.fromEntries((products ?? []).map((p) => [p.id, p.name]));

  const uniqueReferrers = Object.keys(referrerMap).filter((d) => d !== "direct").length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">LPアクセス分析</h1>
      <p className="text-sm text-gray-500">過去30日間のロットLPのアクセス状況</p>

      {/* KPIカード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">総PV</p>
          <p className="text-2xl font-bold text-gray-900">{totalPV.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">流入元数</p>
          <p className="text-2xl font-bold text-gray-900">{uniqueReferrers}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">CV数</p>
          <p className="text-2xl font-bold text-orange-600">{totalCV}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">CVR</p>
          <p className="text-2xl font-bold text-orange-600">{cvr}%</p>
        </div>
      </div>

      {/* 流入経路分類 */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">流入経路</h2>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(channelMap).map(([ch, count]) => (
            <div key={ch} className="text-center rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{ch}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400">
                {totalPV > 0 ? ((count / totalPV) * 100).toFixed(1) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 流入元ランキング */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">流入元 TOP10</h2>
          <div className="space-y-2">
            {topReferrers.map(([domain, count], i) => (
              <div key={domain} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-gray-400 font-mono">{i + 1}</span>
                  <span className="text-gray-900">{domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-500 rounded-full h-2"
                      style={{ width: `${(count / (topReferrers[0]?.[1] || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-700 w-10 text-right">{count}</span>
                </div>
              </div>
            ))}
            {topReferrers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">データなし</p>
            )}
          </div>
        </div>

        {/* 商品別PV */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">商品別PV TOP10</h2>
          <div className="space-y-2">
            {topProducts.map(([id, count], i) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-gray-400 font-mono">{i + 1}</span>
                  <span className="text-gray-900 truncate max-w-48">
                    {productNames[id] || id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{count} PV</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">データなし</p>
            )}
          </div>
        </div>
      </div>

      {/* 日別PV推移 */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">日別PV推移</h2>
        {dailyData.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-40 min-w-max">
              {dailyData.map(([date, count]) => {
                const maxCount = Math.max(...dailyData.map(([, c]) => c));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={date} className="flex flex-col items-center gap-1 w-8">
                    <span className="text-[10px] text-gray-500">{count}</span>
                    <div
                      className="w-5 bg-orange-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                    />
                    <span className="text-[9px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">データなし</p>
        )}
      </div>
    </div>
  );
}
