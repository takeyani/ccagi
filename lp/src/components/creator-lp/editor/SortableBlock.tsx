"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LPBlock, CollectionBlock } from "@/lib/types";
import { getBlockDefinition } from "@/lib/creator-lp/block-definitions";
import { getCollectionBlockDefinition } from "@/lib/creator-lp/collection-block-definitions";

type Props = {
  block: LPBlock | CollectionBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

export function SortableBlock({ block, isSelected, onSelect, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockType = block.type as string;
  const def = getBlockDefinition(block.type as never) ?? getCollectionBlockDefinition(block.type as never);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative rounded-lg border bg-white p-4 transition cursor-pointer ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Drag handle + controls */}
      <div className="absolute -top-3 left-2 flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 cursor-grab active:cursor-grabbing"
        >
          ⠿
        </button>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {def?.icon} {def?.label}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-3 right-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 opacity-0 group-hover:opacity-100 transition hover:bg-red-200"
      >
        削除
      </button>

      {/* Block preview */}
      <div className="mt-2 text-sm text-gray-500">
        {blockType === "hero" && (
          <div className="rounded bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-center text-white">
            <p className="font-bold">{(block.props.title as string) || "ヒーロー"}</p>
          </div>
        )}
        {blockType === "product_info" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📦</span> 商品情報ブロック（自動取得）
          </div>
        )}
        {blockType === "lot_details" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🏷️</span> ロット詳細 + 購入ボタン
          </div>
        )}
        {blockType === "image" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🖼️</span> {(block.props.alt_text as string) || "画像"}
          </div>
        )}
        {blockType === "text" && (
          <p className="truncate">
            {(block.props.content as string)?.slice(0, 60) || "テキスト"}
          </p>
        )}
        {blockType === "features" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>✨</span> 特徴グリッド
          </div>
        )}
        {blockType === "testimonial" && (
          <p className="truncate italic">
            &ldquo;{(block.props.quote as string)?.slice(0, 50)}&rdquo;
          </p>
        )}
        {blockType === "faq" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>❓</span> FAQ（{((block.props.items as unknown[]) || []).length}件）
          </div>
        )}
        {blockType === "cta" && (
          <div className="text-center">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm text-indigo-700">
              {(block.props.text as string) || "CTAボタン"}
            </span>
          </div>
        )}
        {blockType === "divider" && (
          <hr className="border-gray-200" />
        )}
        {blockType === "collection_grid" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🗂️</span> 商品グリッド（{(block.props.columns as number) || 3}列）
          </div>
        )}
        {blockType === "collection_filter_bar" && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🔍</span> フィルターバー
          </div>
        )}
      </div>
    </div>
  );
}
