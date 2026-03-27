import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StepMailPage() {
  const supabase = await createSupabaseServerClient();

  const { data: campaigns } = await supabase
    .from("step_mail_campaigns")
    .select(`
      *,
      step_mail_steps (id),
      step_mail_enrollments (id, status)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ステップメール</h1>
        <Link
          href="/admin/step-mail/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規キャンペーン
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">トリガー</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステップ数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録者数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns?.map((campaign) => {
              const enrollments = (campaign.step_mail_enrollments || []) as { id: string; status: string }[];
              const steps = (campaign.step_mail_steps || []) as { id: string }[];
              const active = enrollments.filter((e) => e.status === "active").length;
              return (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.trigger_event}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{steps.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {enrollments.length}（アクティブ: {active}）
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${campaign.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {campaign.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link href={`/admin/step-mail/${campaign.id}`} className="text-blue-600 hover:underline">編集</Link>
                    <Link href={`/admin/step-mail/${campaign.id}/enrollments`} className="text-blue-600 hover:underline">登録者</Link>
                  </td>
                </tr>
              );
            })}
            {!campaigns?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  キャンペーンがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
