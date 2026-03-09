"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Survey, SurveyQuestion } from "@/lib/types";

type Props = {
  survey: Survey;
  questions: SurveyQuestion[];
};

export function SurveyForm({ survey, questions }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<
    Record<string, { answer_text?: string; answer_options?: string[] }>
  >({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateAnswer = (
    questionId: string,
    value: { answer_text?: string; answer_options?: string[] }
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const answerList = questions.map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id]?.answer_text || "",
        answer_options: answers[q.id]?.answer_options || [],
      }));

      const res = await fetch("/api/surveys/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: survey.id,
          respondent_name: name || null,
          respondent_email: email || null,
          answers: answerList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }

      setSubmitted(true);
      router.refresh();
    } catch {
      setError("送信中にエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">{survey.title}</h3>
        <p className="mt-4 text-green-600 font-medium">
          ご回答ありがとうございました！
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-900">{survey.title}</h3>
      {survey.description && (
        <p className="text-sm text-gray-600">{survey.description}</p>
      )}

      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {q.question_text}
            {q.is_required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>

          {q.question_type === "text" && (
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              required={q.is_required}
              value={answers[q.id]?.answer_text || ""}
              onChange={(e) =>
                updateAnswer(q.id, { answer_text: e.target.value })
              }
            />
          )}

          {q.question_type === "radio" && (
            <div className="space-y-1">
              {(q.options as string[]).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    required={q.is_required}
                    checked={answers[q.id]?.answer_text === opt}
                    onChange={() =>
                      updateAnswer(q.id, { answer_text: opt })
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.question_type === "checkbox" && (
            <div className="space-y-1">
              {(q.options as string[]).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={
                      answers[q.id]?.answer_options?.includes(opt) ?? false
                    }
                    onChange={(e) => {
                      const current = answers[q.id]?.answer_options ?? [];
                      const next = e.target.checked
                        ? [...current, opt]
                        : current.filter((o) => o !== opt);
                      updateAnswer(q.id, { answer_options: next });
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.question_type === "rating" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`w-10 h-10 rounded-full border text-sm font-medium transition ${
                    answers[q.id]?.answer_text === String(n)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    updateAnswer(q.id, { answer_text: String(n) })
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            お名前（任意）
          </label>
          <input
            type="text"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス（任意）
          </label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "送信中..." : "回答を送信する"}
      </button>
    </form>
  );
}
