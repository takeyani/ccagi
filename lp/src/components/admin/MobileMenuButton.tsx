"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

type NavItem = { href: string; label: string; icon: string };

export function MobileMenuButton({
  items,
  displayName,
}: {
  items: NavItem[];
  displayName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3 left-3 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="メニュー"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* オーバーレイ */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* モバイルサイドバー */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-40 transform transition-transform duration-200 overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-14 border-b border-gray-700">
          <h2 className="text-lg font-bold">管理ダッシュボード</h2>
          <p className="text-sm text-gray-400 mt-1">{displayName}</p>
        </div>
        <div onClick={() => setOpen(false)}>
          <Sidebar items={items} />
        </div>
        <div className="p-4 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
