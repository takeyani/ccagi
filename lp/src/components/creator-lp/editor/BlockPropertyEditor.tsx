"use client";

import { useState } from "react";
import type { LPBlock, CollectionBlock } from "@/lib/types";

type Props = {
  block: LPBlock | CollectionBlock;
  onUpdate: (props: Record<string, unknown>) => void;
};

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

type ListItem = Record<string, string>;

function ListEditor({
  label,
  items,
  fields,
  onChange,
}: {
  label: string;
  items: ListItem[];
  fields: { key: string; label: string }[];
  onChange: (items: ListItem[]) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-600">
        {label}
      </label>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">#{i + 1}</span>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-xs text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
          {fields.map((field) => (
            <div key={field.key} className="mb-1.5">
              <label className="mb-0.5 block text-xs text-gray-500">
                {field.label}
              </label>
              <input
                type="text"
                value={item[field.key] || ""}
                onChange={(e) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], [field.key]: e.target.value };
                  onChange(updated);
                }}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={() => {
          const newItem: ListItem = {};
          fields.forEach((f) => (newItem[f.key] = ""));
          onChange([...items, newItem]);
        }}
        className="w-full rounded-lg border border-dashed py-1.5 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
      >
        + 追加
      </button>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/creator/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch {
      alert("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="画像URL"
        className="mb-1 w-full rounded-lg border px-3 py-2 text-sm"
      />
      <label className="inline-block cursor-pointer rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
        {uploading ? "アップロード中..." : "ファイルを選択"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}

export function BlockPropertyEditor({ block, onUpdate }: Props) {
  const p = block.props;
  const set = (key: string, value: unknown) => onUpdate({ [key]: value });

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <SelectInput
            label="背景タイプ"
            value={(p.bg_type as string) || "gradient"}
            options={[
              { value: "gradient", label: "グラデーション" },
              { value: "image", label: "画像" },
            ]}
            onChange={(v) => set("bg_type", v)}
          />
          {(p.bg_type as string) === "image" ? (
            <ImageUpload
              label="背景画像URL"
              value={(p.bg_image_url as string) || ""}
              onChange={(v) => set("bg_image_url", v)}
            />
          ) : (
            <>
              <ColorInput
                label="グラデーション開始色"
                value={(p.gradient_from as string) || "#6366f1"}
                onChange={(v) => set("gradient_from", v)}
              />
              <ColorInput
                label="グラデーション終了色"
                value={(p.gradient_to as string) || "#8b5cf6"}
                onChange={(v) => set("gradient_to", v)}
              />
            </>
          )}
          <TextInput
            label="タイトル"
            value={(p.title as string) || ""}
            onChange={(v) => set("title", v)}
          />
          <TextInput
            label="サブタイトル"
            value={(p.subtitle as string) || ""}
            onChange={(v) => set("subtitle", v)}
          />
          <TextInput
            label="CTAテキスト"
            value={(p.cta_text as string) || ""}
            onChange={(v) => set("cta_text", v)}
          />
        </div>
      );

    case "product_info":
      return (
        <div className="space-y-3">
          <CheckboxInput
            label="画像を表示"
            checked={p.show_image !== false}
            onChange={(v) => set("show_image", v)}
          />
          <CheckboxInput
            label="説明を表示"
            checked={p.show_description !== false}
            onChange={(v) => set("show_description", v)}
          />
          <CheckboxInput
            label="タグを表示"
            checked={p.show_tags !== false}
            onChange={(v) => set("show_tags", v)}
          />
          <CheckboxInput
            label="認証バッジを表示"
            checked={p.show_badge !== false}
            onChange={(v) => set("show_badge", v)}
          />
        </div>
      );

    case "lot_details":
      return (
        <div className="space-y-3">
          <CheckboxInput
            label="価格を表示"
            checked={p.show_price !== false}
            onChange={(v) => set("show_price", v)}
          />
          <CheckboxInput
            label="在庫数を表示"
            checked={p.show_stock !== false}
            onChange={(v) => set("show_stock", v)}
          />
          <CheckboxInput
            label="賞味期限を表示"
            checked={p.show_expiry !== false}
            onChange={(v) => set("show_expiry", v)}
          />
          <CheckboxInput
            label="購入ボタンを表示"
            checked={p.show_purchase_button !== false}
            onChange={(v) => set("show_purchase_button", v)}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <ImageUpload
            label="画像URL"
            value={(p.image_url as string) || ""}
            onChange={(v) => set("image_url", v)}
          />
          <TextInput
            label="代替テキスト"
            value={(p.alt_text as string) || ""}
            onChange={(v) => set("alt_text", v)}
          />
          <TextInput
            label="キャプション"
            value={(p.caption as string) || ""}
            onChange={(v) => set("caption", v)}
          />
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <TextAreaInput
            label="テキスト内容"
            value={(p.content as string) || ""}
            onChange={(v) => set("content", v)}
          />
          <SelectInput
            label="配置"
            value={(p.alignment as string) || "left"}
            options={[
              { value: "left", label: "左揃え" },
              { value: "center", label: "中央揃え" },
              { value: "right", label: "右揃え" },
            ]}
            onChange={(v) => set("alignment", v)}
          />
        </div>
      );

    case "features":
      return (
        <div className="space-y-4">
          <TextInput
            label="見出し"
            value={(p.heading as string) || ""}
            onChange={(v) => set("heading", v)}
          />
          <NumberInput
            label="カラム数"
            value={(p.columns as number) || 3}
            min={2}
            max={4}
            onChange={(v) => set("columns", v)}
          />
          <ListEditor
            label="特徴項目"
            items={(p.items as ListItem[]) || []}
            fields={[
              { key: "icon", label: "アイコン" },
              { key: "title", label: "タイトル" },
              { key: "description", label: "説明" },
            ]}
            onChange={(v) => set("items", v)}
          />
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-4">
          <TextAreaInput
            label="引用文"
            value={(p.quote as string) || ""}
            onChange={(v) => set("quote", v)}
          />
          <TextInput
            label="名前"
            value={(p.author_name as string) || ""}
            onChange={(v) => set("author_name", v)}
          />
          <TextInput
            label="肩書き"
            value={(p.author_title as string) || ""}
            onChange={(v) => set("author_title", v)}
          />
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4">
          <TextInput
            label="見出し"
            value={(p.heading as string) || ""}
            onChange={(v) => set("heading", v)}
          />
          <ListEditor
            label="質問と回答"
            items={(p.items as ListItem[]) || []}
            fields={[
              { key: "question", label: "質問" },
              { key: "answer", label: "回答" },
            ]}
            onChange={(v) => set("items", v)}
          />
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4">
          <TextInput
            label="ボタンテキスト"
            value={(p.text as string) || ""}
            onChange={(v) => set("text", v)}
          />
          <TextInput
            label="スクロール先ID"
            value={(p.scroll_to as string) || "lot_details"}
            onChange={(v) => set("scroll_to", v)}
          />
          <SelectInput
            label="スタイル"
            value={(p.style as string) || "primary"}
            options={[
              { value: "primary", label: "プライマリ" },
              { value: "outline", label: "アウトライン" },
            ]}
            onChange={(v) => set("style", v)}
          />
        </div>
      );

    case "divider":
      return (
        <div className="space-y-4">
          <SelectInput
            label="スタイル"
            value={(p.style as string) || "line"}
            options={[
              { value: "line", label: "線" },
              { value: "dots", label: "ドット" },
              { value: "space", label: "スペース" },
            ]}
            onChange={(v) => set("style", v)}
          />
          <SelectInput
            label="間隔"
            value={(p.spacing as string) || "md"}
            options={[
              { value: "sm", label: "小" },
              { value: "md", label: "中" },
              { value: "lg", label: "大" },
            ]}
            onChange={(v) => set("spacing", v)}
          />
        </div>
      );

    case "collection_grid":
      return (
        <div className="space-y-4">
          <NumberInput
            label="カラム数"
            value={(p.columns as number) || 3}
            min={2}
            max={4}
            onChange={(v) => set("columns", v)}
          />
          <CheckboxInput
            label="価格を表示"
            checked={p.show_price !== false}
            onChange={(v) => set("show_price", v)}
          />
          <CheckboxInput
            label="メーカーを表示"
            checked={p.show_partner !== false}
            onChange={(v) => set("show_partner", v)}
          />
          <CheckboxInput
            label="タグを表示"
            checked={p.show_tags !== false}
            onChange={(v) => set("show_tags", v)}
          />
          <SelectInput
            label="カードスタイル"
            value={(p.card_style as string) || "card"}
            options={[
              { value: "card", label: "カード" },
              { value: "compact", label: "コンパクト" },
            ]}
            onChange={(v) => set("card_style", v)}
          />
          <SelectInput
            label="並び順"
            value={(p.sort_by as string) || "name"}
            options={[
              { value: "name", label: "名前順" },
              { value: "price_asc", label: "価格（安い順）" },
              { value: "price_desc", label: "価格（高い順）" },
              { value: "newest", label: "新着順" },
            ]}
            onChange={(v) => set("sort_by", v)}
          />
          <NumberInput
            label="最大表示数（0=無制限）"
            value={(p.max_items as number) || 0}
            min={0}
            onChange={(v) => set("max_items", v)}
          />
        </div>
      );

    case "collection_filter_bar":
      return (
        <div className="space-y-3">
          <CheckboxInput
            label="タグフィルターを表示"
            checked={p.show_tag_filter !== false}
            onChange={(v) => set("show_tag_filter", v)}
          />
          <CheckboxInput
            label="価格フィルターを表示"
            checked={p.show_price_filter !== false}
            onChange={(v) => set("show_price_filter", v)}
          />
          <CheckboxInput
            label="検索バーを表示"
            checked={p.show_search !== false}
            onChange={(v) => set("show_search", v)}
          />
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-400">
          このブロックの設定はありません
        </p>
      );
  }
}
