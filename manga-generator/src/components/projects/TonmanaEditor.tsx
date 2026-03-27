"use client";

import { useState } from "react";
import type { TonmanaConfig, ArtStyle, Genre, ColorMode, LineStyle } from "@/lib/types";
import {
  ART_STYLE_OPTIONS,
  GENRE_OPTIONS,
  COLOR_MODE_OPTIONS,
  LINE_STYLE_OPTIONS,
} from "@/lib/tonmana/presets";
import { compileTonmana } from "@/lib/tonmana/compiler";

interface Props {
  value: TonmanaConfig;
  onChange: (config: TonmanaConfig) => void;
}

export default function TonmanaEditor({ value, onChange }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  const update = (partial: Partial<TonmanaConfig>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Art Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アートスタイル
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ART_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ art_style: opt.value as ArtStyle })}
              className={`p-3 text-left rounded-lg border text-sm transition-colors ${
                value.art_style === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ジャンル
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {GENRE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ genre: opt.value as Genre })}
              className={`p-2 rounded-lg border text-sm ${
                value.genre === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カラーモード
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ color_mode: opt.value as ColorMode })}
              className={`p-2 rounded-lg border text-sm ${
                value.color_mode === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          線のスタイル
        </label>
        <div className="grid grid-cols-5 gap-2">
          {LINE_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ line_style: opt.value as LineStyle })}
              className={`p-2 rounded-lg border text-sm ${
                value.line_style === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カラーパレット
        </label>
        <div className="flex gap-2 items-center flex-wrap">
          {value.color_palette.map((color, i) => (
            <div key={i} className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const newPalette = [...value.color_palette];
                  newPalette[i] = e.target.value;
                  update({ color_palette: newPalette });
                }}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <button
                type="button"
                onClick={() =>
                  update({
                    color_palette: value.color_palette.filter((_, j) => j !== i),
                  })
                }
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update({ color_palette: [...value.color_palette, "#000000"] })
            }
            className="w-10 h-10 rounded border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 flex items-center justify-center text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カスタムプロンプト（自由記述）
        </label>
        <textarea
          value={value.custom_prompt}
          onChange={(e) => update({ custom_prompt: e.target.value })}
          rows={3}
          placeholder="追加のスタイル指定を自由に記述..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Preview */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showPreview ? "プロンプトプレビューを隠す" : "プロンプトプレビューを表示"}
        </button>
        {showPreview && (
          <div className="mt-2 p-3 bg-gray-100 rounded text-sm text-gray-700 font-mono whitespace-pre-wrap">
            {compileTonmana(value)}
          </div>
        )}
      </div>
    </div>
  );
}
