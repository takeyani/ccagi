import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-bold text-center mb-2">CAD Viewer</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          IFC 3Dビューアにログイン
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-sm text-center mt-4 text-gray-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
