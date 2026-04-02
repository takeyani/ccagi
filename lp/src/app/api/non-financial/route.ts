import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { source_type, source_id, category, partner_id, product_id, customer_segment, content, summary, tags, sentiment_score, metadata } = body;

  if (!content || !category) {
    return NextResponse.json({ error: "content and category are required" }, { status: 400 });
  }

  const validCategories = ["gratitude", "emotion", "choice_reason", "goal", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (content.length > 10000) {
    return NextResponse.json({ error: "Content too long" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("non_financial_insights")
    .insert({
      source_type: source_type || "survey",
      source_id: source_id || null,
      category,
      partner_id: partner_id || null,
      product_id: product_id || null,
      customer_segment: customer_segment || null,
      content,
      summary: summary || null,
      tags: tags || [],
      sentiment_score: sentiment_score ?? null,
      metadata: metadata || {},
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partner_id");
  const productId = searchParams.get("product_id");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const supabase = createAdminClient();

  let query = supabase
    .from("non_financial_insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (partnerId) query = query.eq("partner_id", partnerId);
  if (productId) query = query.eq("product_id", productId);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 集計
  const summary = {
    gratitude: 0,
    emotion: 0,
    choice_reason: 0,
    goal: 0,
    other: 0,
    total: data?.length || 0,
  };
  for (const row of data || []) {
    const cat = row.category as keyof typeof summary;
    if (cat in summary) summary[cat]++;
  }

  return NextResponse.json({ data, summary });
}
