"use client";

/**
 * 画面モックアップ — 各ステップの画面イメージを表示するコンポーネント
 * title: ブラウザタブに表示する名前
 * children: モックアップの中身
 */
export function ScreenMockup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 mb-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white max-w-xl">
      {/* ブラウザ風ヘッダー */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded text-xs text-gray-400 px-3 py-1 truncate">
          {title}
        </div>
      </div>
      {/* 画面コンテンツ */}
      <div className="text-xs">{children}</div>
    </div>
  );
}

/* ── 共通パーツ ── */

export function MockSidebar({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="w-36 bg-gray-900 text-white p-3 shrink-0">
      <div className="font-bold text-[10px] mb-3 text-gray-300">単品決済ロットLP</div>
      {items.map((item) => (
        <div
          key={item}
          className={`text-[10px] py-1.5 px-2 rounded mb-0.5 ${
            item === active ? "bg-gray-700 text-white" : "text-gray-400"
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export function MockTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <table className="w-full text-[10px]">
      <thead>
        <tr className="bg-gray-50 border-b">
          {headers.map((h) => (
            <th key={h} className="text-left px-2 py-1.5 font-medium text-gray-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b last:border-0">
            {row.map((cell, j) => (
              <td key={j} className="px-2 py-1.5 text-gray-600">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MockBadge({
  label,
  color = "gray",
}: {
  label: string;
  color?: "gray" | "blue" | "green" | "red" | "yellow" | "purple" | "pink";
}) {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}

export function MockButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
        primary ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

export function MockStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
      <div className="text-[9px] text-gray-400">{label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

export function MockFormField({ label, placeholder, type }: { label: string; placeholder?: string; type?: "input" | "textarea" | "select" }) {
  return (
    <div className="mb-2">
      <div className="text-[9px] font-medium text-gray-600 mb-0.5">{label}</div>
      {type === "textarea" ? (
        <div className="w-full h-8 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[9px] text-gray-300">
          {placeholder}
        </div>
      ) : type === "select" ? (
        <div className="w-full h-5 bg-gray-50 border border-gray-200 rounded px-2 flex items-center text-[9px] text-gray-400">
          {placeholder} ▾
        </div>
      ) : (
        <div className="w-full h-5 bg-gray-50 border border-gray-200 rounded px-2 flex items-center text-[9px] text-gray-300">
          {placeholder}
        </div>
      )}
    </div>
  );
}
