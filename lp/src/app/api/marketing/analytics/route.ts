import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/marketing/analytics - アナリティクスイベント記録
 * フロントエンドからのイベントトラッキング
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    event_type,  // page_view | click | scroll | conversion | share | cta_click
    article_id,
    design_id,
    metadata = {},
  } = body;

  if (!event_type) {
    return NextResponse.json({ error: "event_type is required" }, { status: 400 });
  }

  const contentId = article_id || design_id;
  const contentType = article_id ? "article" : "design";

  // イベント記録
  await supabase.from("marketing_events").insert({
    event_type,
    content_id: contentId,
    content_type: contentType,
    metadata: {
      ...metadata,
      user_agent: request.headers.get("user-agent") || "",
      referer: request.headers.get("referer") || "",
      timestamp: new Date().toISOString(),
    },
  });

  // ビューカウント/シェアカウント/コンバージョンカウントのインクリメント
  if (contentId) {
    const table = contentType === "article" ? "article_lp_designs" : "creator_lp_designs";

    if (event_type === "page_view") {
      await supabase.rpc("increment_counter", {
        table_name: table,
        row_id: contentId,
        column_name: "views_count",
      });
    } else if (event_type === "share" && contentType === "article") {
      await supabase.rpc("increment_counter", {
        table_name: table,
        row_id: contentId,
        column_name: "share_count",
      });
    } else if (event_type === "conversion" && contentType === "article") {
      await supabase.rpc("increment_counter", {
        table_name: table,
        row_id: contentId,
        column_name: "conversion_count",
      });
    }
  }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/marketing/analytics - コンテンツ別アナリティクス取得
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const contentId = searchParams.get("content_id");
  const contentType = searchParams.get("content_type") || "article";
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from("marketing_events")
    .select("event_type, metadata, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (contentId) {
    query = query.eq("content_id", contentId);
  }
  if (contentType) {
    query = query.eq("content_type", contentType);
  }

  const { data: events, error } = await query.limit(10000);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 集計
  const summary: Record<string, number> = {};
  const dailyBreakdown: Record<string, Record<string, number>> = {};
  const referrerBreakdown: Record<string, number> = {};

  events?.forEach((e) => {
    // イベントタイプ別集計
    summary[e.event_type] = (summary[e.event_type] || 0) + 1;

    // 日別集計
    const date = e.created_at.slice(0, 10);
    if (!dailyBreakdown[date]) dailyBreakdown[date] = {};
    dailyBreakdown[date][e.event_type] = (dailyBreakdown[date][e.event_type] || 0) + 1;

    // リファラー集計
    const referer = (e.metadata as Record<string, string>)?.referer || "direct";
    const domain = referer === "direct" ? "direct" : new URL(referer).hostname;
    referrerBreakdown[domain] = (referrerBreakdown[domain] || 0) + 1;
  });

  // リファラーをソートしてトップ10
  const topReferrers = Object.entries(referrerBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }));

  return NextResponse.json({
    summary,
    daily_breakdown: dailyBreakdown,
    top_referrers: topReferrers,
    total_events: events?.length || 0,
    period: { start: since.toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) },
  });
}
