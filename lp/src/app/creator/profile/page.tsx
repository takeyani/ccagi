"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Affiliate } from "@/lib/types";

export default function CreatorProfilePage() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const code = localStorage.getItem("creator_code");
      if (!code) return;

      const { data } = await getSupabase()
        .from("affiliates")
        .select("*")
        .eq("code", code)
        .single();

      if (data) {
        const a = data as Affiliate;
        setAffiliate(a);
        setName(a.name);
        setBio(a.bio || "");
        setAvatarUrl(a.avatar_url || "");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!affiliate) return;
    setSaving(true);
    setMessage("");

    const { error } = await getSupabase()
      .from("affiliates")
      .update({ name, bio, avatar_url: avatarUrl })
      .eq("id", affiliate.id);

    if (error) {
      setMessage("保存に失敗しました");
    } else {
      setMessage("保存しました");
    }
    setSaving(false);
  };

  if (!affiliate) {
    return <p className="text-gray-500">読み込み中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>

      <div className="max-w-lg rounded-2xl bg-white p-6 shadow-sm border">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              表示名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              placeholder="クリエイターとしてのプロフィールを入力..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アバター画像URL
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">コード:</span>{" "}
              <span className="font-mono">{affiliate.code}</span>
            </p>
            <p className="mt-1">
              <span className="font-medium">メール:</span> {affiliate.email}
            </p>
            <p className="mt-1">
              <span className="font-medium">手数料率:</span>{" "}
              {affiliate.commission_rate}%
            </p>
          </div>
        </div>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.includes("失敗") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "プロフィールを保存"}
        </button>
      </div>
    </div>
  );
}
