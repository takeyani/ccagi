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
        <div className="mt-6 pt-4 border-t text-center space-y-2">
          <p className="text-sm text-gray-500">
            アカウントをお持ちでないですか？{" "}
            <Link
              href="/signup"
              className="text-indigo-600 hover:text-indigo-800"
            >
              新規登録
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            クリエイター・紹介者の方は{" "}
            <Link
              href="/affiliate"
              className="text-pink-600 hover:text-pink-800 font-medium"
            >
              こちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
