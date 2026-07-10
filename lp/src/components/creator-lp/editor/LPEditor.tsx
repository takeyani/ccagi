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
import type { LPBlock, LPTheme, CreatorLPDesign } from "@/lib/types";
import { BLOCK_DEFINITIONS } from "@/lib/creator-lp/block-definitions";
import { LP_TEMPLATES, THEME_PRESETS, instantiateTemplate } from "@/lib/creator-lp/template-presets";
import { smartUpload } from "@/lib/creator-lp/upload";
import { BlockPalette } from "./BlockPalette";
import { EditorCanvas } from "./EditorCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { ThemeEditor } from "./ThemeEditor";
import { EditorPreview } from "./EditorPreview";

type Props = {
  design: CreatorLPDesign;
};

const DEFAULT_THEME: LPTheme = {
  primary_color: "#6366f1",
  secondary_color: "#8b5cf6",
  bg_color: "#ffffff",
  font: "inherit",
};

export function LPEditor({ design }: Props) {
  const [blocks, setBlocks] = useState<LPBlock[]>(design.design_config || []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [theme, setTheme] = useState<LPTheme>(design.theme || DEFAULT_THEME);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showTemplates, setShowTemplates] = useState(blocks.length === 0);
  const [dropUploading, setDropUploading] = useState<{ done: number; total: number } | null>(null);
  const [dropError, setDropError] = useState<string>("");

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
    const def = BLOCK_DEFINITIONS.find((b) => b.type === type);
    if (!def) return;
    const newBlock: LPBlock = {
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

  const duplicateBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === id);
        if (index === -1) return prev;
        const original = prev[index];
        const clone: LPBlock = {
          id: nanoid(),
          type: original.type,
          props: JSON.parse(JSON.stringify(original.props)),
        };
        const next = [...prev];
        next.splice(index + 1, 0, clone);
        return next;
      });
      setIsDirty(true);
    },
    []
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === id);
        if (index === -1) return prev;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        return arrayMove(prev, index, targetIndex);
      });
      setIsDirty(true);
    },
    []
  );

  const updateBlockProps = useCallback(
    (id: string, props: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...props } } : b))
      );
      setIsDirty(true);
    },
    []
  );

  const handleFilesDropped = useCallback(async (files: File[]) => {
    setDropError("");
    setDropUploading({ done: 0, total: files.length });
    const newBlocks: LPBlock[] = [];
    let done = 0;
    for (const file of files) {
      try {
        const result = await smartUpload(file);
        const isVideo = result.type === "video" || file.type.startsWith("video/");
        if (isVideo) {
          newBlocks.push({
            id: nanoid(),
            type: "video",
            props: {
              video_url: result.url,
              poster: "",
              caption: "",
              autoplay: false,
              loop: false,
              muted: true,
              controls: true,
              max_width: "3xl",
            },
          });
        } else {
          newBlocks.push({
            id: nanoid(),
            type: "image",
            props: {
              image_url: result.url,
              alt_text: file.name,
              caption: "",
              link_url: "",
              max_width: "3xl",
              rounded: "xl",
            },
          });
        }
      } catch (err) {
        setDropError(err instanceof Error ? err.message : "アップロードに失敗しました");
      }
      done += 1;
      setDropUploading({ done, total: files.length });
    }
    if (newBlocks.length > 0) {
      setBlocks((prev) => [...prev, ...newBlocks]);
      setSelectedBlockId(newBlocks[newBlocks.length - 1].id);
      setIsDirty(true);
    }
    setDropUploading(null);
  }, []);

  const applyTemplate = useCallback((templateId: string) => {
    const template = LP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const { blocks: newBlocks, theme: newTheme } = instantiateTemplate(template);
    setBlocks(newBlocks);
    setTheme(newTheme);
    setSelectedBlockId(null);
    setIsDirty(true);
    setShowTemplates(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const code = typeof window !== "undefined" ? localStorage.getItem("creator_code") : null;
      const email = typeof window !== "undefined" ? localStorage.getItem("creator_email") : null;
      const res = await fetch(`/api/creator/designs/${design.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design_config: blocks, theme, code, email }),
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

  // テンプレート選択画面
  if (showTemplates) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <div className="flex items-center gap-3">
            <a href="/creator/designs" className="text-sm text-orange-600 hover:text-orange-800">&larr; 一覧</a>
            <h1 className="text-lg font-bold">テンプレートを選択</h1>
          </div>
          <button
            onClick={() => setShowTemplates(false)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            テンプレートなしで始める
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm text-gray-500 mb-6">
              テンプレートを選ぶと、定番のブロック構成がすぐに適用されます。あとから自由にカスタマイズできます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LP_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className="text-left bg-white rounded-2xl border shadow-sm p-5 hover:border-orange-400 hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="font-bold text-gray-900">{t.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{t.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.blocks.map((b, i) => (
                      <span key={i} className="inline-block bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">
                        {b.type}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-1">
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.theme.primary_color }} />
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.theme.secondary_color }} />
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.theme.bg_color }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <a href="/creator/designs" className="text-sm text-orange-600 hover:text-orange-800">&larr; 一覧</a>
          <h1 className="text-lg font-bold">LP エディター</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            title="テンプレートから選び直す（現在のブロックは置き換わります）"
          >
            テンプレート
          </button>
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
            className="rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : isDirty ? "保存する" : "保存済み"}
          </button>
        </div>
      </div>

      {/* Theme editor overlay with presets */}
      {showTheme && (
        <div className="border-b bg-gray-50 p-4">
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">テーマプリセット</p>
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setTheme(p.theme); setIsDirty(true); }}
                  className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs hover:border-orange-300 transition"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.theme.primary_color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
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
          <BlockPalette onAdd={addBlock} />
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
                onDuplicate={duplicateBlock}
                onMove={moveBlock}
                onFilesDropped={handleFilesDropped}
              />
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm mb-4">ブロックがまだありません</p>
              <button
                onClick={() => setShowTemplates(true)}
                className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                テンプレートから始める
              </button>
            </div>
          )}
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

    {/* ドロップアップロード進捗トースト */}
    {dropUploading && (
      <div className="fixed bottom-4 right-4 z-50 min-w-[240px] rounded-xl bg-gray-900 px-4 py-3 text-white shadow-2xl">
        <p className="text-sm font-medium">
          アップロード中... {dropUploading.done}/{dropUploading.total}
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-orange-400 transition-all"
            style={{
              width: `${dropUploading.total ? (dropUploading.done / dropUploading.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    )}
    {dropError && !dropUploading && (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-red-500 px-4 py-3 text-white shadow-2xl">
        <span className="text-sm">{dropError}</span>
        <button
          onClick={() => setDropError("")}
          className="rounded p-1 hover:bg-red-600"
          aria-label="閉じる"
        >
          &times;
        </button>
      </div>
    )}
    </>
  );
}
