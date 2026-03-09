import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requirePartnerId } from "@/lib/auth";
import { invitePartnerMember, cancelInvitation } from "./actions";

export default async function MembersPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // 現メンバー一覧
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id, display_name, role, created_at")
    .eq("partner_id", partnerId)
    .order("created_at");

  // 招待中一覧
  const { data: invitations } = await supabase
    .from("partner_invitations")
    .select("id, email, status, expires_at, created_at")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">メンバー管理</h1>

      {/* 現メンバー */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">メンバー一覧</h2>
        {members && members.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">表示名</th>
                <th className="pb-2">ロール</th>
                <th className="pb-2">登録日</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2">{m.display_name || "(未設定)"}</td>
                  <td className="py-2">{m.role}</td>
                  <td className="py-2">
                    {new Date(m.created_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">メンバーがいません</p>
        )}
      </div>

      {/* 招待中一覧 */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">招待一覧</h2>
        {invitations && invitations.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">メールアドレス</th>
                <th className="pb-2">ステータス</th>
                <th className="pb-2">有効期限</th>
                <th className="pb-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="py-2">{inv.email}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        inv.status === "招待中"
                          ? "bg-yellow-100 text-yellow-800"
                          : inv.status === "登録済み"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2">
                    {new Date(inv.expires_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="py-2">
                    {inv.status === "招待中" && (
                      <form action={cancelInvitation.bind(null, inv.id)}>
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          キャンセル
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">招待はありません</p>
        )}
      </div>

      {/* 招待フォーム */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-md">
        <h2 className="text-lg font-bold mb-4">メンバーを招待</h2>
        <form action={invitePartnerMember} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="member@example.com"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm"
          >
            招待を送信
          </button>
        </form>
      </div>
    </div>
  );
}
