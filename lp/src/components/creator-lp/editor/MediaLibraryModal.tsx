"use client";

import { useEffect, useState } from "react";

type MediaKind = "image" | "video" | "both";

type MediaItem = {
  url: string;
  name: string;
  type: "image" | "video";
  created_at: string;
  size: number;
};

type Props = {
  accept: MediaKind;
  onSelect: (url: string) => void;
  onClose: () => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibraryModal({ accept, onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/creator/media/list?kind=${accept}&limit=100`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "取得に失敗しました");
        setItems(data.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accept]);

  const displayed = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-bold">メディアライブラリ</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="閉じる"
          >
            &times;
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 px-5 py-2">
          {accept === "both" && (
            <div className="flex gap-1">
              {(["all", "image", "video"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded px-3 py-1 text-xs ${
                    filter === f
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 border hover:bg-gray-50"
                  }`}
                >
                  {f === "all" ? "すべて" : f === "image" ? "画像" : "動画"}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ファイル名で検索"
            className="ml-auto rounded border px-3 py-1 text-sm"
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="text-center text-sm text-gray-400 py-16">読み込み中...</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600 py-16">{error}</p>
          )}
          {!loading && !error && displayed.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-16">
              {items.length === 0
                ? "まだアップロード済みメディアがありません"
                : "条件に一致するメディアがありません"}
            </p>
          )}
          {!loading && !error && displayed.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayed.map((item) => (
                <button
                  key={item.url}
                  onClick={() => onSelect(item.url)}
                  className="group relative overflow-hidden rounded-lg border bg-gray-50 transition hover:border-orange-400 hover:shadow-md"
                >
                  <div className="aspect-square w-full">
                    {item.type === "image" ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-left text-white opacity-0 transition group-hover:opacity-100">
                    <p className="truncate text-[10px]">{item.name}</p>
                    <p className="text-[9px] opacity-70">{formatSize(item.size)}</p>
                  </div>
                  {item.type === "video" && (
                    <span className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      🎬
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-2 text-xs text-gray-500">
          {!loading && `${displayed.length} 件表示`}
        </div>
      </div>
    </div>
  );
}
