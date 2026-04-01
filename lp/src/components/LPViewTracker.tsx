"use client";

import { useEffect } from "react";

type Props = {
  productId: string;
  lotId: string;
  partnerId?: string;
};

export function LPViewTracker({ productId, lotId, partnerId }: Props) {
  useEffect(() => {
    fetch("/api/marketing/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "page_view",
        metadata: {
          content_type: "lot_lp",
          product_id: productId,
          lot_id: lotId,
          partner_id: partnerId || null,
          referrer: document.referrer || "(direct)",
          user_agent: navigator.userAgent,
          page_path: window.location.pathname,
          page_url: window.location.href,
        },
      }),
    }).catch(() => {});
  }, [productId, lotId, partnerId]);

  return null;
}
