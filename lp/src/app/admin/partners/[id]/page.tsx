import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePartner, deletePartner, addPartnerMember } from "../actions";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .single();

  if (!partner) notFound();

  // メンバー一覧取得
  const { data: members } = await supabase
    .from("user_profiles")
    .select("id, display_name, role, created_at")
    .eq("partner_id", id)
    .order("created_at");

  // メンバーのメールアドレスを取得するため auth.users は直接取得できないので
  // user_profiles の id を使って表示

  const updateWithId = updatePartner.bind(null, id);
  const deleteWithId = deletePartner.bind(null, id);
  const addMemberWithId = addPartnerMember.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">取引先 編集</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名 *
              </label>
              <input
                name="company_name"
                required
                defaultValue={partner.company_name}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メール
              </label>
              <input
                name="email"
                type="email"
                defaultValue={partner.email ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <input
                name="contact_name"
                defaultValue={partner.contact_name ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                name="phone"
                defaultValue={partner.phone ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種別
              </label>
              <select
                name="partner_type"
                defaultValue={partner.partner_type}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="メーカー">メーカー</option>
                <option value="代理店">代理店</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                認証ステータス
              </label>
              <select
                name="certification_status"
                defaultValue={partner.certification_status}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="未認証">未認証</option>
                <option value="認証済み">認証済み</option>
                <option value="期限切れ">期限切れ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                認証番号
              </label>
              <input
                name="certification_number"
                defaultValue={partner.certification_number ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                認証有効期限
              </label>
              <input
                name="certification_expiry"
                type="date"
                defaultValue={partner.certification_expiry ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                name="postal_code"
                defaultValue={partner.postal_code ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支払条件
              </label>
              <input
                name="payment_terms"
                defaultValue={partner.payment_terms ?? ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              住所
            </label>
            <input
              name="address"
              defaultValue={partner.address ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              name="memo"
              rows={3}
              defaultValue={partner.memo ?? ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="hidden"
            name="parent_partner_id"
            value={partner.parent_partner_id ?? ""}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              更新
            </button>
          </div>
        </form>
        <form action={deleteWithId} className="mt-4">
          <button
            type="submit"
            className="text-red-600 hover:text-red-800 text-sm"
          >
            この取引先を削除
          </button>
        </form>
      </div>

      {/* メンバー一覧 */}
      <h2 className="text-xl font-bold mt-10 mb-4">メンバー一覧</h2>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
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

        {/* メンバー追加フォーム */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-bold mb-3">メンバー追加</h3>
          <form action={addMemberWithId} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  メールアドレス *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  パスワード *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                表示名
              </label>
              <input
                name="display_name"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="省略時はメールアドレスが使用されます"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              追加
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
