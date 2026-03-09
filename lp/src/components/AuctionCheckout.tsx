"use client";

import { useState } from "react";

type Props = {
  auctionId: string;
  winningAmount: number;
  buyerEmail?: string;
};

export default function AuctionCheckout({ auctionId, winningAmount, buyerEmail }: Props) {
  const [email, setEmail] = useState(buyerEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auctions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm text-green-700">落札金額</p>
        <p className="text-3xl font-bold text-green-800">
          &yen;{winningAmount.toLocaleString("ja-JP")}
        </p>
      </div>

      <p className="text-sm text-gray-600">
        落札者ご本人であることを確認するため、入札時に使用したメールアドレスを入力してください。
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="入札時のメールアドレス"
          disabled={loading}
          readOnly={!!buyerEmail}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "処理中..." : "決済に進む"}
      </button>
    </div>
  );
}
