"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  lotId?: string;
  partnerId: string;
};

export function NewQuestionForm({ productId, lotId, partnerId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          lot_id: lotId || null,
          partner_id: partnerId,
          questioner_name: name,
          questioner_email: email || null,
          question,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      setName("");
      setEmail("");
      setQuestion("");
      setSuccess(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError("送信中にエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-800">
          質問を送信しました。メーカーからの回答をお待ちください。
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
        >
          続けて質問する
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-600 transition"
      >
        メーカー・生産者に質問する
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
    >
      <h3 className="text-sm font-bold text-gray-900">
        商品・サービスについて質問する
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          質問内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="商品の使用方法、成分、保管方法など何でもお気軽にどうぞ"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス（任意）
          </label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="回答通知を受け取る場合"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-orange-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "送信中..." : "質問を送信"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
