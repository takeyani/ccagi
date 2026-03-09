import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TaskStatusBadge } from "@/components/groupware/TaskStatusBadge";

export default async function AdminTasksPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, user_profiles!tasks_assigned_to_fkey(display_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">タスク管理</h1>
        <Link
          href="/admin/groupware/tasks/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <div className="space-y-2">
        {tasks?.map((t) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const assignee = (t.user_profiles as any)?.display_name ?? "未割当";
          return (
            <Link
              key={t.id}
              href={`/admin/groupware/tasks/${t.id}`}
              className="block bg-white rounded-2xl border shadow-sm p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    担当: {assignee}
                    {t.due_date && ` | 期限: ${t.due_date}`}
                  </p>
                </div>
                <TaskStatusBadge status={t.status} priority={t.priority} />
              </div>
            </Link>
          );
        })}
        {!tasks?.length && (
          <p className="text-gray-400">タスクはありません</p>
        )}
      </div>
    </div>
  );
}
