"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Character } from "@/lib/types";

interface Props {
  character?: Character;
}

export default function CharacterForm({ character }: Props) {
  const router = useRouter();
  const isEdit = !!character;

  const [name, setName] = useState(character?.name || "");
  const [appearance, setAppearance] = useState(
    character?.appearance_description || ""
  );
  const [visualPrompt, setVisualPrompt] = useState(
    character?.visual_prompt || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("ログインが必要です");
      setLoading(false);
      return;
    }

    const payload = {
      name,
      appearance_description: appearance,
      visual_prompt: visualPrompt,
      user_id: user.id,
    };

    if (isEdit && character) {
      const { error: updateErr } = await supabase
        .from("characters")
        .update(payload)
        .eq("id", character.id);
      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase
        .from("characters")
        .insert(payload);
      if (insertErr) {
        setError(insertErr.message);
        setLoading(false);
        return;
      }
    }

    router.push("/characters");
    router.refresh();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `characters/${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("manga-images")
      .upload(path, file);

    if (uploadErr) {
      setError(uploadErr.message);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("manga-images")
      .getPublicUrl(path);

    if (isEdit && character) {
      await supabase
        .from("characters")
        .update({
          reference_images: [...character.reference_images, publicUrl.publicUrl],
        })
        .eq("id", character.id);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          名前
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          外見の説明
        </label>
        <textarea
          value={appearance}
          onChange={(e) => setAppearance(e.target.value)}
          rows={4}
          placeholder="髪型、服装、体型などの詳細を記述..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          画像生成用プロンプト
        </label>
        <textarea
          value={visualPrompt}
          onChange={(e) => setVisualPrompt(e.target.value)}
          rows={3}
          placeholder="画像生成AIに渡す英語のプロンプト..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          参考画像
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm"
        />
        {character?.reference_images && character.reference_images.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {character.reference_images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`参考画像 ${i + 1}`}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "保存中..." : isEdit ? "更新" : "作成"}
      </button>
    </form>
  );
}
