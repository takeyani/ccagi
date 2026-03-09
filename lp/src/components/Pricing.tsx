"use client";

import { useState } from "react";

export default function Pricing() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const ref = localStorage.getItem("affiliate_ref") || undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          シンプルな料金プラン
        </h2>
        <p className="mt-4 text-gray-600">
          買い切り型。追加料金は一切ありません。
        </p>
        <div className="mx-auto mt-12 max-w-sm rounded-3xl border-2 border-indigo-600 bg-white p-10 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            デジタルコンテンツ
          </p>
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900">
              &yen;4,980
            </span>
            <span className="text-gray-500">（税込）</span>
          </div>
          <ul className="mt-8 space-y-3 text-left text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-600">&#10003;</span>
              即ダウンロード可能
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-600">&#10003;</span>
              商用利用OK
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-600">&#10003;</span>
              無期限アクセス
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-600">&#10003;</span>
              メールサポート付き
            </li>
          </ul>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="mt-10 w-full rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "処理中..." : "今すぐ購入する"}
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Stripeによる安全な決済
          </p>
        </div>
      </div>
    </section>
  );
}
