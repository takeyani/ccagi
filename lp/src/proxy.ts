import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/partner") || pathname.startsWith("/buyer");

  const response = NextResponse.next({ request });

  if (!isProtected) return response;

  // セッションからユーザー取得
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証 → ログインへ
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // admin client でロール取得（RLS回避）
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;

  // partner が /admin/* にアクセス → 自ポータルへ
  if (pathname.startsWith("/admin") && role !== "admin") {
    const dest = role === "buyer" ? "/buyer" : "/partner";
    const url = new URL(dest, request.url);
    url.searchParams.set("denied", "admin");
    return NextResponse.redirect(url);
  }

  // buyer が /partner/* にアクセス → /buyer へ
  if (pathname.startsWith("/partner") && role === "buyer") {
    const url = new URL("/buyer", request.url);
    url.searchParams.set("denied", "partner");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*", "/buyer/:path*"],
};
