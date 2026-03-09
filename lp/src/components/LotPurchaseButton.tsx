"use client";

import { useState } from "react";

type Props = {
  lotId: string;
  disabled: boolean;
  statusLabel: string;
};

export default function LotPurchaseButton({ lotId, disabled, statusLabel }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const ref = localStorage.getItem("affiliate_ref") || undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lot_id: lotId, ref }),
      });
      const data = await res.json();
      if (data.url) {
        // In embed (iframe), open Stripe checkout in a new tab to avoid iframe restrictions
        if (window.self !== window.top) {
          window.open(data.url, "_blank");
          setLoading(false);
        } else {
          window.location.href = data.url;
        }
      } else {
        alert(data.error || "エラーが発生しました。");
        setLoading(false);
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="mt-10 text-center">
        <button
          disabled
          className="w-full rounded-full bg-gray-400 px-8 py-4 text-lg font-bold text-white cursor-not-allowed"
        >
          {statusLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 text-center">
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "処理中..." : "今すぐ購入する"}
      </button>
      <p className="mt-4 text-xs text-gray-400">
        Stripeによる安全な決済
      </p>
    </div>
  );
}
