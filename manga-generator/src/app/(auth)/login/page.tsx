import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata: Metadata = { title: "ログイン" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">おかえりなさい</h1>
        <p className="text-slate-500 text-sm mt-1">アカウントにログイン</p>
      </div>
      <Suspense fallback={<div className="text-center text-slate-400">読み込み中...</div>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">新規登録</Link>
      </p>
    </div>
  );
}
