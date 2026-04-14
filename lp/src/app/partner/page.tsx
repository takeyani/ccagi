import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerStatsCard } from "@/components/partner/StatsCard";
import { DocumentStatusSummary } from "@/components/shared/DocumentStatusSummary";
import { ActivityLogList } from "@/components/shared/ActivityLogList";
import { DeadlineList } from "@/components/shared/DeadlineList";
import { AccessDeniedBanner } from "@/components/shared/AccessDeniedBanner";
import type { ActivityLog } from "@/lib/types";

async function getDashboardData() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: prof } = await admin.from("user_profiles").select("partner_id").eq("id", user.id).maybeSingle();
    const partnerId = prof?.partner_id;
    if (!partnerId) return null;

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
      { count: productCount },
      { count: activeLotCount },
      { count: recurringCount },
      { count: insightCount },
    ] = await Promise.all([
      admin.from("invoices").select("total").eq("partner_id", partnerId).eq("status", "入金済み")
        .gte("paid_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      admin.from("invoices").select("id, total").eq("partner_id", partnerId).eq("status", "送付済み"),
      admin.from("agent_inquiries").select("id, partner_status").eq("partner_id", partnerId).eq("partner_status", "新規"),
      admin.from("approvals").select("id").eq("partner_id", partnerId).eq("status", "承認待ち"),
      admin.from("quotes").select("status").eq("partner_id", partnerId),
      admin.from("invoices").select("status").eq("partner_id", partnerId),
      admin.from("delivery_slips").select("status").eq("partner_id", partnerId),
      admin.from("activity_logs").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }).limit(5),
      admin.from("quotes").select("id, document_number, valid_until").eq("partner_id", partnerId)
        .not("valid_until", "is", null).in("status", ["下書き", "送付済み"])
        .lte("valid_until", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]).order("valid_until"),
      admin.from("invoices").select("id, document_number, due_date").eq("partner_id", partnerId)
        .not("due_date", "is", null).eq("status", "送付済み")
        .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]).order("due_date"),
      admin.from("tasks").select("id, title, due_date").eq("assigned_partner_id", partnerId)
        .not("due_date", "is", null).in("status", ["未着手", "進行中"])
        .lte("due_date", new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]).order("due_date"),
      admin.from("products").select("*", { count: "exact", head: true }).eq("partner_id", partnerId).eq("is_active", true),
      admin.from("lots").select("*, products!inner(partner_id)", { count: "exact", head: true })
        .eq("products.partner_id", partnerId).eq("status", "販売中"),
      admin.from("recurring_orders").select("*", { count: "exact", head: true }).eq("partner_id", partnerId).eq("status", "有効"),
      admin.from("non_financial_insights").select("*", { count: "exact", head: true }).eq("partner_id", partnerId),
    ]);

    return {
      paidInvoices, sentInvoices, inquiries, pendingApprovals,
      quotes, invoices, deliverySlips, activityLogs,
      upcomingQuotes, upcomingInvoices, upcomingTasks,
      productCount, activeLotCount, recurringCount, insightCount,
    };
  } catch {
    return null;
  }
}

export default async function PartnerDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <p className="text-gray-500">データを読み込めませんでした。再度ログインしてください。</p>
      </div>
    );
  }

  const monthlySales = data.paidInvoices?.reduce((s: number, i: { total: number | null }) => s + (i.total ?? 0), 0) ?? 0;
  const uncollectedCount = data.sentInvoices?.length ?? 0;
  const uncollectedAmount = data.sentInvoices?.reduce((s: number, i: { total: number | null }) => s + (i.total ?? 0), 0) ?? 0;
  const newInquiryCount = data.inquiries?.length ?? 0;
  const pendingApprovalCount = data.pendingApprovals?.length ?? 0;

  const countStatus = (arr: { status: string }[] | null, status: string) =>
    arr?.filter((d) => d.status === status).length ?? 0;

  const quoteStatuses = [
    { label: "下書き", count: countStatus(data.quotes, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(data.quotes, "送付済み"), color: "bg-blue-500" },
    { label: "承諾", count: countStatus(data.quotes, "承諾"), color: "bg-green-500" },
    { label: "辞退", count: countStatus(data.quotes, "辞退"), color: "bg-red-400" },
    { label: "期限切れ", count: countStatus(data.quotes, "期限切れ"), color: "bg-yellow-500" },
  ];
  const invoiceStatuses = [
    { label: "下書き", count: countStatus(data.invoices, "下書き"), color: "bg-gray-400" },
    { label: "送付済み", count: countStatus(data.invoices, "送付済み"), color: "bg-blue-500" },
    { label: "入金済み", count: countStatus(data.invoices, "入金済み"), color: "bg-green-500" },
    { label: "期限超過", count: countStatus(data.invoices, "期限超過"), color: "bg-red-400" },
    { label: "取消", count: countStatus(data.invoices, "取消"), color: "bg-yellow-500" },
  ];
  const slipStatuses = [
    { label: "下書き", count: countStatus(data.deliverySlips, "下書き"), color: "bg-gray-400" },
    { label: "発行済み", count: countStatus(data.deliverySlips, "発行済み"), color: "bg-green-500" },
  ];

  const deadlineItems = [
    ...(data.upcomingQuotes?.map((q: { id: string; document_number: string; valid_until: string }) => ({
      id: q.id, label: q.document_number, date: q.valid_until, link: `/partner/quotes/${q.id}`, type: "見積書",
    })) ?? []),
    ...(data.upcomingInvoices?.map((i: { id: string; document_number: string; due_date: string }) => ({
      id: i.id, label: i.document_number, date: i.due_date, link: `/partner/invoices/${i.id}`, type: "請求書",
    })) ?? []),
    ...(data.upcomingTasks?.map((t: { id: string; title: string; due_date: string }) => ({
      id: t.id, label: t.title, date: t.due_date, link: "/partner/groupware/tasks", type: "タスク",
    })) ?? []),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <Suspense><AccessDeniedBanner /></Suspense>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <PartnerStatsCard label="今月の売上" value={`¥${monthlySales.toLocaleString()}`} />
        <PartnerStatsCard label="未回収請求" value={uncollectedCount} sub={uncollectedAmount > 0 ? `¥${uncollectedAmount.toLocaleString()}` : undefined} />
        <PartnerStatsCard label="未対応引合い" value={newInquiryCount} />
        <PartnerStatsCard label="承認待ち" value={pendingApprovalCount} />
        <PartnerStatsCard label="商品数" value={data.productCount ?? 0} />
        <PartnerStatsCard label="販売中ロット" value={data.activeLotCount ?? 0} />
        <PartnerStatsCard label="定期購入（有効）" value={data.recurringCount ?? 0} />
        <PartnerStatsCard label="非財務インサイト" value={data.insightCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DocumentStatusSummary title="見積書" statuses={quoteStatuses} />
        <DocumentStatusSummary title="請求書" statuses={invoiceStatuses} />
        <DocumentStatusSummary title="納品書" statuses={slipStatuses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">直近の活動</h2>
          <ActivityLogList logs={(data.activityLogs ?? []) as ActivityLog[]} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">期限間近の項目</h2>
          <DeadlineList items={deadlineItems} />
        </div>
      </div>
    </div>
  );
}
