import { createSupabaseServerClient } from "@/lib/supabase/server";
import { acceptInvitation } from "./actions";

export const metadata = { title: "招待を受諾" };

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">無効なリンク</h1>
          <p className="text-gray-600">招待リンクが正しくありません。</p>
        </div>
      </div>
    );
  }

  // トークン検証
  const supabase = await createSupabaseServerClient();
  const { data: invitation } = await supabase
    .from("partner_invitations")
    .select("id, email, status, expires_at, partners(company_name)")
    .eq("token", token)
    .single();

  if (!invitation || invitation.status !== "招待中") {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">無効な招待</h1>
          <p className="text-gray-600">
            この招待は既に使用済み、または期限切れです。
          </p>
        </div>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">期限切れ</h1>
          <p className="text-gray-600">招待の有効期限が切れています。</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companyName = (invitation.partners as any)?.company_name ?? "";

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-2">メンバー登録</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {companyName} のメンバーとして登録します
        </p>

        <form action={acceptInvitation} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={invitation.email}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード *
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="6文字以上"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            登録してログイン
          </button>
        </form>
      </div>
    </div>
  );
}
