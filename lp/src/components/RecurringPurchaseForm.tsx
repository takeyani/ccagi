"use client";

import { useState } from "react";

type Props = {
  lotId: string;
  price: number;
};

export default function RecurringPurchaseForm({ lotId, price }: Props) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState("毎月");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ref = localStorage.getItem("affiliate_ref") || undefined;
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lot_id: lotId,
          frequency,
          quantity: 1,
          customer_name: name,
          customer_email: email,
          ref,
        }),
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

  const frequencyLabel: Record<string, string> = {
    毎週: "毎週",
    隔週: "2週間ごと",
    毎月: "毎月",
    隔月: "2ヶ月ごと",
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-full border-2 border-orange-600 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50/40"
      >
        定期購入で申し込む
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border bg-orange-50/40 p-4 space-y-4 sm:p-5"
    >
      <h3 className="text-base font-bold text-gray-900">
        定期購入のお申し込み
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        初回のお支払い後、ご指定の頻度で自動的にお届けします。<br />
        マイページからいつでも解約・スキップ可能です。
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お届け頻度 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["毎週", "隔週", "毎月", "隔月"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                frequency === f
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-orange-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            className="w-full rounded-lg border px-3 py-2.5 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg bg-white border p-3 text-sm text-gray-700">
        <div className="flex justify-between gap-2">
          <span>初回お支払い（今すぐ）</span>
          <span className="font-bold">&yen;{price.toLocaleString("ja-JP")}</span>
        </div>
        <div className="flex justify-between gap-2 mt-1 text-gray-500">
          <span>2回目以降（{frequencyLabel[frequency]}お届け）</span>
          <span>&yen;{price.toLocaleString("ja-JP")} / 回</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-orange-600 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "処理中..." : "定期購入を開始する"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          戻る
        </button>
      </div>
    </form>
  );
}
