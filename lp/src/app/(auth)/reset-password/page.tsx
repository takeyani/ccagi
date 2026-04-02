import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "新しいパスワードを設定" };

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-2">新しいパスワードを設定</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          8文字以上、英数字を含むパスワードを入力してください
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
