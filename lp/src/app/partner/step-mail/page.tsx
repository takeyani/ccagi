import Link from "next/link";
import { requirePartnerId } from "@/lib/auth";

export default async function PartnerStepMailPage() {
  const { partnerId, supabase } = await requirePartnerId();

  const { data: campaigns } = await supabase
    .from("step_mail_campaigns")
    .select("*, step_mail_steps(count), step_mail_enrollments(count)")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ステップメール</h1>
        <Link
          href="/partner/step-mail/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規キャンペーン作成
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">キャンペーン名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">トリガー</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステップ数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">登録者数</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(campaigns ?? []).map((c: Record<string, unknown>) => (
              <tr key={c.id as string} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name as string}</td>
                <td className="px-4 py-3 text-gray-600">{c.trigger_event as string}</td>
                <td className="px-4 py-3 text-gray-600">
                  {((c.step_mail_steps as { count: number }[]) ?? [{ count: 0 }])[0]?.count ?? 0}通
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {((c.step_mail_enrollments as { count: number }[]) ?? [{ count: 0 }])[0]?.count ?? 0}人
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {c.is_active ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/partner/step-mail/${c.id}`} className="text-indigo-600 hover:underline text-sm">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
            {(!campaigns || campaigns.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  キャンペーンがまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">テンプレート変数</p>
        <p className="text-xs text-blue-700">
          メール本文で以下の変数が使えます:
          <code className="bg-blue-100 px-1 rounded mx-1">{"{{user_name}}"}</code>
          <code className="bg-blue-100 px-1 rounded mx-1">{"{{user_email}}"}</code>
          <code className="bg-blue-100 px-1 rounded mx-1">{"{{unsubscribe_url}}"}</code>
          + メタデータのキー
        </p>
      </div>
    </div>
  );
}
