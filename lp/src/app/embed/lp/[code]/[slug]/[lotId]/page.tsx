import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlockRenderer } from "@/components/creator-lp/BlockRenderer";
import type { Affiliate, Product, Lot, Partner, Tag, CreatorLPDesign, LPBlock, LPTheme } from "@/lib/types";

type Props = {
  params: Promise<{ code: string; slug: string; lotId: string }>;
};

export default async function EmbedLPPage({ params }: Props) {
  const { code, slug, lotId } = await params;
  const supabase = getSupabase();

  // 1. Validate affiliate (is_creator=true)
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("code", code)
    .eq("is_creator", true)
    .single<Affiliate>();

  if (!affiliate) notFound();

  // 2. Validate product by slug
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Product>();

  if (!product) notFound();

  // 3. Validate lot
  const { data: lot } = await supabase
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .eq("product_id", product.id)
    .single<Lot>();

  if (!lot) notFound();

  // 4. Fetch design (is_published=true)
  const { data: design } = await supabase
    .from("creator_lp_designs")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .eq("slug", slug)
    .eq("lot_id", lotId)
    .eq("is_published", true)
    .single<CreatorLPDesign>();

  if (!design) notFound();

  // 5. Increment views
  await supabase.rpc("increment_lp_views", { p_design_id: design.id });

  // 6. Fetch partner info
  let partner: Partner | null = null;
  if (product.partner_id) {
    const { data } = await supabase
      .from("partners")
      .select("*")
      .eq("id", product.partner_id)
      .single<Partner>();
    partner = data;
  }

  // 7. Fetch tags
  const { data: productTags } = await supabase
    .from("product_tags")
    .select("tag_id, tags(*)")
    .eq("product_id", product.id);

  const tags = (productTags ?? [])
    .map((pt: Record<string, unknown>) => pt.tags as Tag | null)
    .filter((t): t is Tag => t !== null && t.is_active);

  const blocks = (design.design_config || []) as LPBlock[];
  const theme = (design.theme || {
    primary_color: "#6366f1",
    secondary_color: "#8b5cf6",
    bg_color: "#ffffff",
    font: "inherit",
  }) as LPTheme;

  // 年齢確認状態の取得（年齢制限商品の場合のみ）
  // 未取得だと確認済みユーザーにも再度モーダルを出してしまうため、
  // クリエイターLP (/c/[code]/[slug]/[lotId]) と同じ扱いに揃える。
  // なお iframe 内ではサードパーティCookie制約でセッションを取得できず
  // ageVerified=false になる場合があるが、その場合もモーダル + /api/checkout の
  // サーバ側再検証で保護されるため、安全側に倒れる。
  let ageVerified = false;
  if (product.age_restricted) {
    try {
      const authed = await createSupabaseServerClient();
      const { data: { user } } = await authed.auth.getUser();
      if (user) {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("user_profiles")
          .select("age_verified_at")
          .eq("id", user.id)
          .maybeSingle();
        ageVerified = !!profile?.age_verified_at;
      }
    } catch {
      // セッション未取得時は未確認扱い
    }
  }

  return (
    <BlockRenderer
      blocks={blocks}
      context={{ product, lot, partner, tags, theme, ageVerified }}
    />
  );
}
