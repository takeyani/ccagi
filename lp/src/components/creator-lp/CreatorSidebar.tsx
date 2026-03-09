"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Affiliate } from "@/lib/types";

const navItems = [
  { href: "/creator", label: "ダッシュボード", icon: "📊" },
  { href: "/creator/designs", label: "デザイン一覧", icon: "🎨" },
  { href: "/creator/designs/new", label: "新規作成", icon: "➕" },
  { href: "/creator/collections", label: "コレクション", icon: "🗂️" },
  { href: "/creator/collections/new", label: "新規コレクション", icon: "📁" },
  { href: "/creator/analytics", label: "分析", icon: "📈" },
  { href: "/creator/profile", label: "プロフィール", icon: "👤" },
];

type Props = {
  affiliate: Affiliate;
};

export function CreatorSidebar({ affiliate }: Props) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("creator_code");
    window.location.href = "/creator";
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-bold">Creator LP</h2>
        <p className="mt-1 text-sm text-gray-400">{affiliate.name}</p>
        <p className="text-xs text-gray-500">{affiliate.code}</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/creator"
              ? pathname === "/creator"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
