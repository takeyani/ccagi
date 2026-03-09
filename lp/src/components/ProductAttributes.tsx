"use client";

import { useState } from "react";
import { ATTRIBUTE_LABELS } from "@/lib/constants";

type Attr = { label: string; value: string };

export function ProductAttributes({
  defaultValue = [],
  accentColor = "indigo",
}: {
  defaultValue?: Attr[];
  accentColor?: "indigo" | "teal";
}) {
  const [attrs, setAttrs] = useState<Attr[]>(
    defaultValue.length > 0 ? defaultValue : []
  );

  const ringClass =
    accentColor === "teal" ? "focus:ring-teal-500" : "focus:ring-indigo-500";
  const btnClass =
    accentColor === "teal"
      ? "text-teal-600 hover:text-teal-800"
      : "text-indigo-600 hover:text-indigo-800";

  function addRow() {
    setAttrs([...attrs, { label: ATTRIBUTE_LABELS[0], value: "" }]);
  }

  function removeRow(index: number) {
    setAttrs(attrs.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: "label" | "value", val: string) {
    setAttrs(
      attrs.map((a, i) => (i === index ? { ...a, [field]: val } : a))
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        成分・特徴
      </label>
      <p className="text-xs text-gray-400 mb-2">
        商品の成分や特徴を項目ごとに登録できます
      </p>

      <input
        type="hidden"
        name="product_attributes"
        value={JSON.stringify(attrs.filter((a) => a.value.trim() !== ""))}
      />

      <div className="space-y-2">
        {attrs.map((attr, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={attr.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
              className={`px-2 py-1.5 border rounded-lg text-sm focus:ring-2 ${ringClass} w-32`}
            >
              {ATTRIBUTE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              value={attr.value}
              onChange={(e) => updateRow(i, "value", e.target.value)}
              placeholder="例: ビタミンC 1000mg, 北海道産, 有機JAS..."
              className={`flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 ${ringClass}`}
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
        className={`mt-2 ${btnClass} text-sm font-medium`}
      >
        + 項目を追加
      </button>
    </div>
  );
}
