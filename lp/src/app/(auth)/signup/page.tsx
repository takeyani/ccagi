import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "新規登録" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>
        <SignupForm />
        <p className="text-center text-sm text-gray-500 mt-4">
          アカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
