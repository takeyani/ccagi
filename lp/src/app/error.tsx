"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
        <p className="text-sm text-gray-500 mb-6">
          ページの読み込み中に問題が発生しました。再試行するか、トップページに戻ってください。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
          >
            再試行
          </button>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            トップページ
          </Link>
        </div>
      </div>
    </div>
  );
}
