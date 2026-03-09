"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/buyer/actions";

type Props = {
  resultId: string;
  lotPrice: number;
  lotStock: number;
};

export function InquiryForm({ resultId, lotPrice, lotStock }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 text-sm font-medium"
      >
        注文する
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await submitInquiry(resultId, formData);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3 w-full">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          希望価格
        </label>
        <input
          type="number"
          name="buyer_price"
          placeholder={`¥${lotPrice.toLocaleString()}`}
          min={0}
          className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          希望数量
        </label>
        <input
          type="number"
          name="buyer_quantity"
          placeholder={`在庫: ${lotStock}`}
          min={1}
          className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          メモ
        </label>
        <textarea
          name="buyer_notes"
          rows={2}
          className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="要望など..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "送信中..." : "送信"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
