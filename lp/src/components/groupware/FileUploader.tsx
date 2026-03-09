"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FileUploader({ partnerId }: { partnerId?: string }) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (partnerId) formData.append("partner_id", partnerId);

    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("アップロードに失敗しました");
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer text-sm font-medium">
      {uploading ? "アップロード中..." : "ファイルをアップロード"}
      <input
        type="file"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </label>
  );
}
