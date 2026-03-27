import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { getArticleTemplate } from "@/lib/creator-lp/article-templates";
import type { ArticleTemplate } from "@/lib/types";

export const runtime = "nodejs";

/**
 * GET /api/articles - 記事LP一覧取得
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const affiliateId = searchParams.get("affiliate_id");
  const category = searchParams.get("category");
  const isPublished = searchParams.get("published");

  let query = supabase
    .from("article_lp_designs")
    .select("id, slug, title, description, cover_image_url, category, tags, template_type, is_published, published_at, views_count, share_count, conversion_count, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (affiliateId) query = query.eq("affiliate_id", affiliateId);
  if (category) query = query.eq("category", category);
  if (isPublished === "true") query = query.eq("is_published", true);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data });
}

/**
 * POST /api/articles - 記事LP作成
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    affiliate_id,
    title,
    description,
    category = "business",
    template_type = "threads_viral",
    tags = [],
  } = body;

  if (!affiliate_id || !title) {
    return NextResponse.json(
      { error: "affiliate_id and title are required" },
      { status: 400 }
    );
  }

  // テンプレートからブロックとテーマを生成
  const template = getArticleTemplate(template_type as ArticleTemplate);
  const design_config = template ? template.blocks() : [];
  const theme = template?.theme || {
    primary_color: "#000000",
    secondary_color: "#666666",
    bg_color: "#FFFFFF",
    font: "system-ui",
  };

  // タイトルをテンプレートに反映
  if (design_config.length > 0 && design_config[0].type === "article_header") {
    design_config[0].props.title = title;
    if (description) design_config[0].props.subtitle = description;
  }

  const slug = `article-${nanoid(8)}`;

  const { data, error } = await supabase
    .from("article_lp_designs")
    .insert({
      affiliate_id,
      slug,
      title,
      description,
      category,
      tags,
      template_type,
      design_config,
      theme,
      seo_config: {
        meta_title: title,
        meta_description: description || "",
        canonical_url: null,
        og_image_url: null,
        keywords: tags,
        noindex: false,
      },
      analytics_config: {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        conversion_goals: [],
        ab_test_id: null,
      },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article: data }, { status: 201 });
}
