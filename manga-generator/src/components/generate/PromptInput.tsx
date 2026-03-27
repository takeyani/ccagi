"use client";

import { useState } from "react";

interface Props {
  onSubmit: (text: string) => void;
  loading?: boolean;
}

export default function PromptInput({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ストーリーテキスト
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="漫画にしたいストーリーを入力してください...&#10;&#10;例: 朝の教室。主人公のタロウが遅刻して教室に駆け込む。先生に怒られるが、隣の席のハナコが笑って助けてくれる。放課後、タロウはハナコにお礼を言いに行く。"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "生成中..." : "漫画を生成"}
      </button>
    </form>
  );
}
