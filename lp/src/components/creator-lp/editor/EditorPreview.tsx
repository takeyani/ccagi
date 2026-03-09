"use client";

import type { LPBlock, LPTheme, CollectionBlock } from "@/lib/types";

type Props = {
  blocks: (LPBlock | CollectionBlock)[];
  theme: LPTheme;
  onClose: () => void;
};

export function EditorPreview({ blocks, theme, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-semibold text-gray-600">
          プレビューモード
        </span>
        <button
          onClick={onClose}
          className="rounded-lg border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          エディターに戻る
        </button>
      </div>

      {/* Preview content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: theme.bg_color || "#ffffff",
          fontFamily: theme.font || "inherit",
        }}
      >
        {blocks.map((block) => {
          const blockType = block.type as string;
          return (
            <div key={block.id} className="text-sm text-gray-500">
              <div className="mx-auto max-w-3xl px-6 py-4">
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-gray-400">
                  {blockType === "hero" && (
                    <div
                      className="rounded-lg p-8 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${(block.props.gradient_from as string) || theme.primary_color}, ${(block.props.gradient_to as string) || theme.secondary_color})`,
                      }}
                    >
                      <h2 className="text-2xl font-bold">
                        {(block.props.title as string) || "ヒーロー"}
                      </h2>
                      <p className="mt-2 opacity-80">
                        {(block.props.subtitle as string) || ""}
                      </p>
                    </div>
                  )}
                  {blockType === "product_info" && "📦 商品情報"}
                  {blockType === "lot_details" && "🏷️ ロット詳細 + 購入ボタン"}
                  {blockType === "image" && (
                    (block.props.image_url as string) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={block.props.image_url as string}
                        alt=""
                        className="max-h-48 mx-auto rounded"
                      />
                    ) : "🖼️ 画像"
                  )}
                  {blockType === "text" && (
                    <p className="text-gray-700 whitespace-pre-wrap text-left">
                      {(block.props.content as string) || "テキスト"}
                    </p>
                  )}
                  {blockType === "features" && "✨ 特徴グリッド"}
                  {blockType === "testimonial" && (
                    <p className="italic">&ldquo;{(block.props.quote as string) || ""}&rdquo;</p>
                  )}
                  {blockType === "faq" && "❓ FAQ"}
                  {blockType === "cta" && (
                    <button
                      className="rounded-full px-6 py-2 text-white"
                      style={{ backgroundColor: theme.primary_color || "#6366f1" }}
                    >
                      {(block.props.text as string) || "CTA"}
                    </button>
                  )}
                  {blockType === "divider" && <hr />}
                  {blockType === "collection_grid" && "🗂️ 商品グリッド"}
                  {blockType === "collection_filter_bar" && "🔍 フィルターバー"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
