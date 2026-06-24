"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  restrictionType?: "alcohol" | "tobacco" | null;
};

export default function AgeVerificationModal({ open, onClose, onVerified, restrictionType }: Props) {
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const label = restrictionType === "tobacco" ? "たばこ" : restrictionType === "alcohol" ? "酒類" : "年齢制限商品";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      setError("生年月日を入力してください");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/age-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_of_birth: dob }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        onVerified();
      } else {
        setError(data.error || "年齢確認に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-modal-title"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 id="age-modal-title" className="text-lg font-bold text-gray-900 sm:text-xl">
          年齢確認のお願い
        </h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {label}は法律により、20歳以上の方のみご購入いただけます。<br />
          確認のため、生年月日をご入力ください。
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              生年月日
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              max={today}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 text-base"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? "確認中..." : "確認して続行"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          ご入力いただいた生年月日は、年齢確認の目的のみに使用し、第三者へ提供することはありません。
        </p>
      </div>
    </div>
  );
}
