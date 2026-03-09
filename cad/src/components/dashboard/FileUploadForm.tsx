"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function FileUploadForm({ projectId }: { projectId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setError("");
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("ログインが必要です");
        setUploading(false);
        return;
      }

      const ext = file.name.split(".").pop() ?? "ifc";
      const storagePath = `${user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("cad-files")
        .upload(storagePath, file);

      if (uploadError) {
        setError(`アップロードに失敗しました: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      setProgress(70);

      const { error: dbError } = await supabase.from("cad_files").insert({
        project_id: projectId,
        user_id: user.id,
        file_name: file.name,
        storage_path: storagePath,
        file_size: file.size,
        version: 1,
        notes,
      });

      if (dbError) {
        setError(`ファイル情報の保存に失敗しました: ${dbError.message}`);
        setUploading(false);
        return;
      }

      setProgress(100);
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err) {
      setError(`予期しないエラーが発生しました: ${err}`);
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".ifc")) {
      setFile(droppedFile);
    } else {
      setError("IFCファイルのみアップロードできます");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        {file ? (
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500">
              ここにIFCファイルをドラッグ&ドロップ
            </p>
            <p className="text-sm text-gray-400 mt-1">
              またはクリックしてファイルを選択
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".ifc"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="ファイルに関するメモ（任意）"
        />
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {uploading ? "アップロード中..." : "アップロード"}
      </button>
    </form>
  );
}
