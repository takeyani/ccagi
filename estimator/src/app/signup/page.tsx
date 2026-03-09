import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            開発見積もりツール
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            新規アカウント登録
          </p>
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
          <p className="text-center text-sm text-gray-500 mt-4">
            既にアカウントをお持ちですか？{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
