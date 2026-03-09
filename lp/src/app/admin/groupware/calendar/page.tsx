import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarGrid } from "@/components/groupware/CalendarGrid";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();
  const month = sp.month ? parseInt(sp.month) - 1 : now.getMonth();

  const supabase = await createSupabaseServerClient();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-01`;

  const [
    { data: tasks },
    { data: invoices },
    { data: quotes },
    { data: slips },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date")
      .not("due_date", "is", null)
      .gte("due_date", startDate)
      .lt("due_date", endDate),
    supabase
      .from("invoices")
      .select("id, document_number, due_date")
      .not("due_date", "is", null)
      .gte("due_date", startDate)
      .lt("due_date", endDate),
    supabase
      .from("quotes")
      .select("id, document_number, valid_until")
      .not("valid_until", "is", null)
      .gte("valid_until", startDate)
      .lt("valid_until", endDate),
    supabase
      .from("delivery_slips")
      .select("id, document_number, delivery_date")
      .not("delivery_date", "is", null)
      .gte("delivery_date", startDate)
      .lt("delivery_date", endDate),
  ]);

  type CalendarEvent = {
    id: string;
    date: string;
    label: string;
    type: "task" | "invoice_due" | "quote_due" | "delivery";
    link: string;
  };

  const events: CalendarEvent[] = [
    ...(tasks?.map((t) => ({
      id: t.id,
      date: t.due_date!,
      label: t.title,
      type: "task" as const,
      link: "/admin/groupware/tasks",
    })) ?? []),
    ...(invoices?.map((i) => ({
      id: i.id,
      date: i.due_date!,
      label: i.document_number,
      type: "invoice_due" as const,
      link: `/admin/invoices/${i.id}`,
    })) ?? []),
    ...(quotes?.map((q) => ({
      id: q.id,
      date: q.valid_until!,
      label: q.document_number,
      type: "quote_due" as const,
      link: `/admin/quotes/${q.id}`,
    })) ?? []),
    ...(slips?.map((s) => ({
      id: s.id,
      date: s.delivery_date!,
      label: s.document_number,
      type: "delivery" as const,
      link: `/admin/delivery-slips/${s.id}`,
    })) ?? []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">カレンダー</h1>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <CalendarGrid
          events={events}
          year={year}
          month={month}
          basePath="/admin/groupware/calendar"
        />
      </div>
    </div>
  );
}
