"use client";

import { useState } from "react";
import { markAllNotificationsRead } from "@/lib/notifications";

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell({
  notifications,
  unreadCount,
  userId,
  notificationsPath,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  userId: string;
  notificationsPath: string;
}) {
  const [open, setOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState(unreadCount);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId);
    setLocalUnread(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-gray-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {localUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {localUnread > 99 ? "99+" : localUnread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-semibold text-sm">通知</span>
              <div className="flex gap-2">
                {localUnread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    すべて既読にする
                  </button>
                )}
                <a
                  href={notificationsPath}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  すべて表示
                </a>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-400 text-center">
                通知はありません
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link ?? "#"}
                    className={`block px-3 py-2.5 text-sm hover:bg-gray-50 border-b last:border-b-0 ${
                      !n.is_read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <p className={`${!n.is_read ? "font-medium" : "text-gray-700"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{n.body}</p>
                    )}
                    <p className="text-gray-400 text-[10px] mt-0.5">
                      {new Date(n.created_at).toLocaleString("ja-JP")}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
