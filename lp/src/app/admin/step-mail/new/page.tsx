"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = {
  step_number: number;
  delay_hours: number;
  subject: string;
  body_html: string;
  body_text: string;
};

const TRIGGER_OPTIONS = [
  { value: "purchase", label: "購入完了" },
  { value: "affiliate_signup", label: "紹介者登録" },
  { value: "auction_won", label: "オークション落札" },
  { value: "inquiry", label: "問い合わせ" },
  { value: "external_purchase", label: "外部EC購入" },
  { value: "external_signup", label: "外部EC登録" },
  { value: "custom", label: "カスタム" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("purchase");
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { step_number: 1, delay_hours: 0, subject: "", body_html: "", body_text: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        delay_hours: 24,
        subject: "",
        body_html: "",
        body_text: "",
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const updateStep = (index: number, field: keyof Step, value: string | number) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/step-mail/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          trigger_event: triggerEvent,
          is_active: isActive,
          steps,
        }),
      });

      if (res.ok) {
        router.push("/admin/step-mail");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規キャンペーン作成</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">キャンペーン名</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">説明</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">トリガーイベント</label>
            <select value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)} className="w-full border rounded px-3 py-2">
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="is_active" />
            <label htmlFor="is_active" className="text-sm">有効にする</label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">ステップ</h2>
            <button type="button" onClick={addStep} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
              ステップ追加
            </button>
          </div>
          <p className="text-sm text-gray-500">
            テンプレート変数: {"{{user_name}}"}, {"{{user_email}}"}, {"{{unsubscribe_url}}"}, その他メタデータのキー
          </p>

          {steps.map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">ステップ {step.step_number}</h3>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="text-red-500 text-sm hover:underline">削除</button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">遅延（時間）</label>
                <input type="number" value={step.delay_hours} onChange={(e) => updateStep(i, "delay_hours", parseInt(e.target.value) || 0)} className="w-32 border rounded px-3 py-2" min={0} />
                <span className="text-sm text-gray-500 ml-2">
                  {step.delay_hours === 0 ? "即時送信" : step.delay_hours < 24 ? `${step.delay_hours}時間後` : `${Math.round(step.delay_hours / 24)}日後`}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">件名</label>
                <input type="text" value={step.subject} onChange={(e) => updateStep(i, "subject", e.target.value)} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">本文（HTML）</label>
                <textarea value={step.body_html} onChange={(e) => updateStep(i, "body_html", e.target.value)} required className="w-full border rounded px-3 py-2 font-mono text-sm" rows={8} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">本文（テキスト版・任意）</label>
                <textarea value={step.body_text} onChange={(e) => updateStep(i, "body_text", e.target.value)} className="w-full border rounded px-3 py-2 font-mono text-sm" rows={4} />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? "保存中..." : "キャンペーンを作成"}
        </button>
      </form>
    </div>
  );
}
