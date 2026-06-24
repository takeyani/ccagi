"use client";

import { useState } from "react";
import AgeVerificationModal from "@/components/AgeVerificationModal";

type Props = {
  lotId: string;
  disabled: boolean;
  statusLabel: string;
  minOrderUnits?: number;
  maxStock?: number;
  sellingUnit?: string;
  ageRestricted?: boolean;
  restrictionType?: "alcohol" | "tobacco" | null;
  ageVerified?: boolean;
};

export default function LotPurchaseButton({
  lotId,
  disabled,
  statusLabel,
  minOrderUnits = 1,
  maxStock,
  sellingUnit = "個",
  ageRestricted = false,
  restrictionType = null,
  ageVerified = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(minOrderUnits);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [verifiedLocally, setVerifiedLocally] = useState(false);

  const proceedCheckout = async () => {
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

  const handlePurchase = async () => {
    if (ageRestricted && !ageVerified && !verifiedLocally) {
      setShowAgeModal(true);
      return;
    }
    await proceedCheckout();
  };

  const handleVerified = async () => {
    setShowAgeModal(false);
    setVerifiedLocally(true);
    await proceedCheckout();
  };

  if (disabled) {
    return (
      <div className="mt-6 text-center sm:mt-10">
        <button
          disabled
          className="w-full rounded-full bg-gray-400 px-6 py-4 text-base font-bold text-white cursor-not-allowed sm:px-8 sm:text-lg"
        >
          {statusLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 sm:mt-10">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <label htmlFor="qty" className="text-sm text-gray-600">
          数量
        </label>
        <div className="flex items-center border rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(minOrderUnits, q - 1))}
            className="px-4 py-2.5 text-lg text-gray-600 hover:bg-gray-50 rounded-l-lg min-w-[44px] min-h-[44px]"
            aria-label="数量を減らす"
          >
            -
          </button>
          <input
            id="qty"
            type="number"
            inputMode="numeric"
            min={minOrderUnits}
            max={maxStock}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= minOrderUnits) {
                setQuantity(maxStock ? Math.min(v, maxStock) : v);
              }
            }}
            className="w-16 text-center border-x py-2.5 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => maxStock ? Math.min(q + 1, maxStock) : q + 1)}
            className="px-4 py-2.5 text-lg text-gray-600 hover:bg-gray-50 rounded-r-lg min-w-[44px] min-h-[44px]"
            aria-label="数量を増やす"
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">{sellingUnit}</span>
      </div>
      {minOrderUnits > 1 && (
        <p className="text-center text-xs text-gray-500">
          ※ {minOrderUnits}{sellingUnit}以上からご購入いただけます
        </p>
      )}
      <div className="text-center">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full rounded-full bg-orange-600 px-4 py-4 text-base font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:text-lg"
        >
          {loading ? "処理中..." : `${quantity}${sellingUnit}を購入する`}
        </button>
        <p className="mt-3 text-xs text-gray-400 sm:mt-4">
          🔒 Stripeによる安全な決済
        </p>
      </div>

      <AgeVerificationModal
        open={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onVerified={handleVerified}
        restrictionType={restrictionType}
      />
    </div>
  );
}
