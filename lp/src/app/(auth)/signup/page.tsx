import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata = { title: "新規登録" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-2">新規登録</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          出品・販売・購入するためのアカウントを作成
        </p>
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
          <Link
            href="/affiliate"
            className="flex items-center justify-center gap-2 mt-3 p-3 rounded-lg border border-pink-200 bg-pink-50 hover:bg-pink-100 transition-all"
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
