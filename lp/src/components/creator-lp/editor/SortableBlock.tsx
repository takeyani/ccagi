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
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function SortableBlock({ block, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown }: Props) {
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
          ? "border-orange-500 ring-2 ring-orange-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Drag handle + label */}
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

      {/* Action buttons */}
      <div className="absolute -top-3 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        {onMoveUp && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
            title="上へ移動"
          >
            &uarr;
          </button>
        )}
        {onMoveDown && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
            title="下へ移動"
          >
            &darr;
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 hover:bg-blue-200"
            title="複製"
          >
            複製
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-200"
        >
          削除
        </button>
      </div>

      {/* Block preview */}
      <div className="mt-2 text-sm text-gray-500">
        {blockType === "hero" && (
          <div className="rounded bg-gradient-to-r from-orange-500 to-purple-500 p-4 text-center text-white">
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
          (block.props.image_url as string) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={block.props.image_url as string}
              alt={(block.props.alt_text as string) || ""}
              className="mx-auto h-24 w-auto rounded object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🖼️</span> {(block.props.alt_text as string) || "画像（未設定）"}
            </div>
          )
        )}
        {blockType === "video" && (
          (block.props.video_url as string) ? (
            /^(https?:)?\/\/(www\.)?(youtube|youtu\.be|vimeo)/i.test(block.props.video_url as string) ? (
              <div className="flex items-center gap-2 text-gray-600">
                <span>🎬</span> 埋め込み動画
                <span className="truncate text-xs text-gray-400">
                  {(block.props.video_url as string).slice(0, 40)}
                </span>
              </div>
            ) : (
              <video
                src={block.props.video_url as string}
                muted
                playsInline
                className="mx-auto h-24 w-auto rounded"
              />
            )
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🎬</span> 動画（未設定）
            </div>
          )
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
            <span className="inline-block rounded-full bg-orange-100/60 px-4 py-1 text-sm text-orange-700">
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
