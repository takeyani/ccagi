import { requirePartnerId } from "@/lib/auth";
import { PartnerStatsCard } from "@/components/partner/StatsCard";
import { DocumentStatusSummary } from "@/components/shared/DocumentStatusSummary";
import { ActivityLogList } from "@/components/shared/ActivityLogList";
import { DeadlineList } from "@/components/shared/DeadlineList";
import type { ActivityLog } from "@/lib/types";

export default async function PartnerDashboardPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const [
    { data: paidInvoices },
    { data: sentInvoices },
    { data: inquiries },
    { data: pendingApprovals },
    { data: quotes },
    { data: invoices },
    { data: deliverySlips },
    { data: activityLogs },
    { data: upcomingQuotes },
    { data: upcomingInvoices },
    { data: upcomingTasks },
  ] = await Promise.all([
    // 今月入金済み請求書
    supabase
      .from("invoices")
      .select("total")
      .eq("partner_id", partnerId)
      .eq("status", "入金済み")
      .gte("paid_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    // 未回収請求書（送付済み）
    supabase
      .from("invoices")
      .select("id, total")
      .eq("partner_id", partnerId)
      .eq("status", "送付済み"),
    // 新規引合い
    supabase
      .from("agent_inquiries")
      .select("id, partner_status")
      .eq("partner_id", partnerId)
      .eq("partner_status", "新規"),
    // 承認待ち
    supabase
      .from("approvals")
      .select("id")
      .eq("partner_id", partnerId)
      .eq("status", "承認待ち"),
    // 見積書ステータス別
    supabase
      .from("quotes")
      .select("status")
      .eq("partner_id", partnerId),
    // 請求書ステータス別
    supabase
      .from("invoices")
      .select("status")
      .eq("partner_id", partnerId),
    // 納品書ステータス別
    supabase
      .from("delivery_slips")
      .select("status")
      .eq("partner_id", partnerId),
    // 活動ログ
    supabase
      .from("activity_logs")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })
      .limit(5),
    // 期限間近の見積書
    supabase
      .from("quotes")
      .select("id, document_number, valid_until")
      .eq("partner_id", partnerId)
      .not("valid_until", "is", null)
      .in("status", ["下書き", "送付済み"])
      .lte("valid_until", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0])
      .order("valid_until"),
    // 期限間近の請求書
    supabase
      .from("invoices")
      .select("id, document_number, due_date")
      .eq("partner_id", partnerId)
      .not("due_date", "is", null)
      .eq("status", "送付済み")
      .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0])
      .order("due_date"),
    // 期限間近のタスク
    supabase
      .from("tasks")
      .select("id, title, due_date")
      .eq("assigned_partner_id", partnerId)
      .not("due_date", "is", null)
      .in("status", ["未着手", "進行中"])
      .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0])
      .order("due_date"),
  ]);

  const monthlySales = paidInvoices?.reduce((s, i) => s + (i.total ?? 0), 0) ?? 0;
  const uncollectedCount = sentInvoices?.length ?? 0;
  const uncollectedAmount = sentInvoices?.reduce((s, i) => s + (i.total ?? 0), 0) ?? 0;
  const newInquiryCount = inquiries?.length ?? 0;
  const pendingApprovalCount = pendingApprovals?.length ?? 0;

  // ステータス集計
  const countStatus = (data: { status: string }[] | null, status: string) =>
    data?.filter((d) => d.status === status).length ?? 0;

  const quoteStatuses = [
    { label: "下書き", count: countStatus(quotes, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(quotes, "送付済み"), color: "bg-blue-500" },
    { label: "承諾", count: countStatus(quotes, "承諾"), color: "bg-green-500" },
    { label: "辞退", count: countStatus(quotes, "辞退"), color: "bg-red-400" },
    { label: "期限切れ", count: countStatus(quotes, "期限切れ"), color: "bg-yellow-500" },
  ];

  const invoiceStatuses = [
    { label: "下書き", count: countStatus(invoices, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(invoices, "送付済み"), color: "bg-blue-500" },
    { label: "入金済み", count: countStatus(invoices, "入金済み"), color: "bg-green-500" },
    { label: "期限超過", count: countStatus(invoices, "期限超過"), color: "bg-red-400" },
    { label: "取消", count: countStatus(invoices, "取消"), color: "bg-yellow-500" },
  ];

  const slipStatuses = [
    { label: "下書き", count: countStatus(deliverySlips, "下書き"), color: "bg-gray-400" },
    { label: "発行済み", count: countStatus(deliverySlips, "発行済み"), color: "bg-green-500" },
  ];

  // 期限リスト
  const deadlineItems = [
    ...(upcomingQuotes?.map((q) => ({
      id: q.id,
      label: q.document_number,
      date: q.valid_until!,
      link: `/partner/quotes/${q.id}`,
      type: "見積書",
    })) ?? []),
    ...(upcomingInvoices?.map((i) => ({
      id: i.id,
      label: i.document_number,
      date: i.due_date!,
      link: `/partner/invoices/${i.id}`,
      type: "請求書",
    })) ?? []),
    ...(upcomingTasks?.map((t) => ({
      id: t.id,
      label: t.title,
      date: t.due_date!,
      link: "/partner/groupware/tasks",
      type: "タスク",
    })) ?? []),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* Row 1: KPIカード */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <PartnerStatsCard
          label="今月の売上"
          value={`¥${monthlySales.toLocaleString()}`}
        />
        <PartnerStatsCard
          label="未回収請求"
          value={uncollectedCount}
          sub={uncollectedAmount > 0 ? `¥${uncollectedAmount.toLocaleString()}` : undefined}
        />
        <PartnerStatsCard
          label="未対応引合い"
          value={newInquiryCount}
        />
        <PartnerStatsCard
          label="承認待ち"
          value={pendingApprovalCount}
        />
      </div>

      {/* Row 2: 帳票ステータスサマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <DocumentStatusSummary title="見積書" statuses={quoteStatuses} />
        <DocumentStatusSummary title="請求書" statuses={invoiceStatuses} />
        <DocumentStatusSummary title="納品書" statuses={slipStatuses} />
      </div>

      {/* Row 3: 活動ログ + 期限リスト */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">直近の活動</h2>
          <ActivityLogList logs={(activityLogs ?? []) as ActivityLog[]} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">期限間近の項目</h2>
          <DeadlineList items={deadlineItems} />
        </div>
      </div>
    </div>
  );
}
