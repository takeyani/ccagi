"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function AccessDeniedBanner() {
  const searchParams = useSearchParams();
  const denied = searchParams.get("denied");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (denied) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [denied]);

  if (!show) return null;

  return (
    <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
      <p className="text-sm text-amber-800">
        アクセス権限がありません。ご自身のポータルに移動しました。
      </p>
      <button
        onClick={() => setShow(false)}
        className="text-amber-600 hover:text-amber-800 text-sm"
        aria-label="閉じる"
      >
        ✕
      </button>
    </div>
  );
}
