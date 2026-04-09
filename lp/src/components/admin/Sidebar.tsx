"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };
type NavGroup = { title: string; items: NavItem[] };

export function Sidebar({ items, groups }: { items?: NavItem[]; groups?: NavGroup[] }) {
  const pathname = usePathname();

  // groups が渡された場合はグループ表示、互換のため items だけならフラット表示
  const renderItem = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
          isActive
            ? "bg-orange-600/90 text-white shadow-sm"
            : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        }`}
      >
        <span>{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  if (groups) {
    return (
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {g.title}
            </p>
            <div className="space-y-0.5">{g.items.map(renderItem)}</div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {(items ?? []).map(renderItem)}
    </nav>
  );
}
