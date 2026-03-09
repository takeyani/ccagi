import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { DocumentStatusSummary } from "@/components/shared/DocumentStatusSummary";
import { ActivityLogList } from "@/components/shared/ActivityLogList";
import { PartnerRankingTable } from "@/components/admin/PartnerRankingTable";
import type { ActivityLog } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: partnerCount },
    { count: productCount },
    { data: activeAuctions },
    { data: paidInvoices },
    { data: sentInvoices },
    { data: allQuotes },
    { data: allInvoices },
    { data: allSlips },
    { data: activityLogs },
    { data: recentOrders },
    { data: recentBids },
  ] = await Promise.all([
    supabase.from("partners").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("auctions").select("id").eq("status", "出品中"),
    supabase
      .from("invoices")
      .select("total, partner_id, partners(company_name)")
      .eq("status", "入金済み"),
    supabase
      .from("invoices")
      .select("total, partner_id, partners(company_name)")
      .eq("status", "送付済み"),
    supabase.from("quotes").select("status"),
    supabase.from("invoices").select("status"),
    supabase.from("delivery_slips").select("status"),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("lot_purchases")
      .select("*, lots(lot_number, price, products(name, base_price))")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bids")
      .select("*, auctions(lots(products(name)))")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalSales = paidInvoices?.reduce((s, i) => s + (i.total ?? 0), 0) ?? 0;

  // パートナー別売上ランキング
  const salesByPartner = new Map<string, { company_name: string; total_sales: number }>();
  for (const inv of paidInvoices ?? []) {
    const pid = inv.partner_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partners = inv.partners as any;
    const name = (Array.isArray(partners) ? partners[0]?.company_name : partners?.company_name) ?? "不明";
    const existing = salesByPartner.get(pid) ?? { company_name: name, total_sales: 0 };
    existing.total_sales += inv.total ?? 0;
    salesByPartner.set(pid, existing);
  }
  const rankings = Array.from(salesByPartner.entries())
    .map(([partner_id, data]) => ({ partner_id, ...data }))
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10);

  // 請求書回収状況
  const uncollectedCount = sentInvoices?.length ?? 0;
  const uncollectedAmount = sentInvoices?.reduce((s, i) => s + (i.total ?? 0), 0) ?? 0;

  // ステータス集計
  const countStatus = (data: { status: string }[] | null, status: string) =>
    data?.filter((d) => d.status === status).length ?? 0;

  const quoteStatuses = [
    { label: "下書き", count: countStatus(allQuotes, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(allQuotes, "送付済み"), color: "bg-blue-500" },
    { label: "承諾", count: countStatus(allQuotes, "承諾"), color: "bg-green-500" },
    { label: "辞退", count: countStatus(allQuotes, "辞退"), color: "bg-red-400" },
    { label: "期限切れ", count: countStatus(allQuotes, "期限切れ"), color: "bg-yellow-500" },
  ];

  const invoiceStatuses = [
    { label: "下書き", count: countStatus(allInvoices, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(allInvoices, "送付済み"), color: "bg-blue-500" },
    { label: "入金済み", count: countStatus(allInvoices, "入金済み"), color: "bg-green-500" },
    { label: "期限超過", count: countStatus(allInvoices, "期限超過"), color: "bg-red-400" },
    { label: "取消", count: countStatus(allInvoices, "取消"), color: "bg-yellow-500" },
  ];

  const slipStatuses = [
    { label: "下書き", count: countStatus(allSlips, "下書き"), color: "bg-gray-400" },
    { label: "発行済み", count: countStatus(allSlips, "発行済み"), color: "bg-green-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* Row 1: KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard label="全体売上" value={`¥${totalSales.toLocaleString()}`} />
        <StatsCard label="アクティブオークション" value={activeAuctions?.length ?? 0} />
        <StatsCard label="取引先数" value={partnerCount ?? 0} />
        <StatsCard label="商品数" value={productCount ?? 0} />
      </div>

      {/* Row 2: ランキング + 回収状況 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">パートナー別売上ランキング</h2>
          <PartnerRankingTable rankings={rankings} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">請求書回収状況</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">未回収件数</p>
              <p className="text-2xl font-bold">{uncollectedCount} 件</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">未回収金額</p>
              <p className="text-2xl font-bold">&yen;{uncollectedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">回収済み合計</p>
              <p className="text-2xl font-bold text-green-600">&yen;{totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: 帳票サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <DocumentStatusSummary title="見積書" statuses={quoteStatuses} />
        <DocumentStatusSummary title="請求書" statuses={invoiceStatuses} />
        <DocumentStatusSummary title="納品書" statuses={slipStatuses} />
      </div>

      {/* Row 4: 活動ログ */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <h2 className="font-semibold mb-4">直近の活動</h2>
        <ActivityLogList logs={(activityLogs ?? []) as ActivityLog[]} />
      </div>

      {/* Row 5: 最近の注文・入札 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">最近の注文</h2>
          <div className="space-y-3">
            {recentOrders?.map((order) => {
              const lot = order.lots as {
                lot_number: string;
                price: number | null;
                products: { name: string; base_price: number } | null;
              } | null;
              return (
                <div
                  key={order.id}
                  className="flex justify-between items-center text-sm border-b pb-2"
                >
                  <div>
                    <span className="font-medium">
                      {lot?.products?.name ?? "-"}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {lot?.lot_number}
                    </span>
                  </div>
                  <span className="font-bold">
                    &yen;{(lot?.price ?? lot?.products?.base_price ?? 0).toLocaleString()}
                  </span>
                </div>
              );
            })}
            {!recentOrders?.length && (
              <p className="text-gray-400 text-sm">注文なし</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">最近の入札</h2>
          <div className="space-y-3">
            {recentBids?.map((bid) => {
              const auction = bid.auctions as {
                lots: { products: { name: string } | null } | null;
              } | null;
              return (
                <div
                  key={bid.id}
                  className="flex justify-between items-center text-sm border-b pb-2"
                >
                  <div>
                    <span className="font-medium">{bid.bidder_name}</span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {auction?.lots?.products?.name ?? ""}
                    </span>
                  </div>
                  <span className="font-bold">
                    &yen;{bid.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {!recentBids?.length && (
              <p className="text-gray-400 text-sm">入札なし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
