import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/marketing/reports - マーケティングレポート取得
 * クエリパラメータ:
 *   type: daily | weekly | monthly | campaign
 *   start: 開始日 (YYYY-MM-DD)
 *   end: 終了日 (YYYY-MM-DD)
 *   affiliate_id: アフィリエイトID（任意）
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const reportType = searchParams.get("type") || "weekly";
  const startDate = searchParams.get("start") || getDefaultStartDate(reportType);
  const endDate = searchParams.get("end") || new Date().toISOString().slice(0, 10);
  const affiliateId = searchParams.get("affiliate_id");

  // LP閲覧データ集計
  let lpQuery = supabase
    .from("creator_lp_designs")
    .select("id, slug, views_count, is_published, created_at, updated_at");
  if (affiliateId) lpQuery = lpQuery.eq("affiliate_id", affiliateId);
  const { data: lpDesigns } = await lpQuery;

  // 記事LP閲覧データ集計
  let articleQuery = supabase
    .from("article_lp_designs")
    .select("id, slug, title, views_count, share_count, conversion_count, category, template_type, is_published, created_at, updated_at");
  if (affiliateId) articleQuery = articleQuery.eq("affiliate_id", affiliateId);
  const { data: articles } = await articleQuery;

  // ロット購入データ集計
  let purchaseQuery = supabase
    .from("lot_purchases")
    .select("id, amount, created_at")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`);
  const { data: purchases } = await purchaseQuery;

  // アフィリエイトデータ集計
  let referralQuery = supabase
    .from("referrals")
    .select("id, commission, status, created_at")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`);
  if (affiliateId) referralQuery = referralQuery.eq("affiliate_id", affiliateId);
  const { data: referrals } = await referralQuery;

  // メトリクス計算
  const totalViews = (lpDesigns?.reduce((s, d) => s + (d.views_count || 0), 0) || 0)
    + (articles?.reduce((s, a) => s + (a.views_count || 0), 0) || 0);
  const totalShares = articles?.reduce((s, a) => s + (a.share_count || 0), 0) || 0;
  const totalConversions = (purchases?.length || 0)
    + (articles?.reduce((s, a) => s + (a.conversion_count || 0), 0) || 0);
  const totalRevenue = purchases?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
  const totalCommission = referrals?.reduce((s, r) => s + (r.commission || 0), 0) || 0;
  const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

  // テンプレート別パフォーマンス
  const templatePerformance: Record<string, { views: number; shares: number; conversions: number }> = {};
  articles?.forEach((a) => {
    const key = a.template_type || "custom";
    if (!templatePerformance[key]) {
      templatePerformance[key] = { views: 0, shares: 0, conversions: 0 };
    }
    templatePerformance[key].views += a.views_count || 0;
    templatePerformance[key].shares += a.share_count || 0;
    templatePerformance[key].conversions += a.conversion_count || 0;
  });

  // カテゴリ別パフォーマンス
  const categoryPerformance: Record<string, { count: number; views: number; conversions: number }> = {};
  articles?.forEach((a) => {
    const key = a.category || "other";
    if (!categoryPerformance[key]) {
      categoryPerformance[key] = { count: 0, views: 0, conversions: 0 };
    }
    categoryPerformance[key].count++;
    categoryPerformance[key].views += a.views_count || 0;
    categoryPerformance[key].conversions += a.conversion_count || 0;
  });

  // トップ記事
  const topArticles = [...(articles || [])]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      title: a.title,
      views: a.views_count,
      shares: a.share_count,
      conversions: a.conversion_count,
      template_type: a.template_type,
      category: a.category,
    }));

  const report = {
    report_type: reportType,
    period: { start: startDate, end: endDate },
    summary: {
      total_views: totalViews,
      total_shares: totalShares,
      total_conversions: totalConversions,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      active_lps: lpDesigns?.filter((d) => d.is_published).length || 0,
      active_articles: articles?.filter((a) => a.is_published).length || 0,
      total_articles: articles?.length || 0,
    },
    template_performance: templatePerformance,
    category_performance: categoryPerformance,
    top_articles: topArticles,
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(report);
}

function getDefaultStartDate(type: string): string {
  const now = new Date();
  switch (type) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      now.setDate(now.getDate() - 7);
      return now.toISOString().slice(0, 10);
    case "monthly":
      now.setMonth(now.getMonth() - 1);
      return now.toISOString().slice(0, 10);
    default:
      now.setMonth(now.getMonth() - 3);
      return now.toISOString().slice(0, 10);
  }
}
