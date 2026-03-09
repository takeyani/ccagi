"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function acceptInvitation(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) throw new Error("トークンとパスワードは必須です");
  if (password.length < 6) throw new Error("パスワードは6文字以上で入力してください");

  const supabase = await createSupabaseServerClient();

  // トークン検証
  const { data: invitation } = await supabase
    .from("partner_invitations")
    .select("id, partner_id, email, status, expires_at")
    .eq("token", token)
    .single();

  if (!invitation) throw new Error("無効な招待リンクです");
  if (invitation.status !== "招待中") throw new Error("この招待は既に使用済みまたは期限切れです");
  if (new Date(invitation.expires_at) < new Date()) throw new Error("招待の有効期限が切れています");

  // auth ユーザー作成
  const admin = createAdminClient();
  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // user_profiles 作成
  const { error: profileError } = await admin
    .from("user_profiles")
    .insert({
      id: authUser.user.id,
      role: "partner",
      partner_id: invitation.partner_id,
      display_name: invitation.email,
    });

  if (profileError) throw new Error(profileError.message);

  // 招待を「登録済み」に更新
  await admin
    .from("partner_invitations")
    .update({ status: "登録済み" })
    .eq("id", invitation.id);

  redirect("/login");
}
