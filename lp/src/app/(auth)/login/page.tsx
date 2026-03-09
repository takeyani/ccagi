import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "ログイン" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        <LoginForm />
      </div>
    </div>
  );
}
