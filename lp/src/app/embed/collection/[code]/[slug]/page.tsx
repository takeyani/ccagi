import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { resolveCollectionFilters } from "@/lib/creator-lp/resolve-collection-filters";
import { CollectionPageClient } from "./CollectionPageClient";
import type {
  Affiliate,
  CreatorLPCollection,
  CollectionBlock,
  LPTheme,
  Tag,
} from "@/lib/types";

type Props = {
  params: Promise<{ code: string; slug: string }>;
};

export default async function EmbedCollectionPage({ params }: Props) {
  const { code, slug } = await params;
  const supabase = getSupabase();

  // 1. Validate affiliate
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("code", code)
    .eq("is_creator", true)
    .single<Affiliate>();

  if (!affiliate) notFound();

  // 2. Fetch collection
  const { data: collection } = await supabase
    .from("creator_lp_collections")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .single<CreatorLPCollection>();

  if (!collection) notFound();

  // 3. Increment views
  await supabase.rpc("increment_collection_views", {
    p_collection_id: collection.id,
  });

  // 4. Resolve filters
  const items = await resolveCollectionFilters(
    collection.filter_conditions,
    affiliate.id
  );

  // 5. Collect all unique tags from items
  const tagMap = new Map<string, Tag>();
  for (const item of items) {
    for (const tag of item.tags) {
      tagMap.set(tag.id, tag);
    }
  }
  const allTags = [...tagMap.values()];

  const blocks = (collection.design_config || []) as CollectionBlock[];
  const theme = (collection.theme || {
    primary_color: "#6366f1",
    secondary_color: "#8b5cf6",
    bg_color: "#ffffff",
    font: "inherit",
  }) as LPTheme;

  return (
    <CollectionPageClient
      blocks={blocks}
      items={items}
      affiliateCode={code}
      allTags={allTags}
      theme={theme}
      isEmbed
    />
  );
}
