"use client";

import type { LPBlock, CollectionBlock } from "@/lib/types";
import { SortableBlock } from "./SortableBlock";

type Props = {
  blocks: (LPBlock | CollectionBlock)[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export function EditorCanvas({ blocks, selectedBlockId, onSelect, onRemove }: Props) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
        左側のパレットからブロックを追加してください
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      {blocks.map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onSelect={() => onSelect(block.id)}
          onRemove={() => onRemove(block.id)}
        />
      ))}
    </div>
  );
}
