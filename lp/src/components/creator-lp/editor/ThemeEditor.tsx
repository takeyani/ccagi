"use client";

import type { LPTheme } from "@/lib/types";

type Props = {
  theme: LPTheme;
  onChange: (theme: LPTheme) => void;
};

export function ThemeEditor({ theme, onChange }: Props) {
  const set = (key: keyof LPTheme, value: string) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          プライマリカラー
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.primary_color}
            onChange={(e) => set("primary_color", e.target.value)}
            className="h-8 w-8 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={theme.primary_color}
            onChange={(e) => set("primary_color", e.target.value)}
            className="w-24 rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          セカンダリカラー
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.secondary_color}
            onChange={(e) => set("secondary_color", e.target.value)}
            className="h-8 w-8 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={theme.secondary_color}
            onChange={(e) => set("secondary_color", e.target.value)}
            className="w-24 rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          背景色
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.bg_color}
            onChange={(e) => set("bg_color", e.target.value)}
            className="h-8 w-8 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={theme.bg_color}
            onChange={(e) => set("bg_color", e.target.value)}
            className="w-24 rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          フォント
        </label>
        <select
          value={theme.font}
          onChange={(e) => set("font", e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="inherit">デフォルト</option>
          <option value="'Noto Sans JP', sans-serif">Noto Sans JP</option>
          <option value="'Noto Serif JP', serif">Noto Serif JP</option>
          <option value="system-ui, sans-serif">システムフォント</option>
        </select>
      </div>
    </div>
  );
}
