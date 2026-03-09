"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Tag, Partner, CreatorLPDesign, CollectionFilterConditions } from "@/lib/types";
import { createCollection } from "../actions";

type DesignRow = Pick<CreatorLPDesign, "id" | "slug" | "product_id" | "lot_id" | "is_published" | "views_count"> & {
  product_name?: string;
};

export default function NewCollectionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabase();
      const code = localStorage.getItem("creator_code");

      const [{ data: tagData }, { data: partnerData }] = await Promise.all([
        supabase
          .from("tags")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("partners")
          .select("*")
          .order("company_name"),
      ]);
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
            // Fetch product names
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
    loadData();
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    setLoading(true);
    setError("");

    try {
      const code = localStorage.getItem("creator_code");
      if (!code) throw new Error("Not authenticated");

      const { data: affiliate } = await getSupabase()
        .from("affiliates")
        .select("id")
        .eq("code", code)
        .single();

      if (!affiliate) throw new Error("Affiliate not found");

      const filterConditions: CollectionFilterConditions = {};
      if (selectedTagIds.length > 0) filterConditions.tag_ids = selectedTagIds;
      if (selectedPartnerIds.length > 0) filterConditions.partner_ids = selectedPartnerIds;
      if (keyword.trim()) filterConditions.keyword = keyword.trim();
      if (selectedDesignIds.length > 0) filterConditions.include_design_ids = selectedDesignIds;

      const result = await createCollection({
        affiliateId: affiliate.id,
        title: title.trim(),
        slug: slug.trim(),
        filterConditions,
      });

      router.push(`/creator/collections/${result.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規コレクション作成</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg rounded-2xl bg-white p-6 shadow-sm border"
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="例: オーガニック食品まとめ"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スラッグ（URL用）
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="例: organic-foods"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグでフィルタ（任意）
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
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
              メーカーでフィルタ（任意）
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
            <p className="mt-1 text-xs text-gray-400">
              Ctrl/Cmdキーで複数選択可能
            </p>
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索（任意）
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
                既存LPから選んで追加（任意）
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
                            ? prev.filter((id) => id !== d.id)
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

        <button
          type="submit"
          disabled={loading || !title.trim() || !slug.trim()}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "作成中..." : "コレクションを作成してエディターを開く"}
        </button>
      </form>
    </div>
  );
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u3000-\u9fff-]/g, "")
    .replace(/[\s\u3000]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
