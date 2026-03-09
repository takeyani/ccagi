"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPCollection, Tag, Partner, CreatorLPDesign, CollectionFilterConditions } from "@/lib/types";
import { updateCollectionFilters } from "../../actions";

type DesignRow = Pick<CreatorLPDesign, "id" | "slug" | "product_id" | "lot_id" | "is_published" | "views_count"> & {
  product_name?: string;
};

export default function CollectionSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [collection, setCollection] = useState<CreatorLPCollection | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const code = localStorage.getItem("creator_code");

      const [{ data: collData }, { data: tagData }, { data: partnerData }] =
        await Promise.all([
          supabase
            .from("creator_lp_collections")
            .select("*")
            .eq("id", id)
            .single(),
          supabase
            .from("tags")
            .select("*")
            .eq("is_active", true)
            .order("sort_order"),
          supabase.from("partners").select("*").order("company_name"),
        ]);

      if (!collData) {
        setError("コレクションが見つかりません");
        return;
      }

      const coll = collData as CreatorLPCollection;
      setCollection(coll);
      setTitle(coll.title);
      setDescription(coll.description ?? "");
      setCoverImageUrl(coll.cover_image_url ?? "");
      setSelectedTagIds(coll.filter_conditions.tag_ids ?? []);
      setSelectedPartnerIds(coll.filter_conditions.partner_ids ?? []);
      setSelectedDesignIds(coll.filter_conditions.include_design_ids ?? []);
      setKeyword(coll.filter_conditions.keyword ?? "");
      setTags((tagData as Tag[]) ?? []);
      setPartners((partnerData as Partner[]) ?? []);

      // Load creator's existing designs
      if (code) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id")
          .eq("code", code)
          .single();

        if (affiliate) {
          const { data: designData } = await supabase
            .from("creator_lp_designs")
            .select("id, slug, product_id, lot_id, is_published, views_count")
            .eq("affiliate_id", affiliate.id)
            .order("created_at", { ascending: false });

          if (designData && designData.length > 0) {
            const productIds = [...new Set(designData.map((d: DesignRow) => d.product_id).filter(Boolean))] as string[];
            const { data: products } = productIds.length > 0
              ? await supabase.from("products").select("id, name").in("id", productIds)
              : { data: [] };
            const productMap = new Map((products ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

            setDesigns(
              (designData as DesignRow[]).map((d) => ({
                ...d,
                product_name: d.product_id ? productMap.get(d.product_id) ?? "" : "",
              }))
            );
          }
        }
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const filterConditions: CollectionFilterConditions = {};
      if (selectedTagIds.length > 0) filterConditions.tag_ids = selectedTagIds;
      if (selectedPartnerIds.length > 0) filterConditions.partner_ids = selectedPartnerIds;
      if (keyword.trim()) filterConditions.keyword = keyword.trim();
      if (selectedDesignIds.length > 0) filterConditions.include_design_ids = selectedDesignIds;

      // Keep existing exclude if any
      if (collection?.filter_conditions.exclude_product_ids) {
        filterConditions.exclude_product_ids = collection.filter_conditions.exclude_product_ids;
      }

      await updateCollectionFilters(
        id,
        filterConditions,
        title.trim(),
        description.trim() || undefined,
        coverImageUrl.trim() || undefined
      );

      router.push("/creator/collections");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (error && !collection) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!collection) {
    return <p className="text-gray-500">読み込み中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">コレクション設定</h1>

      <div className="max-w-lg rounded-2xl bg-white p-6 shadow-sm border">
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カバー画像URL（任意）
            </label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Slug (read only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スラッグ（変更不可）
            </label>
            <input
              type="text"
              value={collection.slug}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 font-mono text-sm"
            />
          </div>

          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグでフィルタ
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((i) => i !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-gray-400">タグがありません</p>
              )}
            </div>
          </div>

          {/* Partner filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メーカーでフィルタ
            </label>
            <select
              multiple
              value={selectedPartnerIds}
              onChange={(e) =>
                setSelectedPartnerIds(
                  [...e.target.selectedOptions].map((o) => o.value)
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              size={Math.min(partners.length, 5)}
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例: organic"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Existing designs picker */}
          {designs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                既存LPから選んで追加
              </label>
              <p className="mb-2 text-xs text-gray-400">
                選択したLPの商品がコレクションに含まれます
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y">
                {designs.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDesignIds.includes(d.id)}
                      onChange={() =>
                        setSelectedDesignIds((prev) =>
                          prev.includes(d.id)
                            ? prev.filter((i) => i !== d.id)
                            : [...prev, d.id]
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-900 truncate block">
                        {d.product_name || d.slug}
                      </span>
                      <span className="text-xs text-gray-400">
                        /{d.slug} {d.is_published ? "公開中" : "下書き"} ・ {d.views_count}PV
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {selectedDesignIds.length > 0 && (
                <p className="mt-1 text-xs text-indigo-600">
                  {selectedDesignIds.length}件のLPを選択中
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "設定を保存"}
          </button>
          <button
            onClick={() => router.push("/creator/collections")}
            className="rounded-full border px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
