"use client";

import type { LPBlock, CollectionBlock } from "@/lib/types";
import { SortableBlock } from "./SortableBlock";

type Props = {
  blocks: (LPBlock | CollectionBlock)[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
};

export function EditorCanvas({ blocks, selectedBlockId, onSelect, onRemove, onDuplicate, onMove }: Props) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
        左側のパレットからブロックを追加してください
      </div>
    );
  }

  return (
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
  );
}
