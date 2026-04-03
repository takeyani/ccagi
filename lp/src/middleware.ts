import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/partner") || pathname.startsWith("/buyer");

  let response = NextResponse.next({ request });

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

  if (!isProtected) return response;

  // 未認証 → ログインへ
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ロール取得
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // partner が /admin/* にアクセス → 自ポータルへ（アクセス拒否通知付き）
  if (pathname.startsWith("/admin") && role !== "admin") {
    const dest = role === "buyer" ? "/buyer" : "/partner";
    const url = new URL(dest, request.url);
    url.searchParams.set("denied", "admin");
    return NextResponse.redirect(url);
  }

  // buyer が /partner/* にアクセス → /buyer へ（アクセス拒否通知付き）
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
