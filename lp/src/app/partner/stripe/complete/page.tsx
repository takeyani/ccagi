"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function StripeCompletePage() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partner_id");
  const [status, setStatus] = useState<"checking" | "success" | "incomplete">("checking");

  useEffect(() => {
    if (!partnerId) return;

    fetch(`/api/stripe-connect?partner_id=${partnerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stripe_status?.charges_enabled && data.stripe_status?.payouts_enabled) {
          setStatus("success");
        } else {
          setStatus("incomplete");
        }
      })
      .catch(() => setStatus("incomplete"));
  }, [partnerId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md text-center">
        {status === "checking" && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold mb-2">確認中...</h1>
            <p className="text-gray-500">Stripeアカウントの状態を確認しています</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-xl font-bold text-green-700 mb-2">設定完了!</h1>
            <p className="text-gray-500 mb-6">
              Stripeアカウントの接続が完了しました。<br />
              売上が発生した際に、手数料を差し引いた金額が自動で入金されます。
            </p>
            <a
              href="/partner/profile"
              className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium"
            >
              プロフィールに戻る
            </a>
          </>
        )}
        {status === "incomplete" && (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-yellow-700 mb-2">設定が未完了です</h1>
            <p className="text-gray-500 mb-6">
              Stripeの本人確認が完了していません。<br />
              プロフィールページから設定を続けてください。
            </p>
            <a
              href="/partner/profile"
              className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium"
            >
              プロフィールに戻る
            </a>
          </>
        )}
      </div>
    </div>
  );
}
