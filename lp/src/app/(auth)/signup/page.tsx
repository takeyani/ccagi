import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata = { title: "新規登録" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>
        <Suspense fallback={<div className="text-center text-gray-400 py-4">読み込み中...</div>}>
          <SignupForm />
        </Suspense>
        <OAuthButtons />
        <div className="mt-6 pt-4 border-t text-center space-y-2">
          <p className="text-sm text-gray-500">
            アカウントをお持ちですか？{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ログイン
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            クリエイター・紹介者の方は{" "}
            <Link
              href="/affiliate"
              className="text-pink-600 hover:text-pink-800 font-medium"
            >
              こちらから登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
