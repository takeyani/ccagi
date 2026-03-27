import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function EnrollmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: campaign } = await supabase
    .from("step_mail_campaigns")
    .select("name")
    .eq("id", id)
    .single();

  const { data: enrollments } = await supabase
    .from("step_mail_enrollments")
    .select("*, step_mail_logs(id, status, sent_at)")
    .eq("campaign_id", id)
    .order("enrolled_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href={`/admin/step-mail/${id}`} className="text-blue-600 hover:underline text-sm">&larr; キャンペーンに戻る</Link>
          <h1 className="text-2xl font-bold">{campaign?.name} - 登録者一覧</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">現在のステップ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">送信数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrollments?.map((enrollment) => {
              const logs = (enrollment.step_mail_logs || []) as { id: string; status: string; sent_at: string | null }[];
              const sentCount = logs.filter((l) => l.status === "sent").length;
              const statusColors: Record<string, string> = {
                active: "bg-green-100 text-green-800",
                completed: "bg-blue-100 text-blue-800",
                unsubscribed: "bg-red-100 text-red-800",
                paused: "bg-yellow-100 text-yellow-800",
                bounced: "bg-gray-100 text-gray-800",
              };
              return (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{enrollment.user_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{enrollment.user_name || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{enrollment.current_step}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[enrollment.status] || "bg-gray-100"}`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sentCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrolled_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              );
            })}
            {!enrollments?.length && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">登録者がいません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
