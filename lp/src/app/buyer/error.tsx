"use client";

export default function SectionError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">読み込みエラー</h2>
        <p className="text-sm text-gray-500 mb-4">ページの表示中に問題が発生しました。</p>
        <button onClick={reset} className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium">
          再試行
        </button>
      </div>
    </div>
  );
}
