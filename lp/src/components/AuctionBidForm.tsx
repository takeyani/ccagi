"use client";

import { useState } from "react";

type BuyerAuth = {
  buyerId: string;
  displayName: string;
  email: string;
  agentResultId?: string;
};

type Props = {
  auctionId: string;
  currentPrice: number;
  minBidIncrement: number;
  buyNowPrice: number | null;
  buyerAuth?: BuyerAuth;
};

export default function AuctionBidForm({
  auctionId,
  currentPrice,
  minBidIncrement,
  buyNowPrice,
  buyerAuth,
}: Props) {
  const [name, setName] = useState(buyerAuth?.displayName ?? "");
  const [email, setEmail] = useState(buyerAuth?.email ?? "");
  const [amount, setAmount] = useState(currentPrice + minBidIncrement);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const minAmount = currentPrice + minBidIncrement;

  async function handleBid(isBuyNow: boolean) {
    if (!name.trim() || !email.trim()) {
      setMessage({ type: "error", text: "名前とメールアドレスを入力してください" });
      return;
    }

    if (!isBuyNow && amount < minAmount) {
      setMessage({ type: "error", text: `入札金額は¥${minAmount.toLocaleString("ja-JP")}以上にしてください` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          bidder_name: name.trim(),
          bidder_email: email.trim(),
          amount: isBuyNow ? 0 : amount,
          is_buy_now: isBuyNow,
          ...(buyerAuth ? {
            buyer_id: buyerAuth.buyerId,
            agent_result_id: buyerAuth.agentResultId ?? null,
          } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.error ?? "入札に失敗しました" });
        return;
      }

      const resultAmount = (data.amount as number).toLocaleString("ja-JP");
      if (data.status === "落札済み") {
        setMessage({ type: "success", text: `¥${resultAmount}で落札しました！ページをリロードして決済に進んでください。` });
      } else {
        setMessage({ type: "success", text: `¥${resultAmount}で入札しました！` });
      }

      // リロードで最新状態を表示
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {buyerAuth && (
        <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
          ログイン中のアカウントで入札します
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="山田太郎"
          disabled={loading}
          readOnly={!!buyerAuth}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="taro@example.com"
          disabled={loading}
          readOnly={!!buyerAuth}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          入札金額 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-gray-500">&yen;</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={minAmount}
            step={minBidIncrement}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          最低入札額: &yen;{minAmount.toLocaleString("ja-JP")}（現在価格 + &yen;{minBidIncrement.toLocaleString("ja-JP")}）
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={() => handleBid(false)}
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "処理中..." : "入札する"}
      </button>

      {buyNowPrice && (
        <button
          onClick={() => handleBid(true)}
          disabled={loading}
          className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "処理中..."
            : `即決で購入する（¥${buyNowPrice.toLocaleString("ja-JP")}）`}
        </button>
      )}
    </div>
  );
}
