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
  { value: "inquiry", label: "問い合わせ" },
  { value: "custom", label: "カスタム" },
];

const TEMPLATES = [
  {
    id: "welcome",
    name: "購入お礼メール",
    trigger: "purchase",
    steps: [
      { step_number: 1, delay_hours: 0, subject: "ご購入ありがとうございます", body_html: "<p>{{user_name}} 様</p><p>このたびはご購入いただき、誠にありがとうございます。</p><p>商品の発送準備が整い次第、改めてご連絡いたします。</p><p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>", body_text: "" },
      { step_number: 2, delay_hours: 72, subject: "商品はお手元に届きましたか？", body_html: "<p>{{user_name}} 様</p><p>先日はご購入いただきありがとうございました。</p><p>商品はお手元に届きましたでしょうか？</p><p>ご使用になった感想やご質問がございましたら、ぜひお聞かせください。</p>", body_text: "" },
      { step_number: 3, delay_hours: 168, subject: "ご愛用いただけていますか？", body_html: "<p>{{user_name}} 様</p><p>ご購入から約1週間が経ちました。</p><p>商品にご満足いただけておりましたら幸いです。</p><p>リピート購入やまとめ買いもぜひご検討ください。</p>", body_text: "" },
    ],
  },
  {
    id: "followup",
    name: "フォローアップ（3通）",
    trigger: "purchase",
    steps: [
      { step_number: 1, delay_hours: 24, subject: "【ご確認】ご注文ありがとうございます", body_html: "<p>{{user_name}} 様</p><p>ご注文の確認メールです。発送までしばらくお待ちください。</p>", body_text: "" },
      { step_number: 2, delay_hours: 168, subject: "使い方のコツをご紹介します", body_html: "<p>{{user_name}} 様</p><p>商品を最大限に活用していただくためのコツをご紹介します。</p><p>ぜひお試しください。</p>", body_text: "" },
      { step_number: 3, delay_hours: 720, subject: "リピートのご案内", body_html: "<p>{{user_name}} 様</p><p>ご購入から約1ヶ月が経ちました。</p><p>定期購入プランもございますので、ぜひご検討ください。</p>", body_text: "" },
    ],
  },
];

export default function NewPartnerCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("purchase");
  const [fromName, setFromName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { step_number: 1, delay_hours: 0, subject: "", body_html: "", body_text: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const applyTemplate = (templateId: string) => {
    const t = TEMPLATES.find((t) => t.id === templateId);
    if (!t) return;
    setName(t.name);
    setTriggerEvent(t.trigger);
    setSteps(t.steps);
    setShowTemplates(false);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { step_number: steps.length + 1, delay_hours: 24, subject: "", body_html: "", body_text: "" },
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
          from_name: fromName || undefined,
          is_active: isActive,
          steps,
          scope: "partner",
        }),
      });

      if (res.ok) {
        router.push("/partner/step-mail");
      }
    } finally {
      setSaving(false);
    }
  };

  if (showTemplates) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">キャンペーン作成</h1>
          <button
            onClick={() => setShowTemplates(false)}
            className="text-sm text-orange-600 hover:underline"
          >
            テンプレートなしで作成
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">テンプレートを選択すると、すぐにメール内容がセットされます。あとからカスタマイズできます。</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className="text-left bg-white rounded-2xl border shadow-sm p-6 hover:border-orange-400 hover:shadow-md transition"
            >
              <p className="font-bold text-gray-900 mb-1">{t.name}</p>
              <p className="text-xs text-gray-500 mb-3">{t.steps.length}通のメールが自動配信されます</p>
              <div className="space-y-1">
                {t.steps.map((s) => (
                  <div key={s.step_number} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-5 h-5 bg-orange-100/60 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold">{s.step_number}</span>
                    <span>{s.delay_hours === 0 ? "即時" : s.delay_hours < 24 ? `${s.delay_hours}時間後` : `${Math.round(s.delay_hours / 24)}日後`}</span>
                    <span className="text-gray-400">-</span>
                    <span className="truncate">{s.subject}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新規キャンペーン作成</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">キャンペーン名</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">説明（任意）</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">トリガーイベント</label>
              <select value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">差出人名（任意）</label>
              <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="例: 株式会社○○" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="is_active" className="rounded" />
            <label htmlFor="is_active" className="text-sm">有効にする</label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">ステップ</h2>
            <button type="button" onClick={addStep} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700">
              ステップ追加
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              テンプレート変数: <code className="bg-blue-100 px-1 rounded">{"{{user_name}}"}</code> <code className="bg-blue-100 px-1 rounded">{"{{user_email}}"}</code> <code className="bg-blue-100 px-1 rounded">{"{{unsubscribe_url}}"}</code>
            </p>
          </div>

          {steps.map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900">ステップ {step.step_number}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {step.delay_hours === 0 ? "即時送信" : step.delay_hours < 24 ? `${step.delay_hours}時間後` : `${Math.round(step.delay_hours / 24)}日後`}
                  </span>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-red-500 text-xs hover:underline">削除</button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">配信タイミング（時間後）</label>
                <input type="number" value={step.delay_hours} onChange={(e) => updateStep(i, "delay_hours", parseInt(e.target.value) || 0)} className="w-32 border rounded-lg px-3 py-2 text-sm" min={0} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">件名</label>
                <input type="text" value={step.subject} onChange={(e) => updateStep(i, "subject", e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">本文（HTML）</label>
                <textarea value={step.body_html} onChange={(e) => updateStep(i, "body_html", e.target.value)} required className="w-full border rounded-lg px-3 py-2 font-mono text-xs" rows={8} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">本文（テキスト版・任意）</label>
                <textarea value={step.body_text} onChange={(e) => updateStep(i, "body_text", e.target.value)} className="w-full border rounded-lg px-3 py-2 font-mono text-xs" rows={3} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium">
            {saving ? "保存中..." : "キャンペーンを作成"}
          </button>
          <button type="button" onClick={() => setShowTemplates(true)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            テンプレートに戻る
          </button>
        </div>
      </form>
    </div>
  );
}
