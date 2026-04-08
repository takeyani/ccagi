import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata = { title: "ログイン" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-2">ログイン</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          メーカー・代理店・バイヤーの方
        </p>
        <Suspense fallback={<div className="text-center text-gray-400 py-4">読み込み中...</div>}>
          <LoginForm />
        </Suspense>
        <OAuthButtons />

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 text-center mb-3">アカウントをお持ちでない方</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: "🏭", label: "メーカー", href: "/signup?role=maker" },
              { icon: "🏢", label: "代理店", href: "/signup?role=agent" },
              { icon: "🛒", label: "バイヤー", href: "/signup?role=buyer" },
            ].map((r) => (
              <Link
                key={r.label}
                href={r.href}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-center"
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-xs font-medium text-gray-700">{r.label}</span>
                <span className="text-[10px] text-orange-600">新規登録</span>
              </Link>
            ))}
          </div>
          <Link
            href="/affiliate"
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-pink-200 bg-pink-50 hover:bg-pink-100 transition-all"
          >
            <span className="text-lg">🎨</span>
            <div className="text-left">
              <p className="text-xs font-medium text-pink-700">クリエイター・紹介者の方</p>
              <p className="text-[10px] text-pink-500">アフィリエイト登録はこちら</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
