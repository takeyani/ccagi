"use client";

import { useState } from "react";
import type { Tag, CollectionItem } from "@/lib/types";

type Props = {
  props: Record<string, unknown>;
  items: CollectionItem[];
  allTags: Tag[];
  onFilter: (filtered: CollectionItem[]) => void;
};

export function CollectionFilterBarBlock({ props, items, allTags, onFilter }: Props) {
  const showTagFilter = props.show_tag_filter !== false;
  const showPriceFilter = props.show_price_filter !== false;
  const showSearch = props.show_search !== false;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  const applyFilters = (
    query: string,
    tagIds: Set<string>,
    price: { min: string; max: string }
  ) => {
    let filtered = [...items];

    // Search filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product.name.toLowerCase().includes(q) ||
          (item.product.description ?? "").toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (tagIds.size > 0) {
      filtered = filtered.filter((item) =>
        item.tags.some((t) => tagIds.has(t.id))
      );
    }

    // Price filter
    const minPrice = price.min ? Number(price.min) : null;
    const maxPrice = price.max ? Number(price.max) : null;
    if (minPrice !== null || maxPrice !== null) {
      filtered = filtered.filter((item) => {
        const lowestPrice = item.lots
          .filter((l) => l.price !== null)
          .reduce((m, l) => (l.price! < m ? l.price! : m), Infinity);
        if (lowestPrice === Infinity) return false;
        if (minPrice !== null && lowestPrice < minPrice) return false;
        if (maxPrice !== null && lowestPrice > maxPrice) return false;
        return true;
      });
    }

    onFilter(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    applyFilters(value, selectedTagIds, priceRange);
  };

  const handleTagToggle = (tagId: string) => {
    const next = new Set(selectedTagIds);
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }
    setSelectedTagIds(next);
    applyFilters(searchQuery, next, priceRange);
  };

  const handlePriceChange = (key: "min" | "max", value: string) => {
    const next = { ...priceRange, [key]: value };
    setPriceRange(next);
    applyFilters(searchQuery, selectedTagIds, next);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedTagIds(new Set());
    setPriceRange({ min: "", max: "" });
    onFilter(items);
  };

  const hasActiveFilters =
    searchQuery.trim() || selectedTagIds.size > 0 || priceRange.min || priceRange.max;

  return (
    <section className="mx-auto max-w-6xl px-6 py-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                キーワード検索
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="商品名で検索..."
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>
          )}

          {/* Price range */}
          {showPriceFilter && (
            <div className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  最低価格
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  placeholder="¥"
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <span className="pb-2 text-gray-400">〜</span>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  最高価格
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  placeholder="¥"
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              クリア
            </button>
          )}
        </div>

        {/* Tag filter */}
        {showTagFilter && allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedTagIds.has(tag.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
