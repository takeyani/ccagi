"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Column = {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
};

type BatchAction = {
  label: string;
  variant?: "danger" | "default";
  onAction: (selectedIds: string[]) => void | Promise<void>;
};

type Props = {
  columns: Column[];
  data: Record<string, any>[];
  keyField?: string;
  editHref?: (item: any) => string;
  batchActions?: BatchAction[];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function DataTable({
  columns,
  data,
  keyField = "id",
  editHref,
  batchActions,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hasBatch = batchActions && batchActions.length > 0;

  const toggleAll = useCallback(() => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => String(item[keyField]))));
    }
  }, [data, keyField, selectedIds.size]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allChecked = data.length > 0 && selectedIds.size === data.length;
  const someChecked = selectedIds.size > 0;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* バッチアクションバー */}
      {hasBatch && someChecked && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-orange-700 font-medium">
            {selectedIds.size}件を選択中
          </span>
          <div className="flex gap-2">
            {batchActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.onAction(Array.from(selectedIds))}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  action.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 rounded-lg text-xs font-medium border hover:bg-gray-50"
            >
              選択解除
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {hasBatch && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    aria-label="全て選択"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {col.label}
                </th>
              ))}
              {editHref && <th className="px-4 py-3 w-20" />}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (editHref ? 1 : 0) + (hasBatch ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = String(item[keyField]);
                const checked = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${checked ? "bg-orange-50/50" : ""}`}
                  >
                    {hasBatch && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          aria-label={`${id}を選択`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render
                          ? col.render(item)
                          : String(item[col.key] ?? "")}
                      </td>
                    ))}
                    {editHref && (
                      <td className="px-4 py-3">
                        <Link
                          href={editHref(item)}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          編集
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
