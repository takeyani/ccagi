"use client";

import { useState } from "react";
import type { LPBlock, CollectionBlock } from "@/lib/types";
import { SortableBlock } from "./SortableBlock";

type Props = {
  blocks: (LPBlock | CollectionBlock)[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onFilesDropped?: (files: File[]) => void;
};

export function EditorCanvas({ blocks, selectedBlockId, onSelect, onRemove, onDuplicate, onMove, onFilesDropped }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const acceptsDrop = !!onFilesDropped;

  const dragHandlers = acceptsDrop
    ? {
        onDragOver: (e: React.DragEvent) => {
          if (Array.from(e.dataTransfer.items).some((it) => it.kind === "file")) {
            e.preventDefault();
            setDragOver(true);
          }
        },
        onDragLeave: (e: React.DragEvent) => {
          // 子要素 into/out で発火するのを抑える
          if (e.currentTarget === e.target) setDragOver(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) onFilesDropped?.(files);
        },
      }
    : {};

  return (
    <div className="relative" {...dragHandlers}>
      {blocks.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
          左側のパレットからブロックを追加、または画像/動画をここにドラッグ&ドロップ
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-2">
          {blocks.map((block, index) => (
            <SortableBlock
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              onSelect={() => onSelect(block.id)}
              onRemove={() => onRemove(block.id)}
              onDuplicate={onDuplicate ? () => onDuplicate(block.id) : undefined}
              onMoveUp={onMove && index > 0 ? () => onMove(block.id, "up") : undefined}
              onMoveDown={onMove && index < blocks.length - 1 ? () => onMove(block.id, "down") : undefined}
            />
          ))}
        </div>
      )}

      {dragOver && acceptsDrop && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl border-4 border-dashed border-orange-500 bg-orange-50/70">
          <div className="rounded-full bg-white px-6 py-3 shadow-lg">
            <p className="text-lg font-bold text-orange-600">
              📥 ここにドロップしてブロックを追加
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
