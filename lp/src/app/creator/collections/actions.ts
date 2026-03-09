import { getSupabase } from "@/lib/supabase";
import type { CollectionFilterConditions } from "@/lib/types";

export async function createCollection({
  affiliateId,
  title,
  slug,
  filterConditions,
}: {
  affiliateId: string;
  title: string;
  slug: string;
  filterConditions: CollectionFilterConditions;
}) {
  const { data, error } = await getSupabase()
    .from("creator_lp_collections")
    .insert({
      affiliate_id: affiliateId,
      title,
      slug,
      filter_conditions: filterConditions,
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

export async function deleteCollection(id: string) {
  const { error } = await getSupabase()
    .from("creator_lp_collections")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleCollectionPublish(id: string, isPublished: boolean) {
  const { error } = await getSupabase()
    .from("creator_lp_collections")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateCollectionFilters(
  id: string,
  filterConditions: CollectionFilterConditions,
  title?: string,
  description?: string,
  coverImageUrl?: string
) {
  const updates: Record<string, unknown> = {
    filter_conditions: filterConditions,
    updated_at: new Date().toISOString(),
  };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;

  const { error } = await getSupabase()
    .from("creator_lp_collections")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}
