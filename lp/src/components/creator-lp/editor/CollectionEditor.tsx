"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import type { CollectionBlock, LPTheme, CreatorLPCollection } from "@/lib/types";
import { COLLECTION_BLOCK_DEFINITIONS } from "@/lib/creator-lp/collection-block-definitions";
import { BlockPalette } from "./BlockPalette";
import { EditorCanvas } from "./EditorCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { ThemeEditor } from "./ThemeEditor";
import { EditorPreview } from "./EditorPreview";

type Props = {
  collection: CreatorLPCollection;
};

const DEFAULT_THEME: LPTheme = {
  primary_color: "#6366f1",
  secondary_color: "#8b5cf6",
  bg_color: "#ffffff",
  font: "inherit",
};

export function CollectionEditor({ collection }: Props) {
  const [blocks, setBlocks] = useState<CollectionBlock[]>(
    (collection.design_config || []) as CollectionBlock[]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [theme, setTheme] = useState<LPTheme>(
    (collection.theme as LPTheme) || DEFAULT_THEME
  );
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setIsDirty(true);
    }
  }, []);

  const addBlock = useCallback((type: string) => {
    const def = COLLECTION_BLOCK_DEFINITIONS.find((b) => b.type === type);
    if (!def) return;
    const newBlock: CollectionBlock = {
      id: nanoid(),
      type: def.type,
      props: { ...def.defaultProps },
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setIsDirty(true);
  }, []);

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedBlockId === id) setSelectedBlockId(null);
      setIsDirty(true);
    },
    [selectedBlockId]
  );

  const updateBlockProps = useCallback(
    (id: string, props: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, props: { ...b.props, ...props } } : b
        )
      );
      setIsDirty(true);
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/creator/collections/${collection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design_config: blocks, theme }),
      });
      if (res.ok) {
        setIsDirty(false);
      } else {
        alert("保存に失敗しました");
      }
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (showPreview) {
    return (
      <EditorPreview
        blocks={blocks}
        theme={theme}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <a href="/creator/collections" className="text-sm text-indigo-600 hover:text-indigo-800">← 一覧</a>
          <h1 className="text-lg font-bold">コレクションエディター</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTheme(!showTheme)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            テーマ
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            プレビュー
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : isDirty ? "保存する" : "保存済み"}
          </button>
        </div>
      </div>

      {/* Theme editor overlay */}
      {showTheme && (
        <div className="border-b bg-gray-50 p-4">
          <ThemeEditor
            theme={theme}
            onChange={(t) => {
              setTheme(t);
              setIsDirty(true);
            }}
          />
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Palette */}
        <div className="w-[200px] shrink-0 overflow-y-auto border-r bg-gray-50 p-3">
          <BlockPalette onAdd={addBlock} definitions={COLLECTION_BLOCK_DEFINITIONS} />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <EditorCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelect={setSelectedBlockId}
                onRemove={removeBlock}
              />
            </SortableContext>
          </DndContext>
        </div>

        {/* Right: Properties */}
        <div className="w-[320px] shrink-0 overflow-y-auto border-l bg-white p-4">
          <PropertiesPanel
            block={selectedBlock}
            onUpdate={(props) => {
              if (selectedBlock) updateBlockProps(selectedBlock.id, props);
            }}
          />
        </div>
      </div>
    </div>
  );
}
