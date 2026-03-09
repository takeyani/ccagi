"use client";

import { useState, useCallback } from "react";
import { calculateItemAmounts, calculateDocumentTotals } from "@/lib/tax";

export type ItemRow = {
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  amount: number;
  tax_amount: number;
  product_id?: string;
  lot_id?: string;
};

const emptyRow = (): ItemRow => ({
  item_name: "",
  description: "",
  quantity: 1,
  unit: "個",
  unit_price: 0,
  tax_rate: 10,
  amount: 0,
  tax_amount: 0,
});

type Props = {
  initialItems?: ItemRow[];
  showTaxBreakdown?: boolean;
};

export function LineItemsForm({ initialItems, showTaxBreakdown }: Props) {
  const [items, setItems] = useState<ItemRow[]>(
    initialItems && initialItems.length > 0 ? initialItems : [emptyRow()]
  );

  const recalc = useCallback((row: ItemRow): ItemRow => {
    const { amount, taxAmount } = calculateItemAmounts(row.quantity, row.unit_price, row.tax_rate);
    return { ...row, amount, tax_amount: taxAmount };
  }, []);

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      next[index] = recalc(row);
      return next;
    });
  };

  const addRow = () => setItems((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) =>
    setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);

  const totals = calculateDocumentTotals(
    items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unit_price,
      taxRate: i.tax_rate,
      amount: i.amount,
      taxAmount: i.tax_amount,
    }))
  );

  return (
    <div>
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-left">
            <th className="border px-2 py-1 w-8">#</th>
            <th className="border px-2 py-1">品名</th>
            <th className="border px-2 py-1 w-20">数量</th>
            <th className="border px-2 py-1 w-16">単位</th>
            <th className="border px-2 py-1 w-24">単価</th>
            <th className="border px-2 py-1 w-20">税率</th>
            <th className="border px-2 py-1 w-24 text-right">金額</th>
            <th className="border px-2 py-1 w-20 text-right">税額</th>
            <th className="border px-2 py-1 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1 text-center text-gray-400">{i + 1}</td>
              <td className="border px-1 py-1">
                <input
                  value={item.item_name}
                  onChange={(e) => updateItem(i, "item_name", e.target.value)}
                  className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-indigo-400 rounded"
                  placeholder="品名"
                  required
                />
              </td>
              <td className="border px-1 py-1">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-indigo-400 rounded text-right"
                />
              </td>
              <td className="border px-1 py-1">
                <input
                  value={item.unit}
                  onChange={(e) => updateItem(i, "unit", e.target.value)}
                  className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-indigo-400 rounded"
                />
              </td>
              <td className="border px-1 py-1">
                <input
                  type="number"
                  min={0}
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                  className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-indigo-400 rounded text-right"
                />
              </td>
              <td className="border px-1 py-1">
                <select
                  value={item.tax_rate}
                  onChange={(e) => updateItem(i, "tax_rate", Number(e.target.value))}
                  className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-indigo-400 rounded"
                >
                  <option value={10}>10%</option>
                  <option value={8}>8%</option>
                </select>
              </td>
              <td className="border px-2 py-1 text-right">&yen;{item.amount.toLocaleString()}</td>
              <td className="border px-2 py-1 text-right">&yen;{item.tax_amount.toLocaleString()}</td>
              <td className="border px-1 py-1 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        + 行を追加
      </button>

      <div className="mt-4 flex justify-end">
        <dl className="text-sm space-y-1 w-64">
          <div className="flex justify-between">
            <dt className="text-gray-500">小計</dt>
            <dd>&yen;{totals.subtotal.toLocaleString()}</dd>
          </div>
          {showTaxBreakdown && totals.tax10Total > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">消費税（10%対象）</dt>
              <dd>&yen;{totals.tax10Total.toLocaleString()}</dd>
            </div>
          )}
          {showTaxBreakdown && totals.tax8Total > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">消費税（8%対象）</dt>
              <dd>&yen;{totals.tax8Total.toLocaleString()}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">消費税合計</dt>
            <dd>&yen;{totals.taxTotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <dt>合計</dt>
            <dd>&yen;{totals.total.toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
