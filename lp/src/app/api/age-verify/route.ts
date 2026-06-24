import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdult, parseDateOfBirth } from "@/lib/age";

const MIN_AGE = 20;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const dob = parseDateOfBirth(String(body.date_of_birth ?? ""));
  if (!dob) {
    return NextResponse.json(
      { error: "生年月日は YYYY-MM-DD 形式で入力してください" },
      { status: 400 }
    );
  }

  if (!isAdult(dob, MIN_AGE)) {
    return NextResponse.json(
      { verified: false, error: `${MIN_AGE}歳未満の方は年齢制限商品を購入できません` },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({
      date_of_birth: dob.toISOString().slice(0, 10),
      age_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ verified: true });
}
