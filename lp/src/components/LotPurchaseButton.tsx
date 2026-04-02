"use client";

import { useState } from "react";

type Props = {
  lotId: string;
  disabled: boolean;
  statusLabel: string;
  minOrderUnits?: number;
  maxStock?: number;
  sellingUnit?: string;
};

export default function LotPurchaseButton({ lotId, disabled, statusLabel, minOrderUnits = 1, maxStock, sellingUnit = "個" }: Props) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(minOrderUnits);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const ref = localStorage.getItem("affiliate_ref") || undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lot_id: lotId, ref, quantity }),
      });
      const data = await res.json();
      if (data.url) {
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
    <div className="mt-10 space-y-4">
      <div className="flex items-center justify-center gap-3">
        <label htmlFor="qty" className="text-sm text-gray-600">
          数量
        </label>
        <div className="flex items-center border rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(minOrderUnits, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
            aria-label="数量を減らす"
          >
            -
          </button>
          <input
            id="qty"
            type="number"
            min={minOrderUnits}
            max={maxStock}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= minOrderUnits) {
                setQuantity(maxStock ? Math.min(v, maxStock) : v);
              }
            }}
            className="w-16 text-center border-x py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => maxStock ? Math.min(q + 1, maxStock) : q + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
            aria-label="数量を増やす"
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">{sellingUnit}</span>
      </div>
      {minOrderUnits > 1 && (
        <p className="text-center text-xs text-gray-400">最小注文数: {minOrderUnits}{sellingUnit}</p>
      )}
      <div className="text-center">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "処理中..." : `今すぐ購入する（${quantity}${sellingUnit}）`}
        </button>
        <p className="mt-4 text-xs text-gray-400">
          Stripeによる安全な決済
        </p>
      </div>
    </div>
  );
}
