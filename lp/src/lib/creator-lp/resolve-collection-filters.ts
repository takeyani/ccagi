import { getSupabase } from "@/lib/supabase";
import type {
  CollectionFilterConditions,
  CollectionItem,
  Product,
  Lot,
  Partner,
  Tag,
  CreatorLPDesign,
} from "@/lib/types";

export async function resolveCollectionFilters(
  conditions: CollectionFilterConditions,
  affiliateId: string
): Promise<CollectionItem[]> {
  const supabase = getSupabase();
  let productIds: Set<string> | null = null;

  // 1. tag_ids → product_tags JOIN で商品ID収集
  if (conditions.tag_ids && conditions.tag_ids.length > 0) {
    const { data: tagMatches } = await supabase
      .from("product_tags")
      .select("product_id")
      .in("tag_id", conditions.tag_ids);

    const ids = new Set((tagMatches ?? []).map((t: { product_id: string }) => t.product_id));
    productIds = productIds ? new Set([...productIds].filter((id) => ids.has(id))) : ids;
  }

  // 2. partner_ids → products.partner_id でマッチ
  if (conditions.partner_ids && conditions.partner_ids.length > 0) {
    const { data: partnerProducts } = await supabase
      .from("products")
      .select("id")
      .in("partner_id", conditions.partner_ids)
      .eq("is_active", true);

    const ids = new Set((partnerProducts ?? []).map((p: { id: string }) => p.id));
    productIds = productIds ? new Set([...productIds].filter((id) => ids.has(id))) : ids;
  }

  // 3. keyword → products.name/description ILIKE検索
  if (conditions.keyword && conditions.keyword.trim()) {
    const kw = `%${conditions.keyword.trim()}%`;
    const { data: kwProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .or(`name.ilike.${kw},description.ilike.${kw}`);

    const ids = new Set((kwProducts ?? []).map((p: { id: string }) => p.id));
    productIds = productIds ? new Set([...productIds].filter((id) => ids.has(id))) : ids;
  }

  // If no filters at all, fetch all active products
  if (productIds === null) {
    const { data: allProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true);

    productIds = new Set((allProducts ?? []).map((p: { id: string }) => p.id));
  }

  // 4. include_design_ids → 手動ピン留めデザインの商品を強制追加
  if (conditions.include_design_ids && conditions.include_design_ids.length > 0) {
    const { data: pinnedDesigns } = await supabase
      .from("creator_lp_designs")
      .select("product_id")
      .in("id", conditions.include_design_ids);

    for (const d of pinnedDesigns ?? []) {
      if (d.product_id) productIds.add(d.product_id);
    }
  }

  // 5. exclude_product_ids → 除外
  if (conditions.exclude_product_ids && conditions.exclude_product_ids.length > 0) {
    for (const id of conditions.exclude_product_ids) {
      productIds.delete(id);
    }
  }

  if (productIds.size === 0) return [];

  const idArray = [...productIds];

  // Fetch full product data
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", idArray)
    .eq("is_active", true)
    .order("name");

  if (!products || products.length === 0) return [];

  // Batch fetch lots, tags, designs for all products
  const [
    { data: allLots },
    { data: allProductTags },
    { data: allDesigns },
  ] = await Promise.all([
    supabase
      .from("lots")
      .select("*")
      .in("product_id", idArray)
      .order("created_at", { ascending: false }),
    supabase
      .from("product_tags")
      .select("product_id, tag_id, tags(*)")
      .in("product_id", idArray),
    supabase
      .from("creator_lp_designs")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .in("product_id", idArray)
      .eq("is_published", true),
  ]);

  // Collect unique partner_ids
  const partnerIdSet = new Set<string>();
  for (const p of products as Product[]) {
    if (p.partner_id) partnerIdSet.add(p.partner_id);
  }
  const partnerIdArr = [...partnerIdSet];
  let partnersMap: Record<string, Partner> = {};
  if (partnerIdArr.length > 0) {
    const { data: partners } = await supabase
      .from("partners")
      .select("*")
      .in("id", partnerIdArr);
    for (const p of (partners ?? []) as Partner[]) {
      partnersMap[p.id] = p;
    }
  }

  // Build CollectionItem for each product
  const items: CollectionItem[] = (products as Product[]).map((product) => {
    const lots = ((allLots ?? []) as Lot[]).filter((l) => l.product_id === product.id);
    const partner = product.partner_id ? partnersMap[product.partner_id] ?? null : null;
    const tags = ((allProductTags ?? []) as unknown as Array<{ product_id: string; tags: Tag | null }>)
      .filter((pt) => pt.product_id === product.id && pt.tags && (pt.tags as Tag).is_active)
      .map((pt) => pt.tags as Tag);
    const creatorDesigns = ((allDesigns ?? []) as CreatorLPDesign[]).filter(
      (d) => d.product_id === product.id
    );

    return { product, lots, partner, tags, creatorDesigns };
  });

  return items;
}
