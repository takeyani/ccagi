"use client";

import type { LPBlock, CollectionBlock } from "@/lib/types";
import { BlockPropertyEditor } from "./BlockPropertyEditor";

type Props = {
  block: LPBlock | CollectionBlock | null;
  onUpdate: (props: Record<string, unknown>) => void;
};

export function PropertiesPanel({ block, onUpdate }: Props) {
  if (!block) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        ブロックを選択してプロパティを編集
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
        プロパティ
      </h3>
      <BlockPropertyEditor
        block={block}
        onUpdate={onUpdate}
      />
    </div>
  );
}
