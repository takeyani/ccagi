"use client";

import { useState } from "react";

type Question = {
  question_text: string;
  question_type: "text" | "radio" | "checkbox" | "rating";
  options: string[];
  is_required: boolean;
  sort_order: number;
};

type Props = {
  initialQuestions?: Question[];
};

export function SurveyQuestionEditor({ initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions ?? []
  );

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        question_type: "text",
        options: [],
        is_required: false,
        sort_order: prev.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const opts = [...q.options];
        opts[oIndex] = value;
        return { ...q, options: opts };
      })
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.filter((_, j) => j !== oIndex) }
          : q
      )
    );
  };

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="questions_json"
        value={JSON.stringify(
          questions.map((q, i) => ({ ...q, sort_order: i }))
        )}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">質問一覧</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + 質問を追加
        </button>
      </div>

      {questions.length === 0 && (
        <p className="text-sm text-gray-400">質問がありません</p>
      )}

      {questions.map((q, qi) => (
        <div
          key={qi}
          className="rounded-xl border bg-gray-50 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              質問 {qi + 1}
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              質問文
            </label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={q.question_text}
              onChange={(e) =>
                updateQuestion(qi, { question_text: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイプ
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={q.question_type}
                onChange={(e) =>
                  updateQuestion(qi, {
                    question_type: e.target.value as Question["question_type"],
                  })
                }
              >
                <option value="text">テキスト</option>
                <option value="radio">ラジオ（単一選択）</option>
                <option value="checkbox">チェックボックス（複数選択）</option>
                <option value="rating">評価（1〜5）</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={q.is_required}
                  onChange={(e) =>
                    updateQuestion(qi, { is_required: e.target.checked })
                  }
                />
                必須
              </label>
            </div>
          </div>

          {(q.question_type === "radio" ||
            q.question_type === "checkbox") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                選択肢
              </label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    className="text-xs text-red-500 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qi)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                + 選択肢を追加
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
