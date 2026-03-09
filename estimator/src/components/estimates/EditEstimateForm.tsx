"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/estimation/engine";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  estimate: any;
  items: any[];
  customers: { id: string; company_name: string; contact_name: string }[];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function EditEstimateForm({ estimate, items: initialItems, customers }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(estimate.title);
  const [customerId, setCustomerId] = useState(estimate.customer_id ?? "");
  const [notes, setNotes] = useState(estimate.notes ?? "");
  const [validUntil, setValidUntil] = useState(estimate.valid_until ?? "");
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

  const includedItems = items.filter((i) => i.is_included);
  const totalManMonths = includedItems.reduce(
    (s, i) => s + Number(i.adjusted_man_months),
    0
  );
  const subtotal = includedItems.reduce((s, i) => s + Number(i.amount), 0);
  const discountRate = Number(estimate.discount_rate);
  const discountAmount = Math.round(subtotal * (discountRate / 100));
  const total = subtotal - discountAmount;

  function toggleItem(idx: number) {
    const next = [...items];
    next[idx] = { ...next[idx], is_included: !next[idx].is_included };
    setItems(next);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const selectedCustomer = customers.find((c) => c.id === customerId);

    await supabase
      .from("estimator_estimates")
      .update({
        title,
        customer_id: customerId || null,
        notes,
        valid_until: validUntil || null,
        total_man_months: Math.round(totalManMonths * 100) / 100,
        subtotal,
        discount_amount: discountAmount,
        total,
        customer_company_name: selectedCustomer?.company_name ?? "",
        customer_contact_name: selectedCustomer?.contact_name ?? "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", estimate.id);

    // Update item inclusion
    for (const item of items) {
      await supabase
        .from("estimator_estimate_items")
        .update({ is_included: item.is_included })
        .eq("id", item.id);
    }

    router.push(`/dashboard/estimates/${estimate.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            案件名
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
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
                {c.company_name}{c.contact_name ? ` - ${c.contact_name}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
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
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">含</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">工程</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">タスク</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">工数(人月)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">金額(円)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const showPhase =
                  idx === 0 || item.phase_key !== items[idx - 1].phase_key;
                return (
                  <tr
                    key={item.id}
                    className={`border-b last:border-0 ${
                      !item.is_included ? "opacity-40" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={item.is_included}
                        onChange={() => toggleItem(idx)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {showPhase ? item.phase_name : ""}
                    </td>
                    <td className="px-4 py-2">{item.task_name}</td>
                    <td className="px-4 py-2 text-right">
                      {Number(item.adjusted_man_months).toFixed(2)}
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
            <span className="font-bold">{totalManMonths.toFixed(2)} 人月</span>
          </div>
          <div className="flex justify-between">
            <span>小計</span>
            <span>¥{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>割引（{discountRate}%OFF）</span>
            <span>-¥{formatCurrency(discountAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>合計金額</span>
            <span>¥{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
      >
        {saving ? "保存中..." : "変更を保存"}
      </button>
    </div>
  );
}
