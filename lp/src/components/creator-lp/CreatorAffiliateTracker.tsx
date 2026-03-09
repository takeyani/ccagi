"use client";

import { useEffect } from "react";

export function CreatorAffiliateTracker({ code }: { code: string }) {
  useEffect(() => {
    localStorage.setItem("affiliate_ref", code);
    document.cookie = `affiliate_ref=${code};path=/;max-age=${60 * 60 * 24 * 30}`;
  }, [code]);

  return null;
}
