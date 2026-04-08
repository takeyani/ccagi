"use client";

import { useSearchParams } from "next/navigation";

export default function StripeRefreshPage() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partner_id");

  const handleRetry = async () => {
    if (!partnerId) return;
    const res = await fetch("/api/stripe-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner_id: partnerId }),
    });
    const data = await res.json();
    if (data.onboarding_url) {
      window.location.href = data.onboarding_url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h1 className="text-xl font-bold mb-2">セッションが期限切れです</h1>
        <p className="text-gray-500 mb-6">
          Stripeの設定セッションが期限切れになりました。<br />
          もう一度お試しください。
        </p>
        <button
          onClick={handleRetry}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 font-medium"
        >
          もう一度設定する
        </button>
      </div>
    </div>
  );
}
