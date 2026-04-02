"use client";

import { useState } from "react";

type Props = {
  productId?: string;
  partnerId?: string;
  lotId?: string;
};

const QUESTIONS = [
  {
    id: "gratitude",
    category: "gratitude" as const,
    label: "感謝していること",
    question: "この商品・サービスを通じて、感謝していることは何ですか？",
    placeholder: "例: 品質が高く、安心して家族に使えることに感謝しています",
    icon: "🙏",
  },
  {
    id: "emotion",
    category: "emotion" as const,
    label: "感動したこと",
    question: "この商品・サービスで感動した体験やエピソードがあれば教えてください。",
    placeholder: "例: 届いた時の丁寧な梱包に心が温かくなりました",
    icon: "✨",
  },
  {
    id: "choice_reason",
    category: "choice_reason" as const,
    label: "選んだ理由",
    question: "数ある選択肢の中から、この商品・サービスを選んだ理由は何ですか？",
    placeholder: "例: 生産者の顔が見えること、プルーフチェーンで品質が保証されていること",
    icon: "💡",
  },
];

export function NonFinancialSurvey({ productId, partnerId, lotId }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledAnswers = Object.entries(answers).filter(([, v]) => v.trim());
    if (filledAnswers.length === 0) return;

    setLoading(true);
    try {
      const promises = filledAnswers.map(([category, content]) =>
        fetch("/api/non-financial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_type: "survey",
            category,
            partner_id: partnerId || null,
            product_id: productId || null,
            content,
            customer_segment: respondentName || null,
            metadata: { lot_id: lotId || null },
          }),
        })
      );
      await Promise.all(promises);
      setSubmitted(true);
    } catch {
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🙏</div>
        <p className="font-bold text-green-800 mb-1">ご回答ありがとうございます</p>
        <p className="text-sm text-green-600">いただいたお声は、より良いサービスの改善に活用させていただきます。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b">
        <h3 className="font-bold text-gray-900">お客様の声をお聞かせください</h3>
        <p className="text-xs text-gray-500 mt-1">回答できる項目だけで構いません（任意回答）</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">お名前（任意）</label>
          <input
            type="text"
            value={respondentName}
            onChange={(e) => setRespondentName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="匿名でも構いません"
          />
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.id}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <span>{q.icon}</span>
              {q.label}
            </label>
            <p className="text-xs text-gray-500 mb-2">{q.question}</p>
            <textarea
              value={answers[q.category] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.category]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder={q.placeholder}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || Object.values(answers).every((v) => !v.trim())}
          className="w-full bg-amber-600 text-white py-2.5 px-4 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium text-sm"
        >
          {loading ? "送信中..." : "回答を送信する"}
        </button>
      </form>
    </div>
  );
}
