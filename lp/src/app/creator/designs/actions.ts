import { getSupabase } from "@/lib/supabase";

export async function createDesign({
  affiliateId,
  productId,
  lotId,
  slug,
}: {
  affiliateId: string;
  productId: string;
  lotId: string;
  slug: string;
}) {
  const { data, error } = await getSupabase()
    .from("creator_lp_designs")
    .insert({
      affiliate_id: affiliateId,
      product_id: productId,
      lot_id: lotId,
      slug,
      design_config: [],
      theme: {
        primary_color: "#6366f1",
        secondary_color: "#8b5cf6",
        bg_color: "#ffffff",
        font: "inherit",
      },
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDesign(id: string) {
  const { error } = await getSupabase()
    .from("creator_lp_designs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function togglePublish(id: string, isPublished: boolean) {
  const { error } = await getSupabase()
    .from("creator_lp_designs")
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
