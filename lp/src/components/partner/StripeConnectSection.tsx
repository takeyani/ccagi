"use client";

import { useState, useEffect } from "react";

export function StripeConnectSection({
  partnerId,
  partner,
}: {
  partnerId: string;
  partner: Record<string, unknown>;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const connectStatus = partner.stripe_connect_status as string;

  useEffect(() => {
    if (partner.stripe_account_id) {
      fetchStatus();
    }
  }, [partner.stripe_account_id]);

  const fetchStatus = async () => {
    const res = await fetch(`/api/stripe-connect?partner_id=${partnerId}`);
    const data = await res.json();
    setStatus(data);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: partnerId }),
      });
      const data = await res.json();
      if (data.onboarding_url) {
        window.location.href = data.onboarding_url;
      } else {
        setError(data.error || "接続に失敗しました");
      }
    } catch {
      setError("接続に失敗しました");
    }
    setLoading(false);
  };

  const payoutSummary = status?.payout_summary as Record<string, number> | undefined;

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 col-span-2">
      <h2 className="font-semibold mb-4">売上受取設定（Stripe Connect）</h2>

      {connectStatus === "connected" ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">接続済み</span>
            <span className="text-xs text-gray-400 ml-2">
              売上から手数料（12%）を差し引いた金額が自動で入金されます
            </span>
          </div>

          {payoutSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">総売上</div>
                <div className="text-lg font-bold">¥{(payoutSummary.total_gross || 0).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">手数料</div>
                <div className="text-lg font-bold text-red-600">-¥{(payoutSummary.total_platform_fee || 0).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">受取済み</div>
                <div className="text-lg font-bold text-green-600">¥{(payoutSummary.total_transferred || 0).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">未送金</div>
                <div className="text-lg font-bold text-yellow-600">¥{(payoutSummary.total_pending || 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          {typeof status?.dashboard_url === "string" && (
            <a
              href={status.dashboard_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Stripeダッシュボードを開く →
            </a>
          )}
        </div>
      ) : connectStatus === "pending" ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">設定未完了</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Stripeの本人確認が完了していません。設定を続けてください。
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "読み込み中..." : "設定を続ける"}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Stripeアカウントを接続すると、売上が発生した際に手数料（12%）を引いた金額が自動でお客様の口座に入金されます。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-700">
            <strong>売上の流れ:</strong><br />
            商品が売れる → プラットフォーム手数料12%を差引 → 残りがあなたのStripeアカウントに自動入金 → 登録口座に振込
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
          >
            {loading ? "接続中..." : "Stripeアカウントを接続する"}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
