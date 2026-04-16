"use client";

import { useState } from "react";

export function ImageUpload({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/creator/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      } else {
        alert(data.error || "アップロードに失敗しました");
      }
    } catch {
      alert("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="画像URL または下のボタンでアップロード"
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>
      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-xs font-medium text-gray-700 transition">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {uploading ? "アップロード中..." : "画像を選択"}
      </label>
      {url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={url} alt="プレビュー" className="w-20 h-20 object-cover rounded border" />
      )}
    </div>
  );
}
