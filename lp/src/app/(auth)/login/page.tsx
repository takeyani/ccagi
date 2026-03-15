import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "ログイン" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        <Suspense fallback={<div className="text-center text-gray-400 py-4">読み込み中...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-gray-500 mt-4">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-800"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
