import { requirePartnerId } from "@/lib/auth";
import { TaskStatusBadge } from "@/components/groupware/TaskStatusBadge";
import { updatePartnerTaskStatus } from "./actions";

export default async function PartnerTasksPage() {
  const { partnerId, supabase, profile } = await requirePartnerId();

  // Get tasks assigned to this user or partner
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .or(
      `assigned_to.eq.${profile.id},assigned_partner_id.eq.${partnerId}`
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">タスク</h1>
      <div className="space-y-2">
        {tasks?.map((t) => {
          const updateStatus = updatePartnerTaskStatus.bind(null, t.id);
          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t.title}</h3>
                  {t.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t.description}
                    </p>
                  )}
                  {t.due_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      期限: {t.due_date}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <TaskStatusBadge status={t.status} priority={t.priority} />
                  <form action={updateStatus} className="flex gap-1">
                    <select
                      name="status"
                      defaultValue={t.status}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      変更
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
        {!tasks?.length && <p className="text-gray-400">タスクはありません</p>}
      </div>
    </div>
  );
}
