"use client";

import { useState } from "react";
import { CATEGORY_TEMPLATES, type CategoryFieldConfig } from "@/lib/types";

type Props = {
  templateId?: string | null;
  customFields?: Record<string, string | number | boolean | null> | null;
  fieldType: "product_fields" | "lot_fields";
};

export function CategoryFields({ templateId, customFields, fieldType }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(templateId ?? "");
  const templates = CATEGORY_TEMPLATES as Record<string, { id: string; name: string; [key: string]: unknown }>;
  const template = selectedTemplate ? templates[selectedTemplate] : null;
  const fields = (template?.[fieldType] ?? []) as CategoryFieldConfig[];

  return (
    <>
      {fieldType === "product_fields" && (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            商品カテゴリ
          </label>
          <select
            name="category_template_id"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">カテゴリを選択（任意）</option>
            {Object.values(templates).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {fields.length > 0 && (
        <div className="col-span-2">
          <div className="border-t pt-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              {template?.name as string} 固有項目
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === "select" && field.options ? (
                    <select
                      name={`cf_${field.field}`}
                      required={field.required}
                      defaultValue={(customFields?.[field.field] as string) ?? ""}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">選択してください</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <input
                      type="checkbox"
                      name={`cf_${field.field}`}
                      defaultChecked={!!customFields?.[field.field]}
                      className="rounded border-gray-300"
                    />
                  ) : (
                    <input
                      name={`cf_${field.field}`}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      required={field.required}
                      defaultValue={(customFields?.[field.field] as string) ?? ""}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** formDataからcustom_fieldsを抽出するユーティリティ */
export function extractCustomFields(formData: FormData): Record<string, string | number | boolean | null> {
  const fields: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cf_")) {
      const fieldName = key.slice(3);
      fields[fieldName] = value as string || null;
    }
  }
  return fields;
}
