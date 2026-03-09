"use client";

import { BLOCK_DEFINITIONS, type BlockDefinition } from "@/lib/creator-lp/block-definitions";

type Props = {
  onAdd: (type: string) => void;
  definitions?: { type: string; label: string; icon: string; defaultProps: Record<string, unknown> }[];
};

export function BlockPalette({ onAdd, definitions }: Props) {
  const defs = definitions ?? (BLOCK_DEFINITIONS as BlockDefinition[]);

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase text-gray-500">
        ブロック追加
      </p>
      <div className="space-y-1.5">
        {defs.map((def) => (
          <button
            key={def.type}
            onClick={() => onAdd(def.type)}
            className="flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <span>{def.icon}</span>
            <span>{def.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
