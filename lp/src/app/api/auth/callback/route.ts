import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("redirect") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("OAuth callback - code present, exchange result:", error ? error.message : "success");
    if (!error) {
      // OAuth ユーザーの user_profiles を自動作成
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const admin = createAdminClient();
          const displayName =
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "ユーザー";
          await admin.from("user_profiles").upsert({
            id: user.id,
            display_name: displayName,
            role: "partner",
          });
        }
      }

      // ロール判定してリダイレクト
      if (next !== "/") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile?.role === "buyer") {
          return NextResponse.redirect(`${origin}/buyer`);
        } else {
          return NextResponse.redirect(`${origin}/partner`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // デバッグ: エラー時はクエリパラメータでエラー内容を表示
  const loginUrl = new URL("/login", origin);
  if (!code) {
    loginUrl.searchParams.set("error", "no_code");
  } else {
    loginUrl.searchParams.set("error", "exchange_failed");
  }
  return NextResponse.redirect(loginUrl.toString());
}
