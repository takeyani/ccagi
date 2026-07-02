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
        className="w-full rounded-lg border border-dashed py-1.5 text-sm text-gray-500 hover:border-orange-300 hover:text-orange-600"
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

type MediaKind = "image" | "video" | "both";

function detectMediaType(url: string): "image" | "video" | "external" {
  if (!url) return "image";
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return "external";
  if (/\.(mp4|webm|mov|ogg|ogv)(\?|$)/i.test(url)) return "video";
  return "image";
}

function MediaUpload({
  label,
  value,
  onChange,
  accept = "image",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept?: MediaKind;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const acceptAttr =
    accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";
  const acceptLabel =
    accept === "image"
      ? "画像"
      : accept === "video"
      ? "動画"
      : "画像 / 動画";
  const sizeLabel = accept === "video" ? "動画 100MB / 画像 10MB まで" : accept === "image" ? "10MBまで" : "動画 100MB / 画像 10MB まで";

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/creator/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "アップロードに失敗しました");
        return;
      }
      onChange(data.url);
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const kind = detectMediaType(value);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>

      {/* プレビュー */}
      {value && (
        <div className="mb-2 rounded-lg border bg-gray-50 p-2">
          {kind === "image" ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={value}
              alt=""
              className="mx-auto h-32 w-auto rounded object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : kind === "video" ? (
            <video
              src={value}
              muted
              playsInline
              className="mx-auto h-32 w-auto rounded"
              controls
            />
          ) : (
            <div className="text-center text-xs text-gray-500 py-6">
              🎬 外部埋め込み動画 ({value.length > 40 ? value.slice(0, 40) + "…" : value})
            </div>
          )}
          <div className="mt-2 text-right">
            <button
              onClick={() => onChange("")}
              className="text-xs text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
        </div>
      )}

      {/* URL入力 */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={accept === "video" ? "動画URL / YouTube / Vimeo" : "URL または貼り付け"}
        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
      />

      {/* ドラッグ&ドロップ + ファイル選択 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-3 text-center transition ${
          dragOver ? "border-orange-400 bg-orange-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <label className="inline-block cursor-pointer rounded border bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
          {uploading ? "アップロード中..." : `${acceptLabel}を選択`}
          <input
            type="file"
            accept={acceptAttr}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <p className="mt-1 text-[10px] text-gray-500">
          またはここにドラッグ&ドロップ ({sizeLabel})
        </p>
      </div>

      {hint && <p className="mt-1 text-[10px] text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** 後方互換: 既存 call site 用エイリアス */
function ImageUpload(props: { label: string; value: string; onChange: (v: string) => void }) {
  return <MediaUpload {...props} accept="image" />;
}

type GalleryItem = {
  image_url?: string;
  alt_text?: string;
  caption?: string;
  link_url?: string;
};

function GalleryItemsEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const update = (i: number, patch: Partial<GalleryItem>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () =>
    onChange([...items, { image_url: "", alt_text: "", caption: "", link_url: "" }]);

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-600">
        画像アイテム
      </label>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-xs text-gray-500 disabled:opacity-30 hover:text-gray-700"
                title="上へ"
              >
                &uarr;
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-xs text-gray-500 disabled:opacity-30 hover:text-gray-700"
                title="下へ"
              >
                &darr;
              </button>
              <button
                onClick={() => remove(i)}
                className="ml-1 text-xs text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <MediaUpload
              label="画像"
              accept="image"
              value={item.image_url || ""}
              onChange={(v) => update(i, { image_url: v })}
            />
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">
                代替テキスト
              </label>
              <input
                type="text"
                value={item.alt_text || ""}
                onChange={(e) => update(i, { alt_text: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">
                キャプション
              </label>
              <input
                type="text"
                value={item.caption || ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs text-gray-500">
                リンク先URL（任意）
              </label>
              <input
                type="text"
                value={item.link_url || ""}
                onChange={(e) => update(i, { link_url: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full rounded-lg border border-dashed py-1.5 text-sm text-gray-500 hover:border-orange-300 hover:text-orange-600"
      >
        + 画像を追加
      </button>
    </div>
  );
}

export function BlockPropertyEditor({ block, onUpdate }: Props) {
  const p = block.props;
  const set = (key: string, value: unknown) => onUpdate({ [key]: value });

  switch (block.type) {
    case "hero": {
      const bgType = (p.bg_type as string) || "gradient";
      return (
        <div className="space-y-4">
          <SelectInput
            label="背景タイプ"
            value={bgType}
            options={[
              { value: "gradient", label: "グラデーション" },
              { value: "image", label: "画像" },
              { value: "video", label: "動画" },
            ]}
            onChange={(v) => set("bg_type", v)}
          />
          {bgType === "image" && (
            <MediaUpload
              label="背景画像"
              accept="image"
              value={(p.bg_image_url as string) || ""}
              onChange={(v) => set("bg_image_url", v)}
            />
          )}
          {bgType === "video" && (
            <>
              <MediaUpload
                label="背景動画"
                accept="video"
                value={(p.bg_video_url as string) || ""}
                onChange={(v) => set("bg_video_url", v)}
                hint="※ 自動再生・無音・ループで再生されます（背景装飾用）"
              />
              <MediaUpload
                label="動画のポスター画像（読み込み前に表示）"
                accept="image"
                value={(p.bg_video_poster as string) || ""}
                onChange={(v) => set("bg_video_poster", v)}
              />
            </>
          )}
          {bgType === "gradient" && (
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
          {(bgType === "image" || bgType === "video") && (
            <NumberInput
              label="オーバーレイの濃さ (0〜1)"
              value={typeof p.overlay_opacity === "number" ? (p.overlay_opacity as number) : 0.4}
              min={0}
              max={1}
              onChange={(v) => set("overlay_opacity", v)}
            />
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
    }

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
          <MediaUpload
            label="画像"
            accept="image"
            value={(p.image_url as string) || ""}
            onChange={(v) => set("image_url", v)}
          />
          <TextInput
            label="代替テキスト（アクセシビリティ用）"
            value={(p.alt_text as string) || ""}
            onChange={(v) => set("alt_text", v)}
          />
          <TextInput
            label="キャプション"
            value={(p.caption as string) || ""}
            onChange={(v) => set("caption", v)}
          />
          <TextInput
            label="クリック時のリンク先URL（空欄なら遷移なし）"
            value={(p.link_url as string) || ""}
            onChange={(v) => set("link_url", v)}
          />
          <SelectInput
            label="最大幅"
            value={(p.max_width as string) || "3xl"}
            options={[
              { value: "sm", label: "極小" },
              { value: "md", label: "小" },
              { value: "lg", label: "中" },
              { value: "xl", label: "大" },
              { value: "2xl", label: "特大" },
              { value: "3xl", label: "既定（3xl）" },
              { value: "4xl", label: "超大" },
              { value: "full", label: "画面いっぱい" },
            ]}
            onChange={(v) => set("max_width", v)}
          />
          <SelectInput
            label="角丸"
            value={(p.rounded as string) || "xl"}
            options={[
              { value: "none", label: "なし" },
              { value: "sm", label: "小" },
              { value: "md", label: "中" },
              { value: "lg", label: "大" },
              { value: "xl", label: "既定（xl）" },
              { value: "2xl", label: "特大" },
              { value: "full", label: "円形" },
            ]}
            onChange={(v) => set("rounded", v)}
          />
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-4">
          <TextInput
            label="見出し（任意）"
            value={(p.heading as string) || ""}
            onChange={(v) => set("heading", v)}
          />
          <SelectInput
            label="カラム数"
            value={String((p.columns as number) || 3)}
            options={[
              { value: "2", label: "2列" },
              { value: "3", label: "3列" },
              { value: "4", label: "4列" },
            ]}
            onChange={(v) => set("columns", Number(v))}
          />
          <SelectInput
            label="画像間の余白"
            value={(p.gap as string) || "md"}
            options={[
              { value: "sm", label: "狭い" },
              { value: "md", label: "標準" },
              { value: "lg", label: "広い" },
            ]}
            onChange={(v) => set("gap", v)}
          />
          <GalleryItemsEditor
            items={(p.items as GalleryItem[] | undefined) ?? []}
            onChange={(v) => set("items", v)}
          />
        </div>
      );

    case "video":
      return (
        <div className="space-y-4">
          <MediaUpload
            label="動画"
            accept="video"
            value={(p.video_url as string) || ""}
            onChange={(v) => set("video_url", v)}
            hint="MP4/WebM ファイルの他、YouTube・Vimeo のURLも貼り付け可能"
          />
          <MediaUpload
            label="ポスター画像（動画読み込み前に表示）"
            accept="image"
            value={(p.poster as string) || ""}
            onChange={(v) => set("poster", v)}
          />
          <TextInput
            label="キャプション"
            value={(p.caption as string) || ""}
            onChange={(v) => set("caption", v)}
          />
          <SelectInput
            label="最大幅"
            value={(p.max_width as string) || "3xl"}
            options={[
              { value: "sm", label: "極小" },
              { value: "md", label: "小" },
              { value: "lg", label: "中" },
              { value: "xl", label: "大" },
              { value: "2xl", label: "特大" },
              { value: "3xl", label: "既定（3xl）" },
              { value: "4xl", label: "超大" },
              { value: "full", label: "画面いっぱい" },
            ]}
            onChange={(v) => set("max_width", v)}
          />
          <CheckboxInput
            label="コントロールを表示"
            checked={p.controls !== false}
            onChange={(v) => set("controls", v)}
          />
          <CheckboxInput
            label="自動再生"
            checked={p.autoplay === true}
            onChange={(v) => set("autoplay", v)}
          />
          <CheckboxInput
            label="ループ再生"
            checked={p.loop === true}
            onChange={(v) => set("loop", v)}
          />
          <CheckboxInput
            label="ミュート"
            checked={p.muted !== false}
            onChange={(v) => set("muted", v)}
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
