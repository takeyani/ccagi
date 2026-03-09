"use client";

import { useState } from "react";
import Link from "next/link";

type CalendarEvent = {
  id: string;
  date: string;
  label: string;
  type: "task" | "invoice_due" | "quote_due" | "delivery";
  link: string;
};

const typeColors: Record<string, string> = {
  task: "bg-blue-500",
  invoice_due: "bg-red-500",
  quote_due: "bg-orange-500",
  delivery: "bg-green-500",
};

const typeLabels: Record<string, string> = {
  task: "タスク",
  invoice_due: "請求期限",
  quote_due: "見積期限",
  delivery: "納品",
};

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarGrid({
  events,
  year: initYear,
  month: initMonth,
  basePath,
}: {
  events: CalendarEvent[];
  year: number;
  month: number;
  basePath: string;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = initYear;
  const month = initMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const list = eventsByDate.get(ev.date) ?? [];
    list.push(ev);
    eventsByDate.set(ev.date, list);
  }

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  return (
    <div>
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`${basePath}?year=${prevYear}&month=${prevMonth + 1}`}
          className="px-3 py-1 rounded-lg border hover:bg-gray-100 text-sm"
        >
          &larr; 前月
        </Link>
        <h2 className="text-lg font-bold">
          {year}年{month + 1}月
        </h2>
        <Link
          href={`${basePath}?year=${nextYear}&month=${nextMonth + 1}`}
          className="px-3 py-1 rounded-lg border hover:bg-gray-100 text-sm"
        >
          次月 &rarr;
        </Link>
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 mb-3 text-xs">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-gray-600">{typeLabels[type]}</span>
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 border-t border-l">
        {dayNames.map((d, i) => (
          <div
            key={d}
            className={`border-r border-b px-2 py-1 text-center text-xs font-medium ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            } bg-gray-50`}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b min-h-[80px] bg-gray-50" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayOfWeek = (firstDay + i) % 7;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`border-r border-b min-h-[80px] p-1 text-left hover:bg-blue-50 transition-colors ${
                isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-400" : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "bg-indigo-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center"
                    : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-gray-700"
                }`}
              >
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {dayEvents.slice(0, 4).map((ev) => (
                    <span
                      key={ev.id}
                      className={`inline-block w-2 h-2 rounded-full ${typeColors[ev.type]}`}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[10px] text-gray-400">+{dayEvents.length - 4}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択日のイベント一覧 */}
      {selectedDate && (
        <div className="mt-4 bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-sm mb-3">{selectedDate} のイベント</h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">イベントなし</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <a
                  key={ev.id}
                  href={ev.link}
                  className="flex items-center gap-2 text-sm hover:bg-gray-50 rounded-lg px-2 py-1.5"
                >
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${typeColors[ev.type]}`} />
                  <span className="text-gray-600 text-xs">{typeLabels[ev.type]}</span>
                  <span className="font-medium">{ev.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
