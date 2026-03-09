"use client";

import { useState } from "react";
import { ATTRIBUTE_LABELS } from "@/lib/constants";

type Spec = { label: string; value: string };

export function SpecRequirements({
  defaultValue = [],
}: {
  defaultValue?: Spec[];
}) {
  const [specs, setSpecs] = useState<Spec[]>(
    defaultValue.length > 0 ? defaultValue : []
  );

  function addRow() {
    setSpecs([...specs, { label: ATTRIBUTE_LABELS[0], value: "" }]);
  }

  function removeRow(index: number) {
    setSpecs(specs.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: "label" | "value", val: string) {
    setSpecs(specs.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        成分・特徴条件
      </label>
      <p className="text-xs text-gray-400 mb-2">
        商品説明やスペックデータに含まれるキーワードで絞り込みます
      </p>

      {/* hidden input で JSON をサーバーに送信 */}
      <input
        type="hidden"
        name="spec_requirements"
        value={JSON.stringify(specs.filter((s) => s.value.trim() !== ""))}
      />

      <div className="space-y-2">
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={spec.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
              className="px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 w-32"
            >
              {ATTRIBUTE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              value={spec.value}
              onChange={(e) => updateRow(i, "value", e.target.value)}
              placeholder="例: ビタミンC, 北海道, 有機JAS..."
              className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-red-400 hover:text-red-600 text-sm px-1"
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-teal-600 hover:text-teal-800 text-sm font-medium"
      >
        + 条件を追加
      </button>
    </div>
  );
}
