"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PROJECT_TYPES,
  SCALE_OPTIONS,
  COMPLEXITY_OPTIONS,
  DEADLINE_OPTIONS,
  PLATFORM_OPTIONS,
  ADDITIONAL_FEATURES,
  type EstimateConditions,
} from "@/lib/estimation/constants";
import {
  calculateEstimate,
  generateEstimateNumber,
  formatCurrency,
  type EstimateItem,
  type EstimateResult,
} from "@/lib/estimation/engine";

type Customer = {
  id: string;
  company_name: string;
  contact_name: string;
};

type Props = {
  customers: Customer[];
  defaultUnitPrice: number;
  defaultDiscountRate: number;
};

type Step = "type" | "conditions" | "review" | "save";

export function NewEstimateWizard({
  customers,
  defaultUnitPrice,
  defaultDiscountRate,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [projectType, setProjectType] = useState("");
  const [conditions, setConditions] = useState<EstimateConditions>({
    scale: "medium",
    complexity: "standard",
    deadline: "normal",
    platform: "web",
    features: [],
  });
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSelectType(type: string) {
    setProjectType(type);
    setStep("conditions");
  }

  function handleConditionsSubmit() {
    const est = calculateEstimate(conditions, defaultUnitPrice, defaultDiscountRate);
    setResult(est);
    setStep("review");
  }

  function toggleFeature(key: string) {
    setConditions((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  }

  function toggleItem(index: number) {
    if (!result) return;
    const newItems = [...result.items];
    newItems[index] = { ...newItems[index], isIncluded: !newItems[index].isIncluded };

    const includedItems = newItems.filter((i) => i.isIncluded);
    const totalManMonths = includedItems.reduce((s, i) => s + i.adjustedManMonths, 0);
    const subtotal = includedItems.reduce((s, i) => s + i.amount, 0);
    const discountAmount = Math.round(subtotal * (result.discountRate / 100));
    const total = subtotal - discountAmount;

    setResult({
      ...result,
      items: newItems,
      totalManMonths: Math.round(totalManMonths * 100) / 100,
      subtotal,
      discountAmount,
      total,
    });
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const selectedCustomer = customers.find((c) => c.id === customerId);
    const estimateNumber = generateEstimateNumber();

    const { data: estimate, error } = await supabase
      .from("estimator_estimates")
      .insert({
        user_id: user.id,
        customer_id: customerId || null,
        estimate_number: estimateNumber,
        title,
        project_type: projectType,
        conditions,
        unit_price: defaultUnitPrice,
        discount_rate: defaultDiscountRate,
        total_man_months: result.totalManMonths,
        subtotal: result.subtotal,
        discount_amount: result.discountAmount,
        total: result.total,
        status: "下書き",
        valid_until: validUntil || null,
        notes,
        customer_company_name: selectedCustomer?.company_name ?? "",
        customer_contact_name: selectedCustomer?.contact_name ?? "",
      })
      .select("id")
      .single();

    if (error || !estimate) {
      setSaving(false);
      return;
    }

    // Save items
    const items = result.items.map((item: EstimateItem) => ({
      estimate_id: estimate.id,
      phase_key: item.phaseKey,
      phase_name: item.phaseName,
      phase_sort_order: item.phaseSortOrder,
      task_name: item.taskName,
      task_sort_order: item.taskSortOrder,
      base_man_months: item.baseManMonths,
      multiplier: item.multiplier,
      adjusted_man_months: item.adjustedManMonths,
      unit_price: item.unitPrice,
      amount: item.amount,
      is_included: item.isIncluded,
    }));

    await supabase.from("estimator_estimate_items").insert(items);

    router.push(`/dashboard/estimates/${estimate.id}`);
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["type", "conditions", "review", "save"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-indigo-600 text-white"
                  : (["type", "conditions", "review", "save"].indexOf(step) > i)
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="w-8 h-0.5 bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Context bar */}
      {step !== "type" && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {projectType && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-200">
              <span className="text-xs text-indigo-400">種別</span>
              {PROJECT_TYPES.find((pt) => pt.key === projectType)?.label}
            </span>
          )}
          {customerId && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-200">
              <span className="text-xs text-emerald-400">顧客</span>
              {customers.find((c) => c.id === customerId)?.company_name}
            </span>
          )}
          {step === "review" && (
            <>
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200">
                <span className="text-xs text-gray-400">規模</span>
                {SCALE_OPTIONS.find((o) => o.key === conditions.scale)?.label}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200">
                <span className="text-xs text-gray-400">複雑度</span>
                {COMPLEXITY_OPTIONS.find((o) => o.key === conditions.complexity)?.label}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200">
                <span className="text-xs text-gray-400">納期</span>
                {DEADLINE_OPTIONS.find((o) => o.key === conditions.deadline)?.label}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200">
                <span className="text-xs text-gray-400">PF</span>
                {PLATFORM_OPTIONS.find((o) => o.key === conditions.platform)?.label}
              </span>
            </>
          )}
        </div>
      )}

      {/* Step 1: Project Type */}
      {step === "type" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.key}
              onClick={() => handleSelectType(pt.key)}
              className={`p-6 rounded-2xl border-2 text-left hover:border-indigo-500 transition ${
                projectType === pt.key
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="font-bold text-lg">{pt.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Conditions */}
      {step === "conditions" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-bold mb-3">規模</h3>
            <div className="flex gap-3">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConditions({ ...conditions, scale: opt.key })}
                  className={`px-4 py-2 rounded-lg border ${
                    conditions.scale === opt.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">複雑度</h3>
            <div className="flex gap-3">
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConditions({ ...conditions, complexity: opt.key })}
                  className={`px-4 py-2 rounded-lg border ${
                    conditions.complexity === opt.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">納期</h3>
            <div className="flex gap-3">
              {DEADLINE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConditions({ ...conditions, deadline: opt.key })}
                  className={`px-4 py-2 rounded-lg border ${
                    conditions.deadline === opt.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">プラットフォーム</h3>
            <div className="flex gap-3">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConditions({ ...conditions, platform: opt.key })}
                  className={`px-4 py-2 rounded-lg border ${
                    conditions.platform === opt.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">追加機能</h3>
            <div className="flex flex-wrap gap-2">
              {ADDITIONAL_FEATURES.map((feat) => (
                <button
                  key={feat.key}
                  onClick={() => toggleFeature(feat.key)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    conditions.features.includes(feat.key)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {feat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("type")}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              戻る
            </button>
            <button
              onClick={handleConditionsSubmit}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              見積もりを算出
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === "review" && result && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">
                      含
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      工程
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      タスク
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      工数(人月)
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      単価(円)
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      金額(円)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, idx) => {
                    const showPhase =
                      idx === 0 ||
                      item.phaseKey !== result.items[idx - 1].phaseKey;
                    return (
                      <tr
                        key={`${item.phaseKey}-${item.taskName}`}
                        className={`border-b last:border-0 ${
                          !item.isIncluded ? "opacity-40" : ""
                        }`}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={item.isIncluded}
                            onChange={() => toggleItem(idx)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {showPhase ? item.phaseName : ""}
                        </td>
                        <td className="px-4 py-2">{item.taskName}</td>
                        <td className="px-4 py-2 text-right">
                          {item.adjustedManMonths.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ¥{formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ¥{formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="max-w-sm ml-auto space-y-2 text-sm">
              <div className="flex justify-between">
                <span>合計工数</span>
                <span className="font-bold">
                  {result.totalManMonths.toFixed(2)} 人月
                </span>
              </div>
              <div className="flex justify-between">
                <span>小計</span>
                <span>¥{formatCurrency(result.subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>割引（{result.discountRate}%OFF）</span>
                <span>-¥{formatCurrency(result.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>合計金額</span>
                <span>¥{formatCurrency(result.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("conditions")}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              条件を変更
            </button>
            <button
              onClick={() => setStep("save")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              保存へ進む
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Save */}
      {step === "save" && result && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="例: ○○株式会社 Webアプリ開発"
            />
          </div>

          <div>
            <label
              htmlFor="customer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              顧客
            </label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">（選択なし）</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                  {c.contact_name ? ` - ${c.contact_name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="valid_until"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              有効期限
            </label>
            <input
              id="valid_until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              備考
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <p>
              <span className="text-gray-500">プロジェクト種別: </span>
              <strong>{PROJECT_TYPES.find((pt) => pt.key === projectType)?.label}</strong>
            </p>
            {customerId && (
              <p>
                <span className="text-gray-500">顧客: </span>
                <strong>{customers.find((c) => c.id === customerId)?.company_name}</strong>
              </p>
            )}
            <p>
              <strong>合計金額: </strong>¥{formatCurrency(result.total)}
              <span className="text-gray-500 ml-2">
                （{result.discountRate}%割引適用後）
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("review")}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              戻る
            </button>
            <button
              onClick={handleSave}
              disabled={!title || saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {saving ? "保存中..." : "見積もりを保存"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
