import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "パスワードリセット" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-2">パスワードリセット</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          登録メールアドレスにリセットリンクを送信します
        </p>
        <ForgotPasswordForm />
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
